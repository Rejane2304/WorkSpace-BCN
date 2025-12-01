"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  inventory as inventoryAPI,
  products as productsAPI,
  customers as customersAPI,
  sales as salesAPI,
  payments as paymentsAPI,
} from "../../api/api"
import Modal from "../../components/Modal"
import { formatCurrency, formatNumber } from "../../utils/format"
import { sortProductsByName } from "../../utils/sortProducts"

function AdminDashboard() {
  const { isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState({
    products: 0,
    customers: 0,
    totalStock: 0,
    totalRevenue: 0,
    totalPayments: 0,
  })
  const [inventoryOverview, setInventoryOverview] = useState(null)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })

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

    async function loadSummary() {
      if (!isAuthenticated || !isAdmin) return
      try {
      const [
        productsRes,
        customersRes,
        salesRes,
        paymentsRes,
        overviewRes,
      ] = await Promise.all([
        productsAPI.getAll(),
        customersAPI.getAll(),
        salesAPI.getAll(),
        paymentsAPI.getAllAdmin(),
        inventoryAPI.getOverview({ limit: 0 }),
      ])
        const totalStock = (productsRes.data || []).reduce(
          (sum, product) => sum + (Number.parseInt(product.stock, 10) || 0),
          0,
        )

        const saleSummary = salesRes.data?.summary || {}
        const paymentsAmount = (Array.isArray(paymentsRes.data) ? paymentsRes.data : []).reduce(
          (acc, payment) => acc + (payment.monto || 0),
          0,
        )

      setSummary({
        products: productsRes.data.length || 0,
        customers: customersRes.data.length || 0,
        totalStock,
        totalRevenue: saleSummary.totalRevenue || 0,
        totalPayments: paymentsAmount,
      })
      setInventoryOverview(overviewRes.data)
      } catch (error) {
        console.error("Error al cargar resumen del dashboard:", error)
      }
    }

    loadSummary()
  }, [isAdmin, isAuthenticated, navigate])

  const lowStockProducts = sortProductsByName(inventoryOverview?.lowStockProducts || [])
  const lowStockCount = lowStockProducts.length
  const outOfStockProducts = sortProductsByName(inventoryOverview?.outOfStockProducts || [])
  const outOfStockCount = outOfStockProducts.length

  const summaryCards = [
    {
      title: "Productos",
      value: summary.products,
      description: "Artículos en catálogo",
      link: "/admin/productos",
      icon: "🛒",
    },
    {
      title: "Clientes",
      value: summary.customers,
      description: "Usuarios activos",
      link: "/admin/clientes",
      icon: "👥",
    },
    {
      title: "Ventas",
      value: formatCurrency(summary.totalRevenue),
      description: "Ingreso acumulado",
      link: "/admin/ventas",
      icon: "💵",
    },
    {
      title: "Pagos",
      value: formatCurrency(summary.totalPayments),
      description: "Transacciones procesadas",
      link: "/admin/pagos",
      icon: "💳",
    },
  ]

  return (
    <div className="container admindashboard-padding-y-2">
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
      <h1 className="page-title">Panel de Administración</h1>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-quick-actions">
          <h3>Acciones rápidas</h3>
          <div className="quick-actions-grid">
            <Link to="/admin/productos" className="btn btn-primary">
              Añadir / Editar Producto
            </Link>
            <Link to="/admin/ventas" className="btn btn-secondary">
              Revisar Pedidos
            </Link>
            <Link to="/admin/pagos" className="btn btn-primary btn-alt">
              Confirmar Pagos
            </Link>
            <Link to="/admin/inventario" className="btn btn-secondary">
              Controlar Stock
            </Link>
          </div>
        </div>

        <div className="admin-dashboard-summary">
          {summaryCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="card admin-dashboard-card admin-summary-card admindashboard-td-none admindashboard-color-inherit"
            >
              <div className="admin-summary-icon">{card.icon}</div>
              <h2 className="page-section-title">{card.title}</h2>
              <p className="admin-summary-value">{card.value}</p>
              <p className="text-secondary">{card.description}</p>
            </Link>
          ))}
        </div>
        {inventoryOverview && (
          <div className="admin-dashboard-overview card">
            <div className="admin-dashboard-overview-header">
              <div>
                <h2 className="page-section-title">Inventario en vivo</h2>
                <p className="text-secondary admindashboard-mt-025">
                  Datos actualizados con los movimientos registrados en tiempo real.
                </p>
              </div>
            </div>

            <div className="admin-dashboard-overview-grid">
              <div>
                <p className="text-secondary">Stock total</p>
                <p className="admin-dashboard-overview-value">{formatNumber(inventoryOverview.totalStock)}</p>
              </div>
              <div>
                <p className="text-secondary">Stock promedio</p>
                <p className="admin-dashboard-overview-value">{formatNumber(inventoryOverview.avgStock, 1)}</p>
              </div>
              <div>
                <p className="text-secondary">Productos activos</p>
                <p className="admin-dashboard-overview-value">{formatNumber(inventoryOverview.totalProducts)}</p>
              </div>
            </div>

            <div className="admin-dashboard-overview-low-stock">
              <div className="admin-dashboard-overview-low-stock-title">
                <h4>Productos con stock bajo</h4>
                <p className="text-secondary">
                  {lowStockCount > 0
                    ? "Revisa estos artículos antes de que se agoten."
                    : "Todos los productos superan el mínimo configurado."}
                </p>
              </div>
              {lowStockCount > 0 ? (
                <div className="admin-dashboard-overview-low-stock-list">
                  {lowStockProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/inventario/${product.id}`}
                      className="admin-dashboard-overview-low-stock-item-link"
                      title={`Ir a ${product.name}`}
                    >
                      <span className="admin-dashboard-low-stock-name">{product.name}</span>
                      <span
                        className={`admin-dashboard-low-stock-chip ${
                          product.stock <= 0 ? "stock-agotado" : "stock-bajo"
                        }`}
                      >
                        {product.stock}/{product.minStock ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-secondary admindashboard-mt-05">
                  Consulta el detalle completo de inventario para más métricas.
                </p>
              )}
            </div>
            {outOfStockCount > 0 && (
              <div className="admin-dashboard-overview-low-stock admin-dashboard-out-of-stock">
                <div className="admin-dashboard-overview-low-stock-title">
                  <h4>Productos agotados</h4>
                  <p className="text-secondary">
                    Estos productos deben reponerse cuanto antes.
                  </p>
                </div>
                <div className="admin-dashboard-overview-low-stock-list">
                  {outOfStockProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/inventario/${product.id}`}
                      className="admin-dashboard-overview-low-stock-item-link"
                      title={`Ir a ${product.name}`}
                    >
                      <span className="admin-dashboard-low-stock-name">{product.name}</span>
                      <span className="admin-dashboard-low-stock-chip stock-agotado">
                        0/{product.minStock ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard
