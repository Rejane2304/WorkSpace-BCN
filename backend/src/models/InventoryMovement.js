import mongoose from "mongoose"

const inventoryMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: {
    type: String,
    enum: ["entrada", "salida", "ajuste", "devolucion"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  reason: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("InventoryMovement", inventoryMovementSchema, "inventorymovements")
