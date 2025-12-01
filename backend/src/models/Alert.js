import mongoose from "mongoose"

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["venta", "pago"],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  referenceModel: {
    type: String,
    required: true,
    enum: ["Sale", "Payment"],
  },
  title: {
    type: String,
    required: true,
  },
  message: String,
  link: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    default: "media",
    enum: ["alta", "media", "baja"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Alert", alertSchema, "alerts")
