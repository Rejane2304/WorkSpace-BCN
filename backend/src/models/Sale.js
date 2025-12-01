import mongoose from "mongoose"

const saleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "paid"],
    default: "pending",
  },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Sale", saleSchema, "sales")
