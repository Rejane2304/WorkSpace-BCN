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

export const ORDER_STATUS_MAP = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  processing: "En proceso",
}

export const PAYMENT_METHOD_MAP = {
  tarjeta: "Tarjeta",
  paypal: "PayPal",
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

export const translateOrderStatus = (rawStatus) => {
  if (!rawStatus) return "Pendiente"
  const status = `${rawStatus}`.toLowerCase()
  return ORDER_STATUS_MAP[status] || rawStatus
}

export const translatePaymentMethod = (rawMethod) => {
  if (!rawMethod) return "Pago"
  const method = `${rawMethod}`.toLowerCase()
  return PAYMENT_METHOD_MAP[method] || rawMethod
}
