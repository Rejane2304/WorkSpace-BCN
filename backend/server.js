import { devLog, devError } from "./src/utils/devlog.js"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDatabase } from "./config/database.js"
import { initSocket } from "./socket.js"

import productsRoutes from "./src/routes/products.js"
import customersRoutes from "./src/routes/customers.js"
import salesRoutes from "./src/routes/sales.js"
import authRoutes from "./src/routes/auth.js"
import paymentsRoutes from "./src/routes/payments.js"
import inventoryRoutes from "./src/routes/inventory.js"
import profileImageRoutes from "./src/routes/profileImage.js"
import contactRoutes from "./src/routes/contact.js"
import adminAlertsRoutes from "./src/routes/adminAlerts.js"
import ordersRoutes from "./src/routes/orders.js"

dotenv.config()

const app = express()


app.use(cors()) 
app.use(express.json()) 

if (process.env.NODE_ENV !== "test") {
  connectDatabase()
}

app.use("/api/auth", authRoutes)
app.use("/api/products", productsRoutes)
app.use("/api/customers", customersRoutes)
app.use("/api/sales", salesRoutes)
app.use("/api/payments", paymentsRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/profile-image", profileImageRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/admin", adminAlertsRoutes)
app.use("/api/orders", ordersRoutes)

app.get("/", (req, res) => {
  res.json({ mensaje: "API de WorkSpaceBCN funcionando" })
})

let server = null;
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  server = app.listen(PORT, () => {
    devLog(` Servidor corriendo en http://localhost:${PORT}`);
  });
  
  initSocket(server);

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      devError(
        ` El puerto ${PORT} ya está en uso. Cierra el proceso en ese puerto o ejecuta con PORT=otro_puerto (p.ej. PORT=5001).`
      );
      process.exit(1);
    }
    throw err;
  });
}

export { app as default, server }
