import { formatCurrency } from "./format"

export const getOrderItems = (order) => (order?.items?.length ? order.items : order?.productos) ?? []

export const getItemQuantity = (item) => item.quantity ?? item.cantidad ?? 0
export const getItemPrice = (item) => item.unitPrice ?? item.precioUnitario ?? 0
export const getItemName = (item) =>
  item.name ||
  item.nombre ||
  item.product?.name ||
  item.producto?.name ||
  item.product?.nombre ||
  item.producto?.nombre ||
  "Sin nombre"

export const getItemImage = (item) =>
  item.product?.image ||
  item.product?.imagen ||
  item.producto?.image ||
  item.producto?.imagen ||
  ""

export const getShippingAddress = (order) =>
  order.shippingAddress || order.sale?.shippingAddress || order.sale?.direccionEnvio || {}

export const formatAddressLine = (address) =>
  [
    address.street,
    address.calle,
    address.city,
    address.ciudad,
    address.codigoPostal ?? address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ")

export const getOrderTotals = (order, orderItems) => {
  const subtotal = orderItems.reduce((sum, item) => sum + getItemPrice(item) * getItemQuantity(item), 0);
  const shipping = order.shippingCost ?? order.sale?.shippingCost ?? (subtotal > 50 || subtotal === 0 ? 0 : 5.99);
  const total = order.total ?? order.sale?.total ?? (subtotal + shipping);
  return { subtotal, shipping, total };
}

export const embedOrderProductsForPrint = (orderItems) =>
  orderItems
    .map(
      (item) =>
        `<li>${getItemName(item)} x ${getItemQuantity(item)} · ${formatCurrency(getItemPrice(item))}</li>`,
    )
    .join("")

export const buildOrderPrintAddress = (address) => {
  const line = formatAddressLine(address)
  return `${line || "-"}<br />${address.phone || ""}`
}

export const buildOrderPrintTotals = (totals) => `
    <ul>
      <li>Subtotal: ${formatCurrency(totals.subtotal)}</li>
      <li>Envío: ${formatCurrency(totals.shipping)}</li>
      <li><strong>Total: ${formatCurrency(totals.total)}</strong></li>
    </ul>`
