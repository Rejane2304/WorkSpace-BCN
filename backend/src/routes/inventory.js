import express from "express"
import Product from "../models/Product.js"
import InventoryMovement from "../models/InventoryMovement.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/movements", verifyToken, isAdmin, async (req, res) => {
  try {
    const { productId, type, limit = 50 } = req.query

    const query = {}
    if (productId) query.product = productId
    if (type) query.type = type

    const movements = await InventoryMovement.find(query)
      .populate("product", "name")
      .populate("user", "name email")
      .sort({ date: -1 })
      .limit(Number.parseInt(limit) || 50)

    res.json(movements)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener movimientos", error: error.message })
  }
})

router.post("/movements", verifyToken, isAdmin, async (req, res) => {
  try {
const { productId, type, quantity, reason } = req.body

    if (!productId) {
      return res.status(400).json({ mensaje: "El producto es obligatorio" })
    }

    const allowedTypes = ["entrada", "salida", "ajuste", "devolucion"]
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ mensaje: "El tipo de movimiento no es válido" })
    }

    if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ mensaje: "La cantidad debe ser un número mayor que 0" })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }

    const previousStock = product.stock
    let newStock = previousStock

    if (type === "entrada" || type === "devolucion") {
      newStock = previousStock + quantity
    } else if (type === "salida") {
      newStock = previousStock - quantity
      if (newStock < 0) {
        return res.status(400).json({ mensaje: "Stock insuficiente" })
      }
    } else if (type === "ajuste") {
      newStock = quantity 
    }

    product.stock = newStock
    await product.save()

        const movement = new InventoryMovement({
          product: productId,
          type,
          quantity: Math.abs(newStock - previousStock),
          previousStock,
          newStock,
          reason,
          user: req.user.id,
        })

    await movement.save()

    res.status(201).json({
      mensaje: "Movimiento registrado exitosamente",
      movimiento: movement,
      productoActualizado: product,
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar movimiento", error: error.message })
  }
})

router.get("/low-stock", verifyToken, isAdmin, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).sort({ stock: 1 })

    res.json(lowStockProducts)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos con stock bajo", error: error.message })
  }
})

router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$minStock"] },
    })
    const outOfStockProducts = await Product.countDocuments({ stock: 0 })

    const products = await Product.find()
    const totalInventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)

    const recentMovements = await InventoryMovement.countDocuments({
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      recentMovements,
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener estadísticas", error: error.message })
  }
})

router.get("/overview", verifyToken, isAdmin, async (req, res) => {
  try {
    const { limit } = req.query
    const DEFAULT_LIMIT = 5
    const MAX_LIMIT = 20

    let limitValue = DEFAULT_LIMIT
    if (typeof limit !== "undefined") {
      const parsedLimit = Number.parseInt(limit, 10)
      if (!Number.isNaN(parsedLimit)) {
        if (parsedLimit === 0) {
          limitValue = null
        } else {
          limitValue = Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
        }
      }
    }

    const [totalProducts, stockAggregation] = await Promise.all([
      Product.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
            avgStock: { $avg: "$stock" },
          },
        },
      ]),
    ])

    let lowStockProductsQuery = Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    })
      .sort({ stock: 1 })
    if (limitValue !== null) {
      lowStockProductsQuery = lowStockProductsQuery.limit(limitValue)
    }

    let outOfStockProductsQuery = Product.find({ stock: 0 })
      .sort({ name: 1 })
    if (limitValue !== null) {
      outOfStockProductsQuery = outOfStockProductsQuery.limit(limitValue)
    }

    const [lowStockProducts, outOfStockProducts] = await Promise.all([
      lowStockProductsQuery,
      outOfStockProductsQuery,
    ])

    const totalStock = stockAggregation[0]?.totalStock || 0
    const avgStock = Math.round(stockAggregation[0]?.avgStock || 0)

    res.json({
      totalProducts,
      totalStock,
      avgStock,
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product._id,
        name: product.name,
        stock: product.stock,
        minStock: product.minStock,
      })),
      outOfStockProducts: outOfStockProducts.map((product) => ({
        id: product._id,
        name: product.name,
        stock: product.stock,
        minStock: product.minStock,
      })),
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener overview de inventario", error: error.message })
  }
})

export default router
