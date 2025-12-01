import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    user: {
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
        name: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String,
    },
  paymentMethod: {
    type: String,
    enum: ["tarjeta", "paypal", "transferencia"],
    default: "tarjeta",
  },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Order", orderSchema, "orders")
