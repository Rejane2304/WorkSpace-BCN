import express from "express"
import multer from "multer"
import Product from "../models/Product.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"
import { uploadImage } from "../../config/cloudinary.js"
import { getIO } from "../../socket.js"

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
})

router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos", error: error.message })
  }
})

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== "string") {
      return res.json([])
    }

    const regex = new RegExp(q, "i")
    const products = await Product.find({ name: regex })

    res.json(products)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar productos", error: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener producto", error: error.message })
  }
})

router.post("/upload", verifyToken, isAdmin, upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se recibió ninguna imagen" })
    }

    const categoria = req.body.categoria || "Informática"

    console.log(
      `Petición de subida de imagen recibida en /api/products/upload - categoria="${categoria}", mimetype="${
        req.file.mimetype
      }", size=${req.file.size} bytes`,
    )

    const base64 = Buffer.from(req.file.buffer).toString("base64")
    const dataURI = `data:${req.file.mimetype};base64,${base64}`

    const imageUrl = await uploadImage(dataURI, categoria, {
      fileName: req.file.originalname,
    })
    res.json({ url: imageUrl, mensaje: "Imagen subida exitosamente" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al subir imagen", error: error.message })
  }
})

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const allowedCategories = ["Informática", "Oficina", "Audiovisual"]
    const fields = ["category", "name", "description", "price", "stock", "minStock", "maxStock", "image"]
    const data = {}
    fields.forEach((key) => {
      const value = req.body[key]
      if (typeof value === "string" && value.trim() !== "") data[key] = value
      else if (typeof value === "number" && !Number.isNaN(value)) data[key] = value
    })

    const { name, price, category, stock, minStock, maxStock } = data

    if (!name || typeof name !== "string") {
      console.warn("[products] validation failed - missing name", { body: req.body })
      return res.status(400).json({ mensaje: "El nombre del producto es obligatorio" })
    }
    if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
      console.warn("[products] validation failed - invalid price", { body: req.body })
      return res.status(400).json({ mensaje: "El precio debe ser un número mayor que 0" })
    }
    if (!category || !allowedCategories.includes(category)) {
      console.warn("[products] validation failed - invalid category", { category })
      return res.status(400).json({ mensaje: "La categoría no es válida" })
    }
    if (stock != null && (typeof stock !== "number" || stock < 0)) {
      console.warn("[products] validation failed - invalid stock", { stock })
      return res.status(400).json({ mensaje: "El stock no puede ser negativo" })
    }
    if (minStock != null && (typeof minStock !== "number" || minStock < 0)) {
      console.warn("[products] validation failed - invalid minStock", { minStock })
      return res.status(400).json({ mensaje: "El stock mínimo no puede ser negativo" })
    }
    if (maxStock != null && (typeof maxStock !== "number" || maxStock < 0)) {
      console.warn("[products] validation failed - invalid maxStock", { maxStock })
      return res.status(400).json({ mensaje: "El stock máximo no puede ser negativo" })
    }
    if (
      typeof minStock === "number" &&
      typeof maxStock === "number" &&
      maxStock < minStock
    ) {
      console.warn("[products] validation failed - maxStock < minStock", { minStock, maxStock })
      return res.status(400).json({ mensaje: "El stock máximo no puede ser menor que el stock mínimo" })
    }
    const newProduct = new Product(data)
    await newProduct.save()
    try { getIO().emit("productsUpdated"); } catch (e) {}
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto", error: error.message })
  }
})

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, category, stock, minStock, maxStock } = req.body

    if (name != null && name.trim().length === 0) {
      return res.status(400).json({ mensaje: "El nombre del producto no puede estar vacío" })
    }

    if (price != null) {
      if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
        return res.status(400).json({ mensaje: "El precio debe ser un número mayor que 0" })
      }
    }

    const allowedCategories = ["Informática", "Oficina", "Audiovisual"]
    if (category != null && !allowedCategories.includes(category)) {
      return res.status(400).json({ mensaje: "La categoría no es válida" })
    }

    if (stock != null && (typeof stock !== "number" || stock < 0)) {
      return res.status(400).json({ mensaje: "El stock no puede ser negativo" })
    }

    if (minStock != null && (typeof minStock !== "number" || minStock < 0)) {
      return res.status(400).json({ mensaje: "El stock mínimo no puede ser negativo" })
    }

    if (maxStock != null && (typeof maxStock !== "number" || maxStock < 0)) {
      return res.status(400).json({ mensaje: "El stock máximo no puede ser negativo" })
    }

    if (
      typeof minStock === "number" &&
      typeof maxStock === "number" &&
      maxStock < minStock
    ) {
      return res.status(400).json({ mensaje: "El stock máximo no puede ser menor que el stock mínimo" })
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }
    try { getIO().emit("productsUpdated"); } catch (e) {}
    res.json(product)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto", error: error.message })
  }
})

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }
    try { getIO().emit("productsUpdated"); } catch (e) {}
    res.json({ mensaje: "Producto eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto", error: error.message })
  }
})

export default router
