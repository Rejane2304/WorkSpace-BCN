import jwt from "jsonwebtoken"

export function verifyToken(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ mensaje: "No hay token, acceso denegado" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ mensaje: "Token no válido" })
  }
}

export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ mensaje: "Acceso denegado, se requiere rol de administrador" })
  }
  next()
}
