"use client";

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { orders } from "../api/api"
import Toast from "../components/Toast.js"
import { formatCurrency } from "../utils/format"
import { translateOrderStatus } from "../utils/translation"
import OrderMetaPanel from "../components/OrderMetaPanel"
import {
  buildOrderPrintAddress,
  getItemName,
  getItemPrice,
  getItemQuantity,
  getOrderItems,
  getOrderTotals,
  getShippingAddress,
} from "../utils/orderHelpers"

function OrderSummaryPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [toast, setToast] = useState({ type: "info", message: "" })

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await orders.getById(orderId)
        setOrder(response.data.order)
    } catch (error) {
        setToast({
          type: "error",
          message: "No se pudo cargar la orden: " + (error.response?.data?.mensaje || error.message),
        })
      }
    }
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (!order) {
    return (
      <div className="container">
        <Toast type={toast.type} message={toast.message} onClose={() => setToast((prev) => ({ ...prev, message: "" }))} />
        <p>Cargando orden...</p>
      </div>
    )
  }

  const orderItems = getOrderItems(order)
  const orderShippingAddress = getShippingAddress(order)
  const hasBackendTotals = typeof order.total === 'number' && typeof order.shippingCost === 'number';
  const summarySubtotal = hasBackendTotals ? order.total - order.shippingCost : undefined;
  const summaryShipping = hasBackendTotals ? order.shippingCost : undefined;
  const summaryTotal = hasBackendTotals ? order.total : undefined;
  const orderTotals = getOrderTotals(order, orderItems)
  const statusKey = (order.status ?? order.payment?.status ?? "pendiente").toString().toLowerCase()
  const orderStatusLabel = translateOrderStatus(order.status ?? order.payment?.status)

  const handlePrint = () => {
    if (!order) return
    const popup = window.open("", "_blank")
    if (!popup) return
    popup.document.write(`
      <html>
        <head><title>Resumen de compra</title></head>
        <body>
          <h1>Pedido ${order._id}</h1>
          <p>Total: ${formatCurrency(order.total)}</p>
          <p>Fecha: ${new Date(order.createdAt).toLocaleString('es-ES')}</p>
          <h3>Productos</h3>
          <ul>
            ${orderItems
              .map(
                (item) =>
                  `<li>${getItemName(item)} x ${getItemQuantity(item)} · ${formatCurrency(
                    getItemPrice(item),
                  )}</li>`,
              )
              .join("")}
          </ul>
          <h3>Dirección</h3>
      <p>
        ${buildOrderPrintAddress(orderShippingAddress)}<br />
        ${orderShippingAddress.phone || ""}
      </p>
          <h3>Resumen</h3>
          <ul>
            <li>Subtotal: ${formatCurrency(orderTotals.subtotal)}</li>
            <li>Envío: ${formatCurrency(orderTotals.shipping)}</li>
            <li><strong>Total: ${formatCurrency(orderTotals.total)}</strong></li>
          </ul>
        </body>
      </html>
    `)
    popup.document.close()
    popup.print()
  }

  return (
    <div className="container ordersummary-padding-y-2">
      <div className="card card-md order-summary-card">
        <Toast type={toast.type} message={toast.message} onClose={() => setToast((prev) => ({ ...prev, message: "" }))} />
        <header className="card-header order-summary-header ordersummary-header-flex">
          <div>
            <h1 className="card-title page-title ordersummary-mb-025">¡Gracias por tu compra!</h1>
            <div className="text-small ordersummary-mb-025">Nº pedido: <strong>{order._id}</strong></div>
            <div className="text-small">Fecha: {new Date(order.createdAt).toLocaleDateString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <div className={`order-status-pill order-status-${statusKey} ordersummary-status-right`}>
            <span className="ordersummary-fw-600">{orderStatusLabel}</span>
            <div className="text-small ordersummary-mt-04">Total: {formatCurrency(orderTotals.total)}</div>
          </div>
        </header>

        <div className="order-summary-grid">
          <section className="order-summary-panel">
            {/* Productos primero */}
            <div className="order-product-grid">
              {orderItems.map((item, index) => {
                const imageUrl = require('../utils/orderHelpers').getItemImage(item);
                const name = item.producto?.name || item.name;
                const unit = item.price || item.precio;
                const qty = item.quantity || item.cantidad;
                return (
                  <div key={item.producto?._id || item.producto || item._id || `order-item-${index}`} className="order-product-row">
                    <div className="order-product-imgcol">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="order-product-img"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/no-image.png'; }}
                        />
                      ) : (
                        <div className="checkout-summary-thumb no-image-fallback">
                          <svg className="order-product-svg" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17l2-2a2 2 0 0 1 2.8 0l2.2 2.2M8 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="order-product-infocol">
                      <div className="text-large order-product-name">{name}</div>
                      <div className="text-small order-product-qty">{qty} x {formatCurrency(unit)}</div>
                    </div>
                    <div className="text-large order-product-unit">{formatCurrency(unit)}</div>
                  </div>
                );
              })}
            </div>
            <div className="order-metrics order-metrics-bottom">
              <div className="order-metrics-col">
                <div className="text-secondary order-metrics-label">Subtotal</div>
                <div className="text-large order-metrics-value">{hasBackendTotals ? formatCurrency(summarySubtotal) : formatCurrency(orderTotals.subtotal)}</div>
              </div>
              <div className="order-metrics-col">
                <div className="text-secondary order-metrics-label">Envío</div>
                <div className="text-large order-metrics-value">{hasBackendTotals ? formatCurrency(summaryShipping) : formatCurrency(orderTotals.shipping)}</div>
              </div>
              <div className="order-metrics-col">
                <div className="text-secondary order-metrics-label">Total</div>
                <div className="text-large order-metrics-value order-metrics-total">{hasBackendTotals ? formatCurrency(summaryTotal) : formatCurrency(orderTotals.total)}</div>
              </div>
            </div>
          </section>

          <OrderMetaPanel order={order} shippingAddress={orderShippingAddress} />
        </div>

        <div className="order-actions">
          <Link to="/orders" className="btn btn-secondary">
            Ver mis pedidos
          </Link>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            Imprimir resumen
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSummaryPage
