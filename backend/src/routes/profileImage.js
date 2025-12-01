import express from "express"
import multer from "multer"
import { verifyToken } from "../middleware/auth.js"
import { uploadImage } from "../../config/cloudinary.js"

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
})

router.post("/upload", verifyToken, upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se recibió ninguna imagen" })
    }

    const base64 = Buffer.from(req.file.buffer).toString("base64")
    const dataURI = `data:${req.file.mimetype};base64,${base64}`

    const imageUrl = await uploadImage(dataURI, "Perfil", {
      fileName: req.file.originalname,
    })

    res.json({ url: imageUrl, mensaje: "Imagen de perfil subida correctamente" })
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error)
    res.status(500).json({ mensaje: "Error al subir imagen de perfil", error: error.message })
  }
})

export default router
