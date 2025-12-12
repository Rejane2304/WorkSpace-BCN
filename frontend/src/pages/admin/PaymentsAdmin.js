import "../../styles/pages/paymentsadmin.css"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { payments as paymentsAPI } from "../../api/api"
import FilterSelect from "../../components/FilterSelect"
import Modal from "../../components/Modal.js"
import Toast from "../../components/Toast"
import { formatCurrency } from "../../utils/format"
import { useAsyncAction } from "../../hooks/useAsyncAction"
import { useToastManager } from "../../hooks/useToastManager"

function PaymentsAdmin() {
  const [payments, setPayments] = useState([])
  const STATUS_FILTER_OPTIONS = [
    { value: "todos", label: "Todos" },
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "Procesando" },
    { value: "completed", label: "Completado" },
    { value: "failed", label: "Fallido" },
    { value: "refunded", label: "Reembolsado" },
  ]
  const METHOD_FILTER_OPTIONS = [
    { value: "todos", label: "Todos Los Métodos" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "paypal", label: "PayPal" },
  ]
  const [statusFilter, setStatusFilter] = useState("todos")
  const [methodFilter, setMethodFilter] = useState("todos")
  const [search, setSearch] = useState("")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentEditTarget, setPaymentEditTarget] = useState(null)
  const [editPaymentStatus, setEditPaymentStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const paymentAsync = useAsyncAction()

  const { isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })
  const { toast, updateToast: setToast } = useToastManager()

  const loadPayments = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return

    setLoading(true)
    try {
      const response = await paymentsAPI.getAllAdmin()
      setPayments(response.data)
    } catch (error) {
      console.error("Error al cargar payments:", error)
      setToast({
        type: "error",
        message: "No se pudieron cargar los payments. Inténtalo de nuevo más tarde.",
      })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isAdmin, setToast])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
      return
    }

    if (!isAdmin) {
      setModalConfig({
        isOpen: true,
        title: "Acceso denegado",
        message: "No tienes permisos para acceder a esta página.",
        confirmLabel: "Ir al inicio",
        cancelLabel: null,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          navigate("/")
        },
        onCancel: null,
      })
      return
    }

    loadPayments()
  }, [isAdmin, isAuthenticated, navigate, loadPayments])

  const filteredPayments = payments
    .filter((payment) => (statusFilter === "todos" ? true : payment.status === statusFilter))
    .filter((payment) => {
      if (methodFilter === "todos") return true;
      const method = (payment.paymentMethod || "").toLowerCase();
      const filter = methodFilter.toLowerCase();
      if (filter === "tarjeta" && (method === "card" || method === "stripe")) return true;
      return method === filter;
    })
    .filter((payment) => {
      const term = search.trim().toLowerCase()
      if (!term) return true

      const idMatch = payment._id?.toLowerCase().includes(term)
      const saleMatch = payment.sale?._id?.toLowerCase().includes(term)
      const nameMatch = payment.sale?.customer?.name?.toLowerCase().includes(term)
      const emailMatch = payment.sale?.customer?.email?.toLowerCase().includes(term)
      const methodMatch = payment.paymentMethod?.toLowerCase().includes(term)

      return idMatch || saleMatch || nameMatch || emailMatch || methodMatch
    })

  const paymentStatusOptionsForModal = STATUS_FILTER_OPTIONS.filter((option) => option.value !== "todos")
  const pendingPaymentsCount = payments.filter((payment) => payment.status === "pending").length
  const failedPaymentsCount = payments.filter((payment) => payment.status === "failed").length
  const withoutSaleCount = payments.filter((payment) => !payment.sale?._id).length

  const paymentAlerts = [
    pendingPaymentsCount > 0 && {
      id: "payments-pendientes",
      title: "Pagos pendientes",
      message: `${pendingPaymentsCount} pagos todavía no han sido confirmados.`,
    },
    failedPaymentsCount > 0 && {
      id: "payments-fallidos",
      title: "Pagos fallidos",
      message: `${failedPaymentsCount} pagos necesitan revisión manual.`,
    },
    withoutSaleCount > 0 && {
      id: "payments-sin-venta",
      title: "Pagos sin venta registrada",
      message: `${withoutSaleCount} pagos no tienen una venta asociada en el sistema.`,
    },
  ].filter(Boolean)

  const openPaymentEditModal = (payment) => {
    setPaymentEditTarget(payment)
    setEditPaymentStatus(payment.status || "")
  }

  const closePaymentEditModal = () => {
    setPaymentEditTarget(null)
    setEditPaymentStatus("")
    paymentAsync.reset()
  }

  const handleConfirmPaymentStatus = async () => {
    if (!paymentEditTarget || !editPaymentStatus) return
    try {
      await paymentAsync.run(() =>
        paymentsAPI.updateStatusAdmin(paymentEditTarget._id, editPaymentStatus),
      )
      setToast({ type: "success", message: "Estado de pago actualizado correctamente." })
      closePaymentEditModal()
      loadPayments()
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensaje ||
        error?.response?.data?.message ||
        "No se pudo actualizar el pago. Inténtalo de nuevo más tarde."
      setToast({ type: "error", message: backendMessage })
    }
  }

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

  const STATUS_STYLES = {
    pending: { label: "Pendiente", className: "badge badge-warning" },
    processing: { label: "Procesando", className: "badge badge-info" },
    completed: { label: "Completado", className: "badge badge-success" },
    failed: { label: "Fallido", className: "badge badge-error" },
    refunded: { label: "Reembolsado", className: "badge badge-neutral" },
  }

  function formatStatus(status) {
    return STATUS_STYLES[status] || { label: status || "Sin estado", className: "badge" }
  }

  return (
    <div className="container paymentsadmin-padding-y-2">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
      />

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <Modal
        isOpen={!!selectedPayment}
        title="Detalle de pago"
        confirmLabel="Cerrar"
        cancelLabel={null}
        onConfirm={() => setSelectedPayment(null)}
        onCancel={null}
        onClose={() => setSelectedPayment(null)}
      >
        {selectedPayment && (
            <div className="payments-detail-modal">
            <div className="payments-detail-header">
              <p><strong>Cliente:</strong> {selectedPayment.sale?.customer ? `${selectedPayment.sale.customer.name} (${selectedPayment.sale.customer.email})` : "-"}</p>
              <p><strong>ID pago:</strong> {selectedPayment._id}</p>
              <p><strong>ID venta:</strong> {selectedPayment.sale?._id || "-"}</p>
              <p><strong>Fecha:</strong> {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString() : "-"}</p>
              {typeof selectedPayment.sale?.total === 'number' && selectedPayment.sale.total < 50 && (
                <div className="payments-admin-margin-y-05">
                  <strong>Envío:</strong> 4,99 € (aplicado por compra menor a 50 €)
                </div>
              )}
              <p className="payments-admin-mt-1"><strong>Método:</strong> {selectedPayment.paymentMethod === "tarjeta" ? "Tarjeta" : selectedPayment.paymentMethod === "paypal" ? "PayPal" : selectedPayment.paymentMethod}</p>
              {selectedPayment.errorMessage && (
                <p className="paymentsadmin-mt-075 paymentsadmin-color-error paymentsadmin-fs-09"><strong>Error:</strong> {selectedPayment.errorMessage}</p>
              )}
            </div>
            {selectedPayment.sale?.items?.length > 0 && (
              <div className="payments-detail-products">
                <h4 className="payments-admin-mt-1 payments-admin-mb-05">Productos de la venta</h4>
                <ul className="payments-admin-pl-18">
                  {selectedPayment.sale.items.map((item, idx) => (
                    <li key={item.product?._id || idx} className="payments-admin-mb-6">
                      <span className="payments-admin-fw-500">{item.product?.name || item.nombre || "Producto"}</span> x{item.quantity || item.cantidad || 1} <span className="payments-admin-text-muted">({formatCurrency(item.unitPrice || item.precioUnitario || 0)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="payments-detail-envio payments-admin-mt-1">
              <p><strong>Envío:</strong> {formatCurrency(selectedPayment.sale?.shippingCost ?? 0)}</p>
            </div>
            <div className="payments-detail-monto payments-admin-mt-05">
              <p><strong>Total pagado:</strong> {formatCurrency(selectedPayment.amount)}</p>
            </div>
            <div className="payments-detail-estado payments-admin-mt-12">
              <span className={`${formatStatus(selectedPayment.status).className} payments-admin-inline-block`}>
                {formatStatus(selectedPayment.status).label.charAt(0).toUpperCase() + formatStatus(selectedPayment.status).label.slice(1)}
              </span>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!paymentEditTarget}
        title="Modificar estado de pago"
        confirmLabel={paymentAsync.loading ? "Guardando..." : "Guardar"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmPaymentStatus}
        onCancel={closePaymentEditModal}
        onClose={closePaymentEditModal}
        confirmDisabled={paymentAsync.loading}
      >
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <p>
          Estado actual:{" "}
          <span className={formatStatus(paymentEditTarget?.status).className}>
            {formatStatus(paymentEditTarget?.status).label}
          </span>
        </p>
        <div className="paymentsadmin-mt-1">
          <FilterSelect
            value={editPaymentStatus}
            onChange={setEditPaymentStatus}
            options={paymentStatusOptionsForModal}
            placeholder="Selecciona Un Estado"
          />
        </div>
      </Modal>

      <h1 className="page-title">Gestión de Pagos</h1>
      <div className="payments-admin-counters paymentsadmin-flex paymentsadmin-gap-1 paymentsadmin-mb-1">
        <span className="text-small paymentsadmin-fw-500">
          Total de pagos: {payments.length}
        </span>
        <span className="text-small paymentsadmin-fw-500">
          Pagos filtrados: {filteredPayments.length}
        </span>
        <span className="text-small paymentsadmin-fw-500">
          Ingresos totales: {formatCurrency(totalAmount)}
        </span>
      </div>
      {paymentAlerts.length > 0 && (
        <section className="payments-admin-alerts">
          <h2 className="page-section-title">Alertas</h2>
          <div className="payments-admin-alerts-grid">
            {paymentAlerts.map((alert) => (
              <article key={alert.id} className="payments-admin-alert-card">
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="payments-admin-controls">
        <div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            placeholder="Estado"
            dataTestId="paymentsadmin-status-filter"
          />
        </div>
        <div>
          <FilterSelect
            value={methodFilter}
            onChange={setMethodFilter}
            options={METHOD_FILTER_OPTIONS}
            placeholder="Método de pago"
            dataTestId="paymentsadmin-method-filter"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Buscar por pago, venta o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-filter"
          />
        </div>
      </div>

      <div className="payments-admin-grid payments-admin-grid-3col">
        {loading ? (
          <div className="payments-loading-placeholder">Cargando pagos...</div>
        ) : filteredPayments.length === 0 ? (
          <p className="text-center">No hay pagos que coincidan con los filtros seleccionados</p>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment._id} className="card mb-2 payments-card-enhanced">
              <div className="payments-admin-card-header payments-card-header-enhanced">
                <p className="payments-admin-fw-700 payments-admin-fs-11 payments-admin-mb-2">
                  {payment.sale?.customer?.name
                    ? payment.sale.customer.name
                    : <span className="payments-admin-text-light">Cliente no disponible</span>}
                </p>
                <p className="payments-admin-fs-095 payments-admin-text-muted payments-admin-mb-6">
                  {payment.sale?.customer?.email || ''}
                </p>
                <p className="payments-admin-fs-092"><strong>ID pago:</strong> {payment._id}</p>
                <p className="payments-admin-fs-092"><strong>ID venta:</strong> {payment.sale?._id || "-"}</p>
                {payment.sale?.items?.length > 0 && (
                  <ul className="payments-card-products-list">
                    {payment.sale.items.map((item, idx) => (
                      <li key={item.product?._id || idx}>
                        <span className="payments-admin-fw-500">{item.product?.name || item.nombre || "Producto"}</span> x{item.quantity || item.cantidad || 1}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="payments-metrics payments-admin-mt-07 payments-admin-w-100">
                  <p><strong>Monto:</strong> {formatCurrency(payment.amount)}</p>
                  <p><strong>Fecha:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}</p>
                  <span className={`${formatStatus(payment.status).className} payments-admin-mt-8 payments-admin-inline-block`}>
                    {formatStatus(payment.status).label}
                  </span>
                </div>
              </div>
              <div className="payments-admin-actions payments-card-actions-enhanced">
                <div className="payments-admin-action-buttons">
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => openPaymentEditModal(payment)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary payments-admin-detail"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filteredPayments.length === 0 && (
        <p className="text-center" style={{ display: 'none' }}>No hay pagos que coincidan con los filtros seleccionados</p>
      )}
    </div>
  )
}

export default PaymentsAdmin
