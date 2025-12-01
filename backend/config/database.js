import { devLog, devError } from "../src/utils/devlog.js"
import path from "path"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const options = {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000, 
}

export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/workspacebcn_test"
    const conn = await mongoose.connect(uri, options)
    devLog(`MongoDB Atlas conectado: ${conn.connection.host}`)
    return conn
  } catch (error) {
    devError("Error de conexión a MongoDB Atlas:", error.message)
    process.exit(1) 
  }
}

export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close()
    devLog("Desconectado de MongoDB Atlas")
  } catch (error) {
    devError("Error al desconectar:", error.message)
  }
}

mongoose.connection.on("disconnected", () => {
  devLog("MongoDB Atlas desconectado")
})

mongoose.connection.on("error", (error) => {
  devError("Error en MongoDB Atlas:", error.message)
})

export default { connectDatabase, disconnectDatabase }
