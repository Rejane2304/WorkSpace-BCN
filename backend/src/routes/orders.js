import { devWarn, devError } from "../utils/devlog.js"
import express from "express"
import Sale from "../models/Sale.js"
import Product from "../models/Product.js"
import InventoryMovement from "../models/InventoryMovement.js"
import Order from "../models/Order.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

const SHIPPING_COST = Number(process.env.SHIPPING_COST || 0)
const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}
const SALE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  PAID: "paid",
}

function normalizeOrderItems(body) {
  const rawItems = body.items || body.productos || []
  if (!Array.isArray(rawItems)) return null
  return rawItems.map((item) => ({
    product: item.product || item.producto,
    quantity: item.quantity ?? item.cantidad,
    unitPrice: item.unitPrice ?? item.precioUnitario,
  }))
}

function normalizeShippingAddress(rawAddress) {
  if (!rawAddress) return null
  return {
    street: rawAddress.street ?? rawAddress.calle,
    city: rawAddress.city ?? rawAddress.ciudad,
    postalCode: rawAddress.postalCode ?? rawAddress.codigoPostal,
    country: rawAddress.country ?? rawAddress.pais,
    phone: rawAddress.phone ?? rawAddress.telefono,
  }
}

export function calculateTotals(items) {
  return items.reduce(
    (acc, item) => {
      acc.subtotal += (item.unitPrice || 0) * (item.quantity || 0)
      return acc
    },
    { subtotal: 0 },
  )
}

async function registerInventoryMovements(movements, userId, saleId) {
  for (const movement of movements) {
    await InventoryMovement.create({
      product: movement.product,
      type: "salida",
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      reason: `Salida asociada al pedido ${saleId}`,
      user: userId,
      sale: saleId,
    })
  }
}

router.post("/", verifyToken, async (req, res) => {
  try {
    const items = normalizeOrderItems(req.body)
    const shippingAddress = normalizeShippingAddress(req.body.shippingAddress)
    const { paymentMethod, paymentDetails } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      devWarn("[orders] Validation failed - items missing or empty", { userId: req.user?.id, items })
      return res.status(400).json({ mensaje: "La orden debe incluir al menos un producto" })
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.postalCode) {
      devWarn("[orders] Validation failed - shippingAddress incomplete", {
        userId: req.user?.id,
        shippingAddress,
      })
      return res.status(400).json({ mensaje: "La dirección de envío está incompleta" })
    }

    const inventoryMovements = []
    const enrichedProducts = []

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        devWarn("[orders] Validation failed - invalid line item", { userId: req.user?.id, item })
        return res.status(400).json({ mensaje: "Cada línea debe tener producto y cantidad mayor que cero" })
      }

      const product = await Product.findById(item.product)
      if (!product) {
        devWarn("[orders] Validation failed - product not found", { productId: item.product, userId: req.user?.id })
        return res.status(404).json({ mensaje: `Producto ${item.product} no encontrado` })
      }

      if (product.stock < item.quantity) {
        devWarn("[orders] Validation failed - insufficient stock", {
          productId: product._id,
          requested: item.quantity,
          available: product.stock,
          userId: req.user?.id,
        })
        return res.status(400).json({ mensaje: `Stock insuficiente para ${product.name}` })
      }

      const stockAnterior = product.stock
      const stockNuevo = stockAnterior - item.quantity
      product.stock = stockNuevo
      await product.save()

      inventoryMovements.push({
        product: product._id,
        quantity: item.quantity,
        previousStock: stockAnterior,
        newStock: stockNuevo,
      })

      enrichedProducts.push({
        ...item,
        name: product.name,
      })
    }

    const { subtotal } = calculateTotals(items)
    const shippingCost = subtotal > 50 || subtotal === 0 ? 0 : SHIPPING_COST
    const total = subtotal + shippingCost

    const newSale = new Sale({
      customer: req.user.id,
      items: enrichedProducts,
      total,
      shippingAddress,
      status: SALE_STATUS.PENDING,
    })
    await newSale.save()

    const order = new Order({
      sale: newSale._id,
      user: req.user.id,
      items: enrichedProducts,
      shippingAddress,
      paymentMethod: paymentMethod || "tarjeta",
      paymentDetails: paymentDetails || {},
      shippingCost: shippingCost,
      total,
      status: ORDER_STATUS.PENDING,
    })
    await order.save()

    await registerInventoryMovements(inventoryMovements, req.user.id, newSale._id)

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("sale")
      .populate({
        path: "items.product",
        select: "name image",
      })

    res.status(201).json({ order: populatedOrder, saleId: newSale._id })
  } catch (error) {
    devError("Error creando orden:", error)
    devError("[orders] POST / failed", error)
    res.status(500).json({ mensaje: "Error al crear la orden", error: error.message })
  }
})

router.post("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "items.product",
      model: "Product",
    })
    if (!order) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" })
    }

    const isOwner = order.user.toString() === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      return res.status(400).json({ mensaje: "El pedido ya fue cancelado" })
    }
    if (
      order.status === ORDER_STATUS.SHIPPED ||
      order.status === ORDER_STATUS.DELIVERED
    ) {
      return res.status(400).json({ 
        mensaje: "No se puede cancelar un pedido que ya fue enviado " + "o entregado" 
      })
    }

    const sale = await Sale.findById(order.sale)
    for (const item of order.items) {
      const product = item.product
      if (!product) continue

      const productToUpdate = await Product.findById(product._id)
      if (!productToUpdate) continue

      const previousStock = productToUpdate.stock
      productToUpdate.stock = previousStock + (item.quantity || 0)
      await productToUpdate.save()

      await InventoryMovement.create({
        product: productToUpdate._id,
        type: "entrada",
        quantity: item.quantity,
        previousStock,
        newStock: productToUpdate.stock,
        reason: `Reversión del pedido ${order._id}`,
        user: req.user.id,
        sale: order.sale,
      })
  }

    order.status = ORDER_STATUS.CANCELLED
    await order.save()

    if (sale) {
      sale.status = SALE_STATUS.CANCELLED
      await sale.save()
    }

    res.json({ mensaje: "Pedido cancelado", order })
  } catch (error) {
    devError("Error cancelando orden:", error)
    res.status(500).json({ mensaje: "Error al cancelar el pedido", error: error.message })
  }
})

router.get("/me", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("sale")
      .populate({
        path: "items.product",
        select: "name image price",
      })
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pedidos", error: error.message })
  }
})

router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pedidos", error: error.message })
  }
})

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("sale")
      .populate("user", "name email")
      .populate({
        path: "items.product",
        model: "Product",
        select: "name image",
      })

    if (!order) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" })
    }

    const usuarioIdFromOrder =
      order.user?._id?.toString?.() ?? order.user?.toString?.() ?? order.sale?.customer?.toString?.()
    const isAdmin = req.user.role === "admin"

    if (!usuarioIdFromOrder || (!isAdmin && usuarioIdFromOrder !== req.user.id)) {
      return res.status(403).json({ mensaje: "Acceso denegado al pedido" })
    }

    res.json({ order })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el pedido", error: error.message })
  }
})

export default router
