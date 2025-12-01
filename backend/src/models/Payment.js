import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  paymentMethod: {
    type: String,
    enum: ["tarjeta", "paypal", "transferencia", "efectivo"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "EUR",
  },
  transactionId: String,
  paymentDetails: {
    last4Digits: String,
    cardType: String,
    paypalEmail: String,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  errorMessage: String,
})

export default mongoose.model("Payment", paymentSchema, "payments")
