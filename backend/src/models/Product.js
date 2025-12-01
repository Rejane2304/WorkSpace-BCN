import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Informática", "Oficina", "Audiovisual"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 2,
  },
  minStock: {
    type: Number,
    default: 2,
  },
  maxStock: {
    type: Number,
    default: 10,
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Product", productSchema, "products")
