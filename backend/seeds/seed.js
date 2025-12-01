function devLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args)
  }
}
function devWarn(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(...args)
  }
}
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../src/models/User.js"
import Product from "../src/models/Product.js"
import Sale from "../src/models/Sale.js"
import Order from "../src/models/Order.js"
import Payment from "../src/models/Payment.js"
import InventoryMovement from "../src/models/InventoryMovement.js"
import ContactMessage from "../src/models/ContactMessage.js"
import Alert from "../src/models/Alert.js"
import { uploadImage } from "../config/cloudinary.js"
import cloudinary from "../config/cloudinary.js"
import { toEnglishStatus, SALE_STATUS_TRANSLATIONS, ORDER_STATUS_TRANSLATIONS, PAYMENT_STATUS_TRANSLATIONS } from "../src/utils/translation.js"

const USER_HEADERS_ORDER = ["name", "email", "password", "role", "phone", "address", "city", "postalCode"]
const PRODUCT_HEADERS_ORDER = ["category", "name", "description", "price", "stock", "minStock", "maxStock", "image"]
const SALES_HEADERS_ORDER = [
  "customerName",
  "customerEmail",
  "phone",
  "productNames",
  "status",
  "addressStreet",
  "addressCity",
  "addressPostal",
  "quantities",
  "price",
  "total",
]
const ORDER_HEADERS_ORDER = [
  "saleIndex",
  "customerEmail",
  "items",
  "shippingStreet",
  "shippingCity",
  "shippingPostal",
  "shippingCost",
  "paymentMethod",
  "status",
  "total",
]
const PAYMENT_HEADERS_ORDER = [
  "saleIndex",
  "orderIndex",
  "customerEmail",
  "paymentMethod",
  "status",
  "amount",
  "transactionId",
]
const INVENTORY_HEADERS_ORDER = [
  "saleIndex",
  "productName",
  "quantity",
  "type",
  "previousStock",
  "newStock",
  "reason",
  "userEmail",
]
const CONTACT_HEADERS_ORDER = ["name", "email", "phone", "subject", "message"]
const ALERTS_HEADERS_ORDER = [
  "type",
  "referenceModel",
  "referenceIndex",
  "status",
  "title",
  "message",
  "link",
  "priority",
]

dotenv.config()


const warnings = []

function pushWarning(section, message) {
  warnings.push(`[${section}] ${message}`)
}

function parseNumber(value, fallback = 0) {
  const number = Number(String(value || "").trim())
  return Number.isNaN(number) ? fallback : number
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase()
}

function sanitizeFolderName(value = "general") {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return normalized
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "general"
}

const CATEGORY_ENUM_MAP = {
  informatica: "Informática",
  "informatica": "Informática",
  oficina: "Oficina",
  audiovisual: "Audiovisual",
}

function normalizeCategoryForEnum(value = "Informática") {
  const cleaned = (value || "Informática").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return CATEGORY_ENUM_MAP[cleaned.toLowerCase()] || "Informática"
}

function mapRow(headers, values) {
  const row = {}
  headers.forEach((header, index) => {
    row[header] = values[index] || ""
  })
  return row
}

function parseCSV(filePath, expectedHeaders) {
  if (!fs.existsSync(filePath)) {
    devWarn(`Archivo CSV no encontrado: ${filePath}`)
    return { headers: [], rows: [] }
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const delimiter = ","
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""))
  
  const rows = lines.slice(1).map((line) => {
    const row = []
    let current = ""
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim().replace(/^"|"$/g, ""))
        current = ""
      } else {
        current += char
      }
    }
    row.push(current.trim().replace(/^"|"$/g, ""))
    return row
  })

  return { headers, rows }
}

