
"use client";

import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { inventory as inventoryAPI, products as productsAPI } from "../../api/api"
import Modal from "../../components/Modal"
import Toast from "../../components/Toast"
import { formatCurrency } from "../../utils/format"

function InventoryDetailAdmin() {
  const { id } = useParams()
  const { isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [movements, setMovements] = useState([])
  const [formData, setFormData] = useState({
    cantidad: "",
    motivo: "",
  })

  const [toast, setToast] = useState({ type: "info", message: "" })
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return
    try {
      const [productRes, movementsRes] = await Promise.all([
        productsAPI.getById(id),
        inventoryAPI.getMovements({ productId: id, limit: 20 }),
      ])
      setProduct(productRes.data)
      setMovements(movementsRes.data)
    } catch (error) {
      console.error("Error al cargar datos de inventario:", error)
      setModalConfig({
        isOpen: true,
        title: "Error al cargar datos",
        message: "No se pudieron cargar los datos de inventario del producto.",
        confirmLabel: "Volver al inventario",
        cancelLabel: null,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          navigate("/admin/inventario")
        },
        onCancel: null,
      })
    }
  }, [id, isAuthenticated, isAdmin, navigate])

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

    loadData()
  }, [isAdmin, isAuthenticated, loadData, navigate])

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleMovement(tipo) {
    if (!product) return

    const cantidadNumero = Number.parseInt(formData.cantidad, 10)
    if (Number.isNaN(cantidadNumero) || cantidadNumero <= 0) {
      setToast({
        type: "error",
        message: "La cantidad debe ser un número mayor que cero.",
      })
      return
    }

    try {
      await inventoryAPI.registerMovement({
        productId: product._id,
        type: tipo,
        quantity: cantidadNumero,
        reason:
          formData.motivo ||
          `Movimiento de tipo "${tipo}" registrado desde la página de control individual.`,
      })
      setToast({
        type: "success",
        message: "El movimiento de inventario se ha registrado correctamente.",
      })

      setFormData({
        cantidad: "",
        motivo: "",
      })

      await loadData()
    } catch (error) {
      console.error("Error al registrar movimiento de inventario:", error)
      setToast({
        type: "error",
        message:
          "Error al registrar movimiento de inventario: " +
          (error.response?.data?.mensaje || "Error desconocido"),
      })
    }
  }

  if (!product) {
    return (
      <div className="container text-center inventorydetailadmin-py-4">
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
        />
        Cargando producto...
      </div>
    )
  }

  return (
    <div className="container inventorydetailadmin-padding-y-2">
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
      />

      <div className="flex-between mb-3">
        <div>
          <h1 className="page-title">Control de Inventario</h1>
          <p className="inventorydetailadmin-text-light inventorydetailadmin-mt-025 inventorydetailadmin-fs-095">
            Gestión individual del producto seleccionado: entradas, salidas, ajustes y devoluciones.
          </p>
        </div>
        <Link to="/admin/inventario" className="btn btn-secondary">
          Volver al inventario
        </Link>
      </div>

      <div className="card mb-3">
        <h2 className="page-section-title">{product.nombre}</h2>
        <p className="inventorydetailadmin-text-light inventorydetailadmin-fs-09 inventorydetailadmin-mt-025">
          Categoría: {product.category}
        </p>
        <div className="inventorydetailadmin-flex-between inventorydetailadmin-mt-075">
          <div>
            <p>
              Precio: <strong>{formatCurrency(product.price)}</strong>
            </p>
            <p>
              Stock actual: <strong>{product.stock}</strong>
            </p>
          </div>
          <div className="inventorydetailadmin-text-right">
            <p>
              Stock mínimo: <strong>{product.minStock || "-"} </strong>
            </p>
            {product.stockMaximo && (
              <p>
                Stock máximo: <strong>{product.stockMaximo}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="page-section-title">Registrar movimiento</h3>
        <p className="inventorydetailadmin-text-light inventorydetailadmin-fs-09 inventorydetailadmin-mb-1">
          Introduce la cantidad y, si lo necesitas, un motivo para dejar trazabilidad clara.
        </p>

        <div className="flex gap-2">
          <div className="form-group inventorydetailadmin-flex-1">
            <label className="label">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className="input input-border-orange"
              required
              min="1"
            />
          </div>

          <div className="form-group inventorydetailadmin-flex-1">
            <label className="label">Motivo (opcional)</label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className="textarea input-border-orange"
              rows="3"
            />
          </div>
        </div>

        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <div className="flex gap-2 inventorydetailadmin-mt-1 inventorydetailadmin-flex-wrap">
          <button
            type="button"
            className="btn btn-inventory-in"
            onClick={() => handleMovement("entrada")}
          >
            Entrada (+ Stock)
          </button>
          <button
            type="button"
            className="btn btn-inventory-out"
            onClick={() => handleMovement("salida")}
          >
            Salida (- Stock)
          </button>
          <button
            type="button"
            className="btn btn-inventory-adjust"
            onClick={() => handleMovement("ajuste")}
          >
            Ajustar A Cantidad Exacta
          </button>
          <button
            type="button"
            className="btn btn-inventory-return"
            onClick={() => handleMovement("devolucion")}
          >
            Devolución (+ Stock)
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="page-section-title">Movimientos recientes de este producto</h2>
        <div className="inventorydetailadmin-overflow-x-auto inventorydetailadmin-mt-1">
          <table className="inventorydetailadmin-table">
            <thead className="inventorydetailadmin-table-head">
              <tr>
                <th className="inventorydetailadmin-table-th">Fecha</th>
                <th className="inventorydetailadmin-table-th">Tipo</th>
                <th className="inventorydetailadmin-table-th inventorydetailadmin-table-th-right">Cantidad</th>
                <th className="inventorydetailadmin-table-th inventorydetailadmin-table-th-right">Stock anterior</th>
                <th className="inventorydetailadmin-table-th inventorydetailadmin-table-th-right">Stock nuevo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement._id} className="inventorydetailadmin-table-row">
                  <td className="inventorydetailadmin-table-td">
                    {movement.date ? new Date(movement.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="inventorydetailadmin-table-td">
                    <span className={`badge-movement badge-movement--${movement.type || movement.tipo}`}>
                      {movement.type || movement.tipo}
                    </span>
                  </td>
                  <td className="inventorydetailadmin-table-td inventorydetailadmin-table-th-right">
                    {movement.cantidad || movement.quantity || 0}
                  </td>
                  <td className="inventorydetailadmin-table-td inventorydetailadmin-table-th-right">
                    {movement.stockAnterior || movement.previousStock || 0}
                  </td>
                  <td className="inventorydetailadmin-table-td inventorydetailadmin-table-th-right inventorydetailadmin-fw-600">
                    {movement.stockNuevo || movement.newStock || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InventoryDetailAdmin
