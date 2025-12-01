import express from "express"
import Sale from "../models/Sale.js"
import Product from "../models/Product.js"
import InventoryMovement from "../models/InventoryMovement.js"
import Payment from "../models/Payment.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name email")
      .populate("items.product", "name price image")

    const totalRevenue = sales.reduce((sum, sale) => sum + (typeof sale.total === "number" ? sale.total : 0), 0)
    const totalOrders = sales.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const statusCounts = sales.reduce(
      (acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1
        return acc
      },
      {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        paid: 0,
      },
    )

    const paymentMethods = await Payment.aggregate([
      {
        $group: {
          _id: "$metodoPago",
          total: { $sum: "$monto" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])

    const customerTotals = sales.reduce((acc, sale) => {
      const customerKey = sale.customer?.email || "Cliente sin email"
      acc[customerKey] =
        acc[customerKey] || { name: sale.customer?.name || "Sin nombre", total: 0 }
      acc[customerKey].total += sale.total || 0
      acc[customerKey].count = (acc[customerKey].count || 0) + 1
      return acc
    }, {})

      const topCustomers = Object.entries(customerTotals)
        .map(([email, info]) => ({ email, name: info.name, total: info.total, count: info.count }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)

    res.json({
      ventas: sales,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        statusCounts,
        paymentMethods,
        topCustomers,
      },
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener ventas", error: error.message })
  }
})

router.get("/mis-compras", verifyToken, async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.user.id }).populate("items.product", "name price image")
    res.json(sales)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener compras", error: error.message })
  }
})

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ mensaje: "Administradores no pueden realizar compras" })
    }
    const { items, shippingAddress } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ mensaje: "La venta debe incluir al menos un producto" })
    }

    for (const item of items) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({ mensaje: "Cada línea de la venta debe tener producto y cantidad" })
      }
      if (typeof item.quantity !== "number" || Number.isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ mensaje: "La cantidad debe ser un número mayor que 0" })
      }
    }

    let total = 0
    const inventoryMovements = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ mensaje: `Producto ${item.product} no encontrado` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ mensaje: `Stock insuficiente para ${product.name}` })
      }

      total += product.price * item.quantity

      const stockAnterior = product.stock
      const stockNuevo = product.stock - item.quantity

      product.stock = stockNuevo
      await product.save()

      inventoryMovements.push({
        product: product._id,
        quantity: item.quantity,
        previousStock: stockAnterior,
        newStock: stockNuevo,
      })
    }

    const newSale = new Sale({
      customer: req.user.id,
      items,
      total,
      shippingAddress,
    })

    await newSale.save()

    for (const movement of inventoryMovements) {
      await InventoryMovement.create({
        product: movement.product,
        type: "salida",
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: `Salida de stock por venta ${newSale._id}`,
        user: req.user.id,
        sale: newSale._id,
      })
    }

    res.status(201).json(newSale)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear venta", error: error.message })
  }
})

  router.put("/:id/estado", verifyToken, isAdmin, async (req, res) => {
    try {
      const { status } = req.body

      const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "paid"]
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ mensaje: "Estado de venta no válido" })
      }
      const sale = await Sale.findById(req.params.id)

      if (!sale) {
        return res.status(404).json({ mensaje: "Venta no encontrada" })
      }

      if (sale.status === "cancelled" && status !== "cancelled") {
        return res
          .status(400)
          .json({ mensaje: "No se puede modificar una venta que ya está cancelada" })
      }

      if (status === "cancelled" && sale.status !== "cancelled") {
        for (const item of sale.items) {
        const product = await Product.findById(item.product)
        if (!product) {

          continue
        }

        const stockAnterior = product.stock
        const stockNuevo = product.stock + item.quantity

        product.stock = stockNuevo
        await product.save()

        await InventoryMovement.create({
          product: product._id,
          type: "devolucion",
          quantity: item.quantity,
          previousStock: stockAnterior,
          newStock: stockNuevo,
          reason: `Devolución de stock por cancelación de venta ${sale._id}`,
          user: req.user.id,
          sale: sale._id,
        })
      }
    }

    sale.status = status
    await sale.save()

    res.json(sale)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar venta", error: error.message })
  }
})

export default router
