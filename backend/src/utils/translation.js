export const SALE_STATUS_TRANSLATIONS = {
  pendiente: "pending",
  procesando: "processing",
  enviado: "shipped",
  entregado: "delivered",
  cancelado: "cancelled",
  pagado: "paid",
}

export const PAYMENT_STATUS_TRANSLATIONS = {
  pendiente: "pending",
  procesando: "processing",
  Completado: "completed",
  fallido: "failed",
  reembolsado: "refunded",
}

export const MOVEMENT_TYPE_TRANSLATIONS = {
  entrada: "entrada",
  salida: "salida",
  ajuste: "ajuste",
  devolucion: "devolucion",
}

export const ORDER_STATUS_TRANSLATIONS = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}

export function toEnglishStatus(status, map, defaultValue) {
  if (!status) return defaultValue
  const key = status.toString().toLowerCase()
  return map[key] || defaultValue
}

export function toSpanishStatus(status, map) {
  if (!status) return ""
  const entry = Object.entries(map).find(([, eng]) => eng === status)
  return entry ? entry[0] : status
}
