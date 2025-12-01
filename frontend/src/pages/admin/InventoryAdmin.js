"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { inventory as inventoryAPI, products as productsAPI } from "../../api/api";
import Modal from "../../components/Modal";
import { formatCurrency } from "../../utils/format";
import Toast from "../../components/Toast";
import { sortProductsByName } from "../../utils/sortProducts";

function InventoryAdmin() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
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

  const toastElement = null 

  const generalModal = (
    <Modal
      isOpen={modalConfig.isOpen}
      title={modalConfig.title}
      message={modalConfig.message}
      confirmLabel={modalConfig.confirmLabel}
      cancelLabel={modalConfig.cancelLabel}
      onConfirm={modalConfig.onConfirm}
      onCancel={modalConfig.onCancel}
    />
  )

  const { isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return
    try {
      const [statsRes, productsRes] = await Promise.all([
        inventoryAPI.getStats(),
        productsAPI.getAll(),
      ])

      setStats({
        totalProductos: statsRes.data.totalProducts ?? 0,
        productosStockBajo: statsRes.data.lowStockProducts ?? 0,
        productosAgotados: statsRes.data.outOfStockProducts ?? 0,
        valorTotalInventario: statsRes.data.totalInventoryValue ?? 0,
        movimientosUltimaSemana: statsRes.data.recentMovements ?? 0,
      })
      setProducts(sortProductsByName(productsRes.data || []))
    } catch (error) {
      console.error("Error al cargar datos de inventario:", error)
      setToast({
        type: "error",
        message: "No se pudieron cargar los datos de inventario. Inténtalo de nuevo más tarde.",
      })
    }
  }, [isAuthenticated, isAdmin])

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
  }, [isAdmin, isAuthenticated, navigate, loadData])

  async function handleTableMovement(productoId, tipo, cantidad) {
    const cantidadNumero = Number.parseInt(cantidad, 10)

    if (Number.isNaN(cantidadNumero) || cantidadNumero <= 0) {
      setToast({
        type: "error",
        message: "La cantidad debe ser un número mayor que cero.",
      })
      return
    }

    try {
      await inventoryAPI.registerMovement({
        productId: productoId,
        type: tipo,
        quantity: cantidadNumero,
        reason: `Movimiento rápido (${tipo}) registrado desde la lista de productos.`,
      })

      await loadData()
    } catch (error) {
      console.error("Error al registrar movimiento de inventario:", error)
      setToast({
        type: "error",
        message: "Error al registrar movimiento: " + (error.response?.data?.mensaje || "Error desconocido"),
      })
      return
    }

    setToast({
      type: "success",
      message: "Movimiento de inventario registrado correctamente.",
    })
  }

  if (!stats) {
    return (
      <>
        {toastElement}
        {generalModal}
        <div className="container text-center inventoryadmin-py-4">
          <div className="card inventoryadmin-inline-block inventoryadmin-py-2-3">
            <h2 className="inventoryadmin-mb-0-5">Cargando inventario...</h2>
            <p className="inventoryadmin-text-light">Estamos obteniendo los datos de stock y movimientos.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="container inventoryadmin-padding-y-2">
      {generalModal}
      <div className="flex-between mb-3">
        <div>
          <h1 className="page-title">Gestión de Inventario</h1>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="page-section-title">Resumen de inventario</h3>
        <div className="flex inventoryadmin-gap-1-5 inventoryadmin-mt-1 inventoryadmin-flex-wrap">
          <div>
            <p className="inventoryadmin-fs-09 inventoryadmin-text-light">Total de productos</p>
            <p className="inventoryadmin-fs-1-4 inventoryadmin-fw-600">{stats.totalProductos}</p>
          </div>
          <div>
            <p className="inventoryadmin-fs-09 inventoryadmin-text-light">Productos con stock bajo</p>
            <p className="inventoryadmin-fs-1-4 inventoryadmin-fw-600">{stats.productosStockBajo}</p>
          </div>
          <div>
            <p className="inventoryadmin-fs-09 inventoryadmin-text-light">Productos agotados</p>
            <p className="inventoryadmin-fs-1-4 inventoryadmin-fw-600">{stats.productosAgotados}</p>
          </div>
          <div>
            <p className="inventoryadmin-fs-09 inventoryadmin-text-light">Valor total de inventario</p>
            <p className="inventoryadmin-fs-1-4 inventoryadmin-fw-600">
              {formatCurrency(stats.valorTotalInventario)}
            </p>
          </div>
          <div>
            <p className="inventoryadmin-fs-09 inventoryadmin-text-light">Movimientos última semana</p>
            <p className="inventoryadmin-fs-1-4 inventoryadmin-fw-600">{stats.movimientosUltimaSemana}</p>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="page-section-title">Productos y stock actual</h3>
        <p className="inventoryadmin-text-light inventoryadmin-fs-09 inventoryadmin-mt-05">
          Gestiona el stock de todos los productos desde una única vista.<br />
          Usa las acciones rápidas por fila o selecciona un producto para editarlo en el panel de control individual.
        </p>
        <div className="inventoryadmin-overflow-x-auto inventoryadmin-mt-1">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
          />
          <table className="inventoryadmin-table">
            <thead className="inventoryadmin-table-head">
              <tr>
                <th className="inventoryadmin-table-th">Producto</th>
                <th className="inventoryadmin-table-th">Categoría</th>
                <th className="inventoryadmin-table-th inventoryadmin-table-th-right">Precio</th>
                <th className="inventoryadmin-table-th inventoryadmin-table-th-right">Stock</th>
                <th className="inventoryadmin-table-th inventoryadmin-table-th-right">Stock mínimo</th>
                <th className="inventoryadmin-table-th inventoryadmin-table-th-center">Acciones rápidas</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="inventoryadmin-table-row">
                  <td className="inventoryadmin-table-td">{product.nombre || product.name}</td>
                  <td className="inventoryadmin-table-td">{product.category}</td>
                  <td className="inventoryadmin-table-td inventoryadmin-table-td-right">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="inventoryadmin-table-td inventoryadmin-table-td-right inventoryadmin-fw-600">
                    {product.stock}
                  </td>
                  <td className="inventoryadmin-table-td inventoryadmin-table-td-right">
                    {product.minStock ?? product.stockMinimo ?? "-"}
                  </td>
                  <td className="inventoryadmin-table-td">
                    <div className="inventoryadmin-flex inventoryadmin-gap-05 inventoryadmin-justify-center inventoryadmin-flex-wrap">
                      <button
                        type="button"
                        className="btn btn-inventory-in"
                        onClick={() => handleTableMovement(product._id, "entrada", 1)}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="btn btn-inventory-out"
                        onClick={() => handleTableMovement(product._id, "salida", 1)}
                        disabled={product.stock <= 0}
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate(`/admin/inventario/${product._id}`)}
                      >
                        Control Individual
                      </button>
                    </div>
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

export default InventoryAdmin
