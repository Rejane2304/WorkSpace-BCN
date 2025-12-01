import express from "express"
import ContactMessage from "../models/ContactMessage.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ mensaje: "Nombre, email, asunto y mensaje son obligatorios" })
    }

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    })

    await contactMessage.save()

    res.status(201).json({
      mensaje: "Mensaje de contacto recibido correctamente",
    })
  } catch (error) {
    console.error("Error al guardar mensaje de contacto:", error)
    res.status(500).json({ mensaje: "Error al enviar mensaje de contacto", error: error.message })
  }
})

export default router
