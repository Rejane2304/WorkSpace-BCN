import express from "express"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/perfil", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener perfil", error: error.message })
  }
})

router.put("/perfil", verifyToken, async (req, res) => {
  try {
    const { password, ...rest } = req.body

    const updateData = {}
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() !== "") {
        updateData[key] = value
      } else if (typeof value !== "string" && value !== undefined && value !== null) {
        updateData[key] = value
      }
    })

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password.trim(), salt)
      updateData.password = hashedPassword
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar perfil", error: error.message })
  }
})

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: "cliente" }).select("-password")
    res.json(customers)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener clientes", error: error.message })
  }
})

router.get("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-password")
    if (!customer) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener cliente", error: error.message })
  }
})

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { password, ...rest } = req.body

    const updateData = {
      ...rest,
    }

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password.trim(), salt)
      updateData.password = hashedPassword
    }

    const customer = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password")
    if (!customer) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar cliente", error: error.message })
  }
})

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(req.params.id)
    if (!customer) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" })
    }
    res.json({ mensaje: "Cliente eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar cliente", error: error.message })
  }
})

export default router
