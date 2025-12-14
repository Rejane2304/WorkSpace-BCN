import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { uploadImage } from "../../config/cloudinary.js"

const router = express.Router()

async function handleRegister(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      postalCode,
      image: imageData,
      imageName,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ mensaje: "El campo 'nombre' es obligatorio." })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ mensaje: "El campo 'email' es obligatorio." })
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ mensaje: "El campo 'contraseña' es obligatorio." })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ mensaje: "El usuario ya existe" })
    }

    let imageUrl = null
    if (imageData) {
      if (imageData.startsWith("http")) {
        imageUrl = imageData
      } else if (process.env.NODE_ENV === "test") {
        imageUrl = imageData
      } else {
        try {
          imageUrl = await uploadImage(imageData, "Perfil", { fileName: imageName })
        } catch (error) {
          return res.status(500).json({ mensaje: "Error al subir la imagen de perfil", error: error.message })
        }
      }
    }

    const userData = {}
    if (name && name.trim() !== "") userData.name = name
    if (email && email.trim() !== "") userData.email = email
    if (password && password.trim() !== "") userData.password = password
    if (phone && phone.trim() !== "") userData.phone = phone
    if (address && address.trim() !== "") userData.address = address
    if (city && city.trim() !== "") userData.city = city
    if (postalCode && postalCode.trim() !== "") userData.postalCode = postalCode
    if (imageUrl) userData.image = imageUrl

    const newUser = new User(userData)
    try {
      await newUser.save()
    } catch (saveError) {
      return res.status(500).json({ mensaje: "Error al guardar usuario en la base de datos", error: saveError.message })
    }

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        postalCode: newUser.postalCode,
        image: newUser.image,
        imagen: newUser.image, 
      },
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message })
  }
}

router.post("/register", handleRegister)
router.post("/registro", handleRegister)

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ mensaje: "Credenciales inválidas" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ mensaje: "Credenciales inválidas" })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        imagen: user.image, 
      },
    })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión", error: error.message })
  }
})

export default router
