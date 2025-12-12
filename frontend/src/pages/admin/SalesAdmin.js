"use client"

import { devError } from "../../utils/devlog"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { sales as salesAPI } from "../../api/api"
import FilterSelect from "../../components/FilterSelect"
import Modal from "../../components/Modal.js"
import Toast from "../../components/Toast"
import { formatCurrency } from "../../utils/format"
import { getStatusLabel } from "../../utils/statusLabels"
import { useAsyncAction } from "../../hooks/useAsyncAction"
import { useToastManager } from "../../hooks/useToastManager"


function SalesAdmin() {
  const [sales, setSales] = useState([])
  const [statusFilter, setStatusFilter] = useState("todas")
  const STATUS_FILTER_OPTIONS = [
    { value: "todas", label: "Todos los Estados" },
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "Procesando" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" },
    { value: "paid", label: "Pagado" },
  ]
  const [search, setSearch] = useState("")
  const [selectedSale, setSelectedSale] = useState(null)
  const [saleEditTarget, setSaleEditTarget] = useState(null)
  const [editSaleStatus, setEditSaleStatus] = useState("")
  const saleAsync = useAsyncAction()
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    statusCounts: {},
    paymentMethods: [],
    topCustomers: [],
  })
  const { isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast, updateToast: setToast } = useToastManager()
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })

  const loadSales = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return

    try {
      const response = await salesAPI.getAll()
      const payload = response.data || {}
      const ventasArray = Array.isArray(payload) ? payload : payload.sales || []
      const summaryData = payload.summary || {}
      setSales(ventasArray)
      setSummary((prev) => ({ ...prev, ...summaryData }))
    } catch (error) {
      devError("Error al cargar ventas:", error)
      setToast({
        type: "error",
        message: "No se pudieron cargar las ventas. Intenta de nuevo más tarde.",
      })
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
    loadSales()
  }, [isAdmin, isAuthenticated, navigate, loadSales])

  const pendingSalesCount = sales.filter((sale) => sale.status === "pending").length
  const cancelledSalesCount = sales.filter((sale) => sale.status === "cancelled").length
  const missingShippingCount = sales.filter((sale) => !sale.shippingAddress?.city).length
  const saleAlerts = [
    pendingSalesCount > 0 && {
      id: "pendientes",
      title: "Ventas pendientes",
      message: `${pendingSalesCount} ventas aún esperan aprobación.`,
    },
    cancelledSalesCount > 0 && {
      id: "canceladas",
      title: "Ventas canceladas",
      message: `${cancelledSalesCount} ventas fueron canceladas recientemente.`,
    },
    missingShippingCount > 0 && {
      id: "sin-domicilio",
      title: "Direcciones incompletas",
      message: `${missingShippingCount} pedidos aún no tienen ciudad registrada.`,
    },
  ].filter(Boolean)

  const STATUS_MAP_ES_EN = {
    pendiente: "pending",
    procesando: "processing",
    enviado: "shipped",
    entregado: "delivered",
    cancelado: "cancelled",
    pagado: "paid",
  }

  const openSaleEditModal = (sale) => {
    setSaleEditTarget(sale)
    setEditSaleStatus(sale.status || "")
  }

  const closeSaleEditModal = () => {
    setSaleEditTarget(null)
    setEditSaleStatus("")
    saleAsync.reset()
  }

  const handleConfirmSaleStatus = async () => {
    if (!saleEditTarget || !editSaleStatus) return;
    if (saleEditTarget.status === "cancelled" && editSaleStatus !== "cancelled") {
      setToast({
        type: "error",
        message: "No se puede cambiar el estado de una venta cancelada a otro valor.",
      });
      return;
    }
    try {
      const statusToSend = STATUS_MAP_ES_EN[editSaleStatus] || editSaleStatus;
      await saleAsync.run(() => salesAPI.updateStatus(saleEditTarget._id, statusToSend));
      setToast({ type: "success", message: "Estado actualizado correctamente." });
      await loadSales();
      closeSaleEditModal();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensaje ||
        error?.response?.data?.message ||
        "No se pudo actualizar el estado. Intenta de nuevo.";
      setToast({ type: "error", message: backendMessage });
    }
  } 

  const filteredSales = sales
    .filter((sale) => (statusFilter === "todas" ? true : sale.status === statusFilter))
    .filter((sale) => {
      const term = search.trim().toLowerCase()
      if (!term) return true

      const idMatch = sale._id?.toLowerCase().includes(term)
      const nameMatch = sale.customer?.name?.toLowerCase().includes(term)
      const emailMatch = sale.customer?.email?.toLowerCase().includes(term)
      const statusMatch = sale.status?.toLowerCase().includes(term)

      return idMatch || nameMatch || emailMatch || statusMatch
    })

  const sortedSales = [...filteredSales].sort(
    (a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta),
  )

  const statusOptionsForModal = STATUS_FILTER_OPTIONS.filter((option) => option.value !== "todas")

  return (
    <div className="container sales-admin-container">
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
        isOpen={!!selectedSale}
        title="Detalle de venta"
        confirmLabel="Cerrar"
        cancelLabel={null}
        onConfirm={() => setSelectedSale(null)}
        onCancel={null}
        onClose={() => setSelectedSale(null)}
      >
        {selectedSale && (
          <div>
            <p>
              <strong>ID:</strong> {selectedSale._id}
            </p>

            <p>
              <strong>Cliente:</strong> {selectedSale.customer?.name || "Cliente anónimo"} ({selectedSale.customer?.email || "sin email"})
            </p>
            <p>
              <strong>Estado:</strong> {getStatusLabel(selectedSale.status)}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {selectedSale.saleDate ? new Date(selectedSale.saleDate).toLocaleString() : "-"}
            </p>

            <div className="sales-admin-margin-top-1">
              <h3>Dirección de envío</h3>
              <p className="sales-admin-margin-top-025 sales-admin-color-text-light sales-admin-fontsize-09">
                {selectedSale.shippingAddress?.street || "-"}
                {selectedSale.shippingAddress?.street && <br />}
                {selectedSale.shippingAddress?.postalCode} {selectedSale.shippingAddress?.city}
              </p>
            </div>

            <div className="sales-admin-margin-top-1">
              <h3>Productos</h3>
              <div className="sales-admin-overflow-x-auto sales-admin-mt-05">
                <table className="sales-admin-table-full">
                  <thead className="sales-admin-bg-accent">
                    <tr>
                      <th className="sales-admin-padding-xs sales-admin-text-left">Producto</th>
                      <th className="sales-admin-padding-xs sales-admin-text-right">Cantidad</th>
                      <th className="sales-admin-padding-xs sales-admin-text-right">Precio unitario</th>
                      <th className="sales-admin-padding-xs sales-admin-text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => {
                      const itemKey =
                        item.producto?._id ||
                        item.producto?.nombre ||
                        `producto-${item.cantidad}-${index}`
                      return (
                        <tr key={itemKey}>
                          <td className="sales-admin-padding-xs">
                            {item.producto?.nombre || "Producto eliminado"}
                          </td>
                          <td className="sales-admin-padding-xs sales-admin-text-right">{item.cantidad}</td>
                          <td className="sales-admin-padding-xs sales-admin-text-right">
                            {formatCurrency(item.precioUnitario)}
                          </td>
                          <td className="sales-admin-padding-xs sales-admin-text-right">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sales-admin-margin-top-1 sales-admin-text-align-right">
              <p>
                <strong>Total:</strong> {formatCurrency(selectedSale.total)}
              </p>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!saleEditTarget}
        title="Modificar estado de venta"
        confirmLabel={saleAsync.loading ? "Guardando..." : "Guardar"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmSaleStatus}
        onCancel={closeSaleEditModal}
        onClose={closeSaleEditModal}
        confirmDisabled={saleAsync.loading}
      >
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <p>
          Estado actual: <strong>{getStatusLabel(saleEditTarget?.status)}</strong>
        </p>
        <div className="sales-admin-mt-1">
          <FilterSelect
            value={editSaleStatus}
            onChange={setEditSaleStatus}
            options={statusOptionsForModal}
            placeholder="Selecciona Un Estado"
          />
        </div>
      </Modal>
      <h1 className="page-title">Gestión de Ventas</h1>
      <div className="sales-admin-counters sales-admin-flex-baseline">
        <span className="text-small sales-admin-fontweight-500">
          Total de ventas: {summary.totalOrders || 0}
        </span>
        <span className="text-small sales-admin-fontweight-500">
          Ventas filtradas: {sortedSales.length}
        </span>
        <span className="text-small sales-admin-fontweight-500">
          Ingresos totales: {formatCurrency(summary.totalRevenue)}
        </span>
      </div>
      {saleAlerts.length > 0 && (
        <section className="sales-admin-alerts">
          <h2 className="page-section-title">Alertas</h2>
          <div className="sales-admin-alerts-grid">
            {saleAlerts.map((alert) => (
              <article key={alert.id} className="sales-admin-alert-card">
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="sales-admin-controls">
        <div className="flex gap-2 sales-admin-align-center">
          <label>Filtrar por estado:</label>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Buscar por ID, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input products-search-bar"
          />
        </div>
      </div>

      <div className="sales-admin-grid">
        {sortedSales.map((sale) => (
          <div key={sale._id} className="sales-admin-summary-card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
            <div className="sales-admin-flex-row-wrap sales-admin-align-center">
              <div className="sales-admin-flex-2">
                <p style={{ wordBreak: "break-all" }}><strong>ID venta:</strong> {sale._id}</p>
                <p><strong>Cliente:</strong> {sale.customer?.name || "Cliente anónimo"} ({sale.customer?.email || "sin email"})</p>
                <p><strong>Monto total:</strong> {formatCurrency(sale.total)}</p>
                <p><strong>Fecha:</strong> {sale.saleDate ? new Date(sale.saleDate).toLocaleString() : "-"}</p>
                <p><strong>Estado:</strong> {getStatusLabel(sale.status)}</p>
                <p style={{ wordBreak: "break-word" }}><strong>Dirección:</strong> {sale.shippingAddress?.street || "No disponible"}, {sale.shippingAddress?.city || "Sin ciudad"}</p>
                <p><strong>Artículos:</strong> {sale.items?.length || 0}</p>
              </div>
              <div className="sales-admin-flex-1-center">
                <div className="sales-admin-flex-row-wrap sales-admin-justify-center">
                  {sale.items?.slice(0, 4).map((item, idx) => {
                    const prod = item.product || item.producto || {};
                    const imgSrc = prod.image || prod.imagen || "/assets/no-image.png";
                    const prodName = prod.name || prod.nombre || "Producto";
                    return (
                      <img
                        key={prod._id || prodName || idx}
                        src={imgSrc}
                        alt={prodName}
                        className="sales-admin-product-img sales-admin-product-thumb"
                      />
                    );
                  })}
                </div>
                <p className="sales-admin-mt-05 sales-admin-fontsize-085 sales-admin-color-text-light">
                  {sale.items?.length || 0} artículos · Envío: {sale.shippingAddress?.city || "sin ciudad"}
                </p>
                <div className="sales-admin-status-actions">
                  <span className="sales-admin-status-pill">{getStatusLabel(sale.status)}</span>
                  <div className="sales-admin-status-buttons">
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => openSaleEditModal(sale)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs sales-admin-fontsize-085"
                      onClick={() => setSelectedSale(sale)}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && <p className="text-center">No hay ventas con este estado</p>}
    </div>
  )
}

export default SalesAdmin
