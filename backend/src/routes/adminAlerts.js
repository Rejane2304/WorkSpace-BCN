import express from "express"
import { verifyToken, isAdmin } from "../middleware/auth.js"
import Product from "../models/Product.js"
import Alert from "../models/Alert.js"
import Sale from "../models/Sale.js"
import Payment from "../models/Payment.js"

const router = express.Router()

router.get("/alerts", verifyToken, isAdmin, async (req, res) => {
  try {
    const [lowStockProducts, alertDocuments] = await Promise.all([
      Product.find({
        $expr: { $lte: ["$stock", "$minStock"] },
      })
        .select("name stock minStock")
        .sort({ stock: 1 })
        .limit(3),
      Alert.find().sort({ createdAt: -1 }).limit(60),
    ])

    const alertaStock = lowStockProducts.map((product) => ({
      _id: product._id,
      nombre: product.name,
      stock: product.stock,
      stockMinimo: product.minStock,
    }))

    const alertsByType = alertDocuments.reduce(
      (acc, alertDoc) => ({
        ...acc,
        [alertDoc.type]: (acc[alertDoc.type] || 0) + 1,
      }),
      {},
    )

    const alertaCatalog = alertDocuments.map((alertDoc) => ({
      alertId: alertDoc._id,
      id: alertDoc.referenceId,
      tipo: alertDoc.type,
      referencia: alertDoc.referenceModel,
      titulo: alertDoc.title,
      mensaje: alertDoc.message,
      link: alertDoc.link,
      priority: alertDoc.priority || "media",
    }))

    res.json({
      pendingSalesCount: alertsByType.venta || 0,
      pendingPaymentsCount: alertsByType.pago || 0,
      lowStockProducts: alertaStock,
      alertas: alertaCatalog,
      counterByCard: {
        ventas: alertsByType.venta || 0,
        pagos: alertsByType.pago || 0,
        productos: lowStockProducts.length,
      },
      contadorAlertas: alertaCatalog.length,
      ultimaActualizacion: alertDocuments[0]?.createdAt || new Date(),
    })
  } catch (error) {
    console.error("Error al obtener alertas del admin:", error)
    res.status(500).json({ mensaje: "Error al obtener alertas", error: error.message })
  }
})

router.get("/alerts/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const alertDoc = await Alert.findById(req.params.id)
    if (!alertDoc) {
      return res.status(404).json({ mensaje: "Alerta no encontrada" })
    }

    let detail = null
    if (alertDoc.referenceModel === "Sale") {
      detail = await Sale.findById(alertDoc.referenceId)
        .populate("customer", "name email")
        .populate("items.product", "name price image")
    } else if (alertDoc.referenceModel === "Payment") {
      detail = await Payment.findById(alertDoc.referenceId).populate({
        path: "sale",
        populate: {
          path: "customer",
          select: "name email",
        },
      })
    }

    res.json({
      alert: {
        alertId: alertDoc._id,
        tipo: alertDoc.type,
        referencia: alertDoc.referenceModel,
        titulo: alertDoc.title,
        mensaje: alertDoc.message,
        link: alertDoc.link,
        priority: alertDoc.priority || "media",
      },
      detail,
    })
  } catch (error) {
    console.error("Error al obtener detalle de alerta:", error)
    res.status(500).json({ mensaje: "Error al obtener alerta", error: error.message })
  }
})
export default router
