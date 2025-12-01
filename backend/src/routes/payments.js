import express from "express"
import Payment from "../models/Payment.js"
import Sale from "../models/Sale.js"
import Order from "../models/Order.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"
import { PAYMENT_STATUS_TRANSLATIONS, toEnglishStatus } from "../utils/translation.js"

const router = express.Router()

const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
}

const SALE_STATUS = {
  PENDING: "pending",
  PAID: "paid",
}


router.post("/", verifyToken, async (req, res) => {
  try {
    const { saleId, orderId, paymentMethod, paymentDetails } = req.body

    if (!saleId) {
      return res.status(400).json({ mensaje: "La venta es obligatoria para procesar el pago" })
    }

    const allowedMethods = ["tarjeta", "paypal", "transferencia", "efectivo"]
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ mensaje: "El método de pago no es válido" })
    }

    const sale = await Sale.findById(saleId)
    if (!sale) {
      return res.status(404).json({ mensaje: "Venta no encontrada" })
    }

    if (sale.customer.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: "No autorizado" })
    }

    const order = orderId ? await Order.findById(orderId) : null
    if (order && order.user.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: "Orden no pertenece al usuario" })
    }

    const forceSuccess =
      process.env.NODE_ENV === "test" ||
      process.env.FORCE_PAYMENT_SUCCESS === "true" ||
      process.env.NODE_ENV === "development"
    const isPaymentSuccessful = forceSuccess || Math.random() > 0.1

    const newPayment = new Payment({
      sale: saleId,
      order: order?._id,
      paymentMethod,
      amount: sale.total,
      status: isPaymentSuccessful ? "completed" : "failed",
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      paymentDetails,
      errorMessage: isPaymentSuccessful ? null : "Error en el procesamiento del pago",
    })

    await newPayment.save()

    if (isPaymentSuccessful) {
      sale.status = SALE_STATUS.PAID
      if (order) {
        order.status = ORDER_STATUS.PAID
        await order.save()
      }
    }
    await sale.save()

    res.status(201).json({
      mensaje: isPaymentSuccessful ? "Pago procesado exitosamente" : "Error en el pago",
      payment: newPayment,
      success: isPaymentSuccessful,
    })
  } catch (error) {
    console.error("Error al procesar pago:", error)
    res.status(500).json({ mensaje: "Error al procesar pago", error: error.message })
  }
})

router.get("/mis-pagos", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "sale",
        match: { customer: req.user.id },
      })
      .sort({ paymentDate: -1 })

    const filteredPayments = payments.filter((payment) => payment.sale !== null)

    res.json(filteredPayments)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pagos", error: error.message })
  }
})

router.get("/admin", verifyToken, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "sale",
        populate: {
          path: "customer",
          select: "name email",
        },
      })
      .sort({ paymentDate: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pagos", error: error.message })
  }
})

router.put("/:id/estado", verifyToken, isAdmin, async (req, res) => {
  try {
    const rawStatus = req.body.status ?? req.body.estado
    const normalizedStatus = toEnglishStatus(rawStatus, PAYMENT_STATUS_TRANSLATIONS, rawStatus)

    const allowedStatuses = ["pending", "processing", "completed", "failed", "refunded"]
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ mensaje: "Estado de pago no válido" })
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: normalizedStatus },
      { new: true },
    ).populate({
      path: "sale",
      populate: {
        path: "customer",
        select: "name email",
      },
    })

    if (!payment) {
      return res.status(404).json({ mensaje: "Pago no encontrado" })
    }

    res.json(payment)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pago", error: error.message })
  }
})

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("sale")

    if (!payment) {
      return res.status(404).json({ mensaje: "Pago no encontrado" })
    }

    if (req.user.role !== "admin" && payment.sale.customer.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: "No autorizado" })
    }

    res.json(payment)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pago", error: error.message })
  }
})

export default router
