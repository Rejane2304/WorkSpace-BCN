"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { orders } from "../api/api"
import Toast from "../components/Toast.js"
import { formatCurrency } from "../utils/format"
import OrderMetaPanel from "../components/OrderMetaPanel"
import OrderProductCard from "../components/OrderProductCard"
import { buildOrderPrintAddress, buildOrderPrintTotals, getItemName, getItemPrice, getItemQuantity, getOrderItems, getOrderTotals, getShippingAddress } from "../utils/orderHelpers"
import { translateOrderStatus } from "../utils/translation"

function OrderDetail() {
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
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <p>Cargando orden...</p>
      </div>
    )
  }

  const orderItems = getOrderItems(order)
  const orderShippingAddress = getShippingAddress(order)
  const orderTotals = getOrderTotals(order, orderItems)
  const statusKey = (order.status ?? order.payment?.status ?? 'pendiente').toString().toLowerCase()
  const orderStatusLabel = translateOrderStatus(order.status ?? order.payment?.status)

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'pendiente') return 'badge badge-warning';
    if (s === 'processing' || s === 'procesando') return 'badge badge-info';
    if (s === 'shipped' || s === 'enviado') return 'badge badge-purple';
    if (s === 'delivered' || s === 'entregado' || s === 'completed' || s === 'completado') return 'badge badge-success';
    if (s === 'cancelled' || s === 'cancelado' || s === 'failed' || s === 'fallido') return 'badge badge-error';
    if (s === 'paid' || s === 'pagado') return 'badge badge-success';
    return 'badge badge-neutral';
  };

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container orderdetail-py-2">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
      />
      <div className="card order-summary-card">
        <header className="order-summary-header">
          <div>
            <h1 className="page-title">Detalle del pedido</h1>
            <p>Número de pedido: <strong>{order._id}</strong></p>
            <p>Fecha: {new Date(order.createdAt).toLocaleDateString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={getStatusBadgeClass(order.status ?? order.payment?.status)} style={{ fontSize: '1rem', padding: '0.5em 1em' }}>
              {orderStatusLabel}
            </span>
            <p className="text-small" style={{ marginTop: '0.5rem' }}>Total: {formatCurrency(orderTotals.total)}</p>
          </div>
        </header>

        <div className="order-summary-grid">
          <section className="order-summary-panel">
            {/* Productos primero */}
            <div className="order-product-grid">
              {orderItems.map((item, index) => (
                <OrderProductCard key={item.producto?._id || item.producto || item._id || `order-item-${index}`} item={item} />
              ))}
            </div>
            {/* Métricas después */}
            <div className="order-metrics">
              <div>
                <p className="text-secondary">Subtotal</p>
                <p className="text-large">{formatCurrency(orderTotals.subtotal)}</p>
              </div>
              <div>
                <p className="text-secondary">Envío</p>
                <p className="text-large">{formatCurrency(orderTotals.shipping)}</p>
              </div>
              <div>
                <p className="text-secondary">Total</p>
                <p className="text-large">{formatCurrency(orderTotals.total)}</p>
              </div>
            </div>
          </section>

          <OrderMetaPanel order={order} shippingAddress={orderShippingAddress} />
        </div>

        <div className="order-actions">
          <Link to="/orders" className="btn btn-secondary">
            Volver a pedidos
          </Link>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            Imprimir resumen
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