function validateCSVIntegrity() {
  const errors = []

  const userData = parseCSV(path.join("./data", "users.csv"), USER_HEADERS_ORDER)
  const productData = parseCSV(path.join("./data", "products.csv"), PRODUCT_HEADERS_ORDER)
  const saleData = parseCSV(path.join("./data", "sales.csv"), SALES_HEADERS_ORDER)
  const orderData = parseCSV(path.join("./data", "orders.csv"), ORDER_HEADERS_ORDER)
  const paymentData = parseCSV(path.join("./data", "payments.csv"), PAYMENT_HEADERS_ORDER)
  const inventoryData = parseCSV(
    path.join("./data", "inventory_movements.csv"),
    INVENTORY_HEADERS_ORDER,
  )
  const alertData = parseCSV(path.join("./data", "alerts.csv"), ALERTS_HEADERS_ORDER)

  const normalizedUserEmails = new Set()
  userData.rows.forEach((row, index) => {
    const email = normalizeEmail(row[USER_HEADERS_ORDER.indexOf("email")])
    if (!email) {
      errors.push(`users.csv fila ${index + 2}: email vacío`)
      return
    }
    if (normalizedUserEmails.has(email)) {
      errors.push(`users.csv fila ${index + 2}: email duplicado (${email})`)
    } else {
      normalizedUserEmails.add(email)
    }
  })

  const productNameSet = new Set()
  productData.rows.forEach((row) => {
    const name = (row[PRODUCT_HEADERS_ORDER.indexOf("name")] || "").trim().toLowerCase()
    if (name) productNameSet.add(name)
  })

  const saleCount = saleData.rows.length
  saleData.rows.forEach((row, index) => {
    const emailIndex = SALES_HEADERS_ORDER.indexOf("customerEmail")
    const email = normalizeEmail(row[emailIndex])
    if (!normalizedUserEmails.has(email)) {
      errors.push(`sales.csv fila ${index + 2}: cliente no encontrado (${email})`)
    }

    const productNames = (row[SALES_HEADERS_ORDER.indexOf("productNames")] || "")
      .split("|")
      .map((value) => (value || "").trim().toLowerCase())
      .filter(Boolean)
    productNames.forEach((productName) => {
      if (!productNameSet.has(productName)) {
        errors.push(`sales.csv fila ${index + 2}: producto no encontrado (${productName})`)
      }
    })
  })

  const orderCount = orderData.rows.length
  orderData.rows.forEach((row, index) => {
    const saleIndex = parseNumber(row[ORDER_HEADERS_ORDER.indexOf("saleIndex")], 0)
    if (saleIndex < 1 || saleIndex > saleCount) {
      errors.push(`orders.csv fila ${index + 2}: saleIndex inválido (${saleIndex})`)
    }
  })

  paymentData.rows.forEach((row, index) => {
    const saleIndex = parseNumber(row[PAYMENT_HEADERS_ORDER.indexOf("saleIndex")], 0)
    const orderIndex = parseNumber(row[PAYMENT_HEADERS_ORDER.indexOf("orderIndex")], 0)
    if (saleIndex < 1 || saleIndex > saleCount) {
      errors.push(`payments.csv fila ${index + 2}: saleIndex inválido (${saleIndex})`)
    }
    if (orderIndex < 1 || orderIndex > orderCount) {
      errors.push(`payments.csv fila ${index + 2}: orderIndex inválido (${orderIndex})`)
    }
  })

  inventoryData.rows.forEach((row, index) => {
    const saleIndex = row[INVENTORY_HEADERS_ORDER.indexOf("saleIndex")].trim()
    const productName = (row[INVENTORY_HEADERS_ORDER.indexOf("productName")] || "")
      .trim()
      .toLowerCase()
    if (saleIndex) {
      const parsedIndex = parseNumber(saleIndex, 0)
      if (parsedIndex < 1 || parsedIndex > saleCount) {
        errors.push(
          `inventory_movements.csv fila ${index + 2}: saleIndex inválido (${saleIndex})`,
        )
      }
    }
    if (!productNameSet.has(productName)) {
      errors.push(`inventory_movements.csv fila ${index + 2}: producto no encontrado (${productName})`)
    }
  })

  alertData.rows.forEach((row, index) => {
    const refModel = row[ALERTS_HEADERS_ORDER.indexOf("referenceModel")]
    const refIndex = parseNumber(row[ALERTS_HEADERS_ORDER.indexOf("referenceIndex")], 0)
    if (refModel === "Sale") {
      if (refIndex < 1 || refIndex > saleCount) {
        errors.push(`alerts.csv fila ${index + 2}: referencia Sale inválida (${refIndex})`)
      }
    } else if (refModel === "Payment") {
      if (refIndex < 1 || refIndex > paymentData.rows.length) {
        errors.push(`alerts.csv fila ${index + 2}: referencia Payment inválida (${refIndex})`)
      }
    } else {
      errors.push(`alerts.csv fila ${index + 2}: referenceModel inválido (${refModel})`)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Validación de CSV fallida:\n${errors.join("\n")}`)
  }
}

async function seedDatabase() {

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    devLog("Conectado a MongoDB")

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      InventoryMovement.deleteMany({}),
      ContactMessage.deleteMany({}),
      Alert.deleteMany({})
    ])
    devLog("Iniciando proceso de sembrado...")
    validateCSVIntegrity()
    devLog("Validación de CSV completada")

    try {
      const folders = [
        "WorkSpaceBCN/Products/Informatica",
        "WorkSpaceBCN/Products/Oficina",
        "WorkSpaceBCN/Products/Audiovisual",
        "WorkSpaceBCN/Perfil"
      ];
      for (const folder of folders) {
        const resources = await cloudinary.api.resources({
          type: "upload",
          prefix: folder + "/",
          max_results: 500
        });
        if (resources.resources && resources.resources.length > 0) {
          const publicIds = resources.resources.map(r => r.public_id);
          if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
            devLog(`Imágenes eliminadas en Cloudinary carpeta: ${folder}`);
          }
        }
      }
    } catch (err) {
      devWarn("No se pudieron limpiar imágenes de Cloudinary:", err.message);
    }

    const collectionsToClear = [
      User,
      Product,
      Sale,
      Order,
      Payment,
      InventoryMovement,
      ContactMessage,
      Alert,
    ]
    await Promise.all(collectionsToClear.map((Model) => Model.deleteMany({})))
    devLog("Colecciones limpiadas")

    devLog("\n Sembrando usuarios...")
    const { headers: userHeaders, rows: userRows } = parseCSV(path.join("./data", "users.csv"), USER_HEADERS_ORDER)
    const createdUsers = []
    const userByEmail = new Map()

    for (const [index, rowValues] of userRows.entries()) {
      const row = mapRow(userHeaders, rowValues)
      const user = {
        name: row.name?.trim(),
        email: row.email?.trim(),
        password: row.password,
        role: row.role?.trim() || "cliente",
        phone: row.phone?.trim(),
        address: row.address?.trim(),
        city: row.city?.trim(),
        postalCode: row.postalCode?.trim(),
      }

      if (!user.name) {
        devWarn(`Usuario sin nombre en users.csv (fila ${index + 2})`)
        continue
      }

      const created = new User(user)
      await created.save()
      createdUsers.push(created)
      const normalizedEmail = normalizeEmail(created.email)
      if (normalizedEmail) {
        userByEmail.set(normalizedEmail, created)
      }
      devLog(`Usuario creado: ${created.name} (${created.email})`)
    }

    devLog("\n Sembrando productos...")
    const createdProducts = []
    const productByName = new Map()
    const { headers: productHeaders, rows: productRows } = parseCSV(path.join("./data", "products.csv"), PRODUCT_HEADERS_ORDER)

    for (const rowValues of productRows) {
      const row = mapRow(productHeaders, rowValues)
      const categoryValue = row.category || "Informática"
      const folderCategory = sanitizeFolderName(categoryValue)
      const categoryForEnum = normalizeCategoryForEnum(categoryValue)
      let imageUrl = row.image

      if (imageUrl) {
        try {
          const imageFileName = imageUrl.replace(/^\//, "")
          const imagePath = path.join("./public/assets", imageFileName)

          if (fs.existsSync(imagePath)) {
            devLog(
              ` Subiendo imagen local "${imageFileName}" a Cloudinary (carpeta: ${folderCategory})`,
            )
            imageUrl = await uploadImage(imagePath, categoryValue, {
              fileName: imageFileName,
            })
          } else {
            try {
              devLog(
                ` Imagen local no encontrada en ${imagePath}, creando placeholder y subiendo a Cloudinary`,
              )
              const placeholderName = imageFileName.replace(/\.[^.]+$/, "") + "-placeholder.svg"
              const placeholderPath = path.join("./public/assets", placeholderName)

              const assetsDir = path.dirname(placeholderPath)
              if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

              const safeText = (row.name || imageFileName).replace(/</g, "&lt;").replace(/>/g, "&gt;")
              const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n` +
                `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">\n` +
                `<rect width="100%" height="100%" fill="#E8D5C4"/>\n` +
                `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" fill="#2C3E50">${safeText}</text>\n` +
                `</svg>`

              fs.writeFileSync(placeholderPath, svgContent, "utf-8")

              imageUrl = await uploadImage(placeholderPath, categoryValue, {
                fileName: imageFileName,
              })
            } catch (err) {
              devWarn(` No se pudo generar/subir placeholder para ${imageUrl}: ${err.message}`)
              imageUrl = row.image
            }
          }
        } catch (error) {
          devWarn(` Error subiendo imagen ${imageUrl}: ${error.message}`)
        }
      }

      const priceValue = Number.parseFloat(row.price) || 0
      const csvStock = parseNumber(row.stock)
      const csvMinStock = parseNumber(row.minStock)
      const csvMaxStock = parseNumber(row.maxStock)

      const product = new Product({
        category: categoryForEnum,
        name: row.name,
        description: row.description,
        price: priceValue,
        stock: csvStock,
        minStock: csvMinStock,
        maxStock: csvMaxStock,
        image: imageUrl,
      })

      await product.save()
      createdProducts.push(product)
      const normalizedProductName = (product.name || "").trim().toLowerCase()
      if (normalizedProductName) {
        productByName.set(normalizedProductName, product)
      }
      devLog(`   ✓ Producto creado: ${product.name}`)
    }

    devLog("\n Sembrando ventas...")
    const { headers: salesHeaders, rows: saleRows } = parseCSV(path.join("./data", "sales.csv"), SALES_HEADERS_ORDER)
    const createdSales = []
    const saleItemsByIndex = new Map()

    for (const [index, rowValues] of saleRows.entries()) {
      const rowIndex = index + 2
      const row = mapRow(salesHeaders, rowValues)
      const customerEmail = normalizeEmail(row.customerEmail)
      const customer = userByEmail.get(customerEmail)

      if (!customer) {
        pushWarning("sales", `fila ${rowIndex}: cliente ${row.customerEmail} no encontrado`)
        continue
      }

      const productNames =
        (row.productNames || "")
          .split("|")
          .map((value) => value.trim())
          .filter(Boolean) || []

      const quantities =
        (row.quantities || "")
          .split("|")
          .map((value) => parseNumber(value, 1))
          .filter((value) => value > 0) || []

      const saleProducts = []
      let totalCalculated = 0

      for (let i = 0; i < productNames.length; i++) {
        const productName = productNames[i]
        const normalizedProductName = productName.toLowerCase()
        const product = productByName.get(normalizedProductName)

        if (!product) {
          pushWarning("sales", `fila ${rowIndex}: producto "${productName}" no encontrado`)
          continue
        }

        const quantity = quantities[i] || 1
        saleProducts.push({
          product: product._id,
          quantity,
          unitPrice: product.price,
        })
        totalCalculated += product.price * quantity
      }

      if (!saleProducts.length) {
        pushWarning("sales", `fila ${rowIndex}: no se pudieron asociar productos válidos`)
        continue
      }

      const saleStatus = toEnglishStatus(row.status, SALE_STATUS_TRANSLATIONS, "pending")
      const saleTotal = parseNumber(row.total, totalCalculated)

      const sale = new Sale({
        customer: customer._id,
        items: saleProducts,
        total: saleTotal,
        status: saleStatus,
        shippingAddress: {
          street: row.addressStreet,
          city: row.addressCity,
          postalCode: row.addressPostal,
        },
      })

      await sale.save()
      createdSales.push(sale)
      saleItemsByIndex.set(createdSales.length, saleProducts.map((item) => ({ ...item })))
      devLog(` Venta creada para: ${customer.name} - Total: €${saleTotal.toFixed(2)}`)
    }

    devLog("\n Sembrando órdenes...")
    const ORDER_STATUS_MAP = {
      pendiente: "PENDING",
      procesando: "PENDING",
      enviado: "SHIPPED",
      entregado: "DELIVERED",
      pagado: "PAID",
      cancelado: "CANCELLED",
      processing: "PENDING",
      completed: "PAID",
      shipped: "SHIPPED",
      delivered: "DELIVERED",
      cancelled: "CANCELLED",
    }
    const { headers: orderHeaders, rows: orderRows } = parseCSV(path.join("./data", "orders.csv"), ORDER_HEADERS_ORDER)
    const createdOrders = []

    for (const [index, rowValues] of orderRows.entries()) {
      const rowIndex = index + 2
      const row = mapRow(orderHeaders, rowValues)
      const saleIndex = parseNumber(row.saleIndex, 0)
      const saleDoc = createdSales[saleIndex - 1]

      if (!saleDoc) {
        pushWarning("orders", `fila ${rowIndex}: referencia a la venta ${saleIndex} no encontrada`)
        continue
      }

      const order = new Order({
        sale: saleDoc._id,
        user: saleDoc.customer,
        items: saleItemsByIndex.get(saleIndex) || saleDoc.items,
        shippingAddress: {
          street: row.shippingStreet,
          city: row.shippingCity,
          postalCode: row.shippingPostal,
        },
        paymentMethod: row.paymentMethod || "tarjeta",
        paymentDetails: {},
        shippingCost: parseNumber(row.shippingCost, 0),
        total: parseNumber(row.total, saleDoc.total),
        
        status: toEnglishStatus(row.status, ORDER_STATUS_TRANSLATIONS, "PENDING"),
      })
      await order.save()
      createdOrders.push(order)
      devLog(` Orden creada para venta ${saleIndex} (${saleDoc.customer})`)
    }

    devLog("\n Sembrando pagos...")
    const { headers: paymentHeaders, rows: paymentRows } = parseCSV(path.join("./data", "payments.csv"), PAYMENT_HEADERS_ORDER)
    const createdPayments = []

    for (const [index, rowValues] of paymentRows.entries()) {
      const rowIndex = index + 2
      const row = mapRow(paymentHeaders, rowValues)
      const saleIndex = parseNumber(row.saleIndex, 0)
      const orderIndex = parseNumber(row.orderIndex, 0)
      const saleDoc = createdSales[saleIndex - 1]
      const orderDoc = createdOrders[orderIndex - 1]

      if (!saleDoc) {
        pushWarning("payments", `fila ${rowIndex}: venta ${saleIndex} no encontrada`)
        continue
      }

      if (!orderDoc) {
        pushWarning("payments", `fila ${rowIndex}: orden ${orderIndex} no encontrada`)
        continue
      }

      const payment = new Payment({
        sale: saleDoc._id,
        order: orderDoc._id,
        paymentMethod: row.paymentMethod,
        amount: parseNumber(row.amount, saleDoc.total),
        
        status: toEnglishStatus(row.status, PAYMENT_STATUS_TRANSLATIONS, "pending"),
        transactionId: row.transactionId,
        paymentDetails: {},
      })
      await payment.save()
      createdPayments.push(payment)
      devLog(`   💰 Pago registrado para orden ${orderIndex} (método: ${row.paymentMethod})`)
    }

    devLog("\n Sembrando movimientos de inventario...")
    const { headers: inventoryHeaders, rows: inventoryRows } = parseCSV(
      path.join("./data", "inventory_movements.csv"),
      INVENTORY_HEADERS_ORDER,
    )
    const createdMovements = []

    for (const [index, rowValues] of inventoryRows.entries()) {
      const row = mapRow(inventoryHeaders, rowValues)
      const normalizedProductName = (row.productName || "").trim().toLowerCase()
      const product = productByName.get(normalizedProductName)
      const rowIndex = index + 2
      if (!product) {
        pushWarning("inventory", `fila ${rowIndex}: producto "${row.productName}" no encontrado`)
        continue
      }

      const saleIndex = parseNumber(row.saleIndex, 0)
      const saleDoc = createdSales[saleIndex - 1]
      if (!saleDoc) {
        pushWarning("inventory", `fila ${rowIndex}: venta ${saleIndex} no encontrada`)
        continue
      }

      const user = userByEmail.get(normalizeEmail(row.userEmail))
      if (!user) {
        pushWarning("inventory", `fila ${rowIndex}: usuario ${row.userEmail} no encontrado`)
        continue
      }

      const previousStock = parseNumber(row.previousStock, product.stock)
      const newStock = parseNumber(row.newStock, previousStock)

      const movement = new InventoryMovement({
        product: product._id,
        type: row.type,
        quantity: Math.abs(newStock - previousStock),
        previousStock,
        newStock,
        reason: row.reason,
        user: user._id,
        sale: saleDoc._id,
      })
      await movement.save()
      createdMovements.push(movement)
    }

    devLog("\n Sembrando mensajes de contacto...")
    const { headers: contactHeaders, rows: contactRows } = parseCSV(
      path.join("./data", "contact_messages.csv"),
      CONTACT_HEADERS_ORDER,
    )
    const createdContacts = []

    for (const rowValues of contactRows) {
      const row = mapRow(contactHeaders, rowValues)
      const message = new ContactMessage({
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
      })
      await message.save()
      createdContacts.push(message)
    }

    devLog("\n Sembrando alertas...")
    const { headers: alertHeaders, rows: alertRows } = parseCSV(path.join("./data", "alerts.csv"), ALERTS_HEADERS_ORDER)
    const createdAlerts = []

    for (const [index, rowValues] of alertRows.entries()) {
      const row = mapRow(alertHeaders, rowValues)
      const referenceIndex = Number.parseInt(row.referenceIndex, 10)
      const referenceModel = row.referenceModel?.trim()
      let referenceDoc = null

      if (referenceModel === "Sale") {
        referenceDoc = createdSales[referenceIndex - 1]
      } else if (referenceModel === "Payment") {
        referenceDoc = createdPayments[referenceIndex - 1]
      }

      if (!referenceDoc) {
        pushWarning(
          "alerts",
          `fila ${index + 2}: referencia ${row.referenceModel} con índice ${row.referenceIndex} no encontrada`,
        )
        continue
      }

      const alertType = row.type?.trim() || (referenceModel === "Payment" ? "pago" : "venta")
      const alertTitle = row.title?.trim() || `${alertType.toUpperCase()} ${referenceDoc._id.toString().slice(-6)}`
      const alertMessage = row.message?.trim() || `${alertType === "pago" ? "Pago" : "Venta"} pendiente · Referencia ${referenceDoc._id.toString().slice(-6)}`
      
      const alertDoc = new Alert({
        type: alertType,
        referenceId: referenceDoc._id,
        referenceModel,
        title: alertTitle,
        message: alertMessage,
        link: row.link || (alertType === "pago" ? "/admin/pagos" : "/admin/ventas"),
        priority: row.priority?.trim() || "media",
      })

      await alertDoc.save()
      createdAlerts.push(alertDoc)
    }

    devLog("\n Proceso de sembrado completado exitosamente!")
    devLog(`\n Resumen:`)
    devLog(`   - ${createdUsers.length} usuarios creados`)
    devLog(`   - ${createdProducts.length} productos creados`)
    devLog(`   - ${createdSales.length} ventas creadas`)
    devLog(`   - ${createdOrders.length} órdenes creadas`)
    devLog(`   - ${createdPayments.length} pagos creados`)
    devLog(`   - ${createdMovements.length} movimientos de inventario creados`)
    devLog(`   - ${createdContacts.length} mensajes de contacto creados`)
    devLog(`   - ${createdAlerts.length} alertas creadas`)

    if (warnings.length > 0) {
      devWarn("\n Advertencias detectadas durante el seed:")
      warnings.forEach((warning) => devWarn(`   - ${warning}`))
    }

    devLog("\n Credenciales de acceso:")
    devLog("   Admin: admin@workspacebcn.com / admin123")
    devLog("   Cliente: maria.rodriguez@email.com / password123")

    process.exit(0)
  } catch (error) {
    devWarn(" Error en el sembrado:", error && (error.stack || error))
    process.exit(1)
  }
}

seedDatabase()
