const STATUS_LABELS_MAP = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  paid: "Pagado",
}

export const STATUS_FILTER_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "paid", label: "Pagado" },
]

export function getStatusLabel(status) {
  return STATUS_LABELS_MAP[status] || status || "Desconocido"
}

export default STATUS_LABELS_MAP
