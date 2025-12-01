"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Toast from "../components/Toast.js"
import { formatCurrency } from "../utils/format"


function CartPage() {
  const [cart, setCart] = useState([])
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState({ type: "info", message: "" })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, productId: null, productName: "" })

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("carrito") || "[]")
    const normalizedCart = savedCart.map((item) => {
      const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity)
        ? item.quantity
        : (typeof item.cantidad === 'number' && !isNaN(item.cantidad) ? item.cantidad : 1)
      const image = item.image || item.imagen || "";
      return {
        ...item,
        quantity,
        price: item.price ?? item.precio ?? 0,
        category: item.category ?? item.categoria ?? "",
        image,
      }
    })
    setCart(normalizedCart)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new Event("cart-updated"))
  }, [cart])

  function persistCart(updatedCart) {
    setCart(updatedCart)
    localStorage.setItem("carrito", JSON.stringify(updatedCart))
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }
    const updatedCart = cart.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item,
    )
    persistCart(updatedCart)
  }

  function removeProduct(productId) {
    persistCart(cart.filter((item) => item._id !== productId))
  }

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, productId: null, productName: "" })
  }, [])

  useEffect(() => {
    if (isAdmin) {
      setToast({ type: "warning", message: "Los administradores no pueden utilizar el carrito." })
      navigate("/admin")
      return
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    if (!confirmModal.isOpen) return

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        closeConfirmModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [confirmModal.isOpen, closeConfirmModal])

  function confirmRemoval() {
    if (!confirmModal.productId) return
    removeProduct(confirmModal.productId)
    closeConfirmModal()
  }

  function clearCart() {
    persistCart([])
    setToast({ type: "info", message: "Carrito limpiado" })
  }

  function proceedToCheckout() {
    if (!cart.length) {
      setToast({ type: "error", message: "Añade algún producto antes de continuar" })
      return
    }
    if (!isAuthenticated) {
      setToast({ type: "info", message: "Inicia sesión para continuar con el pago" })
      navigate("/login")
      return
    }
    navigate("/checkout")
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99
  const total = subtotal + shipping

  return (
    <div className="container cartpage-padding-y-2 cartpage-minh-70vh">
      <div className="cart-hero">
        <div>
          <h1 className="cart-title">Carrito</h1>
          <p className="text-center">
            Tus productos favoritos están esperando.<br/>
            Añade ítems y pasa al pago seguro.
          </p>
        </div>
        <div className="cart-hero-actions">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast((prev) => ({ ...prev, message: "" }))} />
          <button className="btn btn-secondary" onClick={clearCart} disabled={!cart.length}>
            Vaciar Carrito
          </button>
          <button className="btn btn-primary" onClick={proceedToCheckout} disabled={!cart.length}>
            Pagar
          </button>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card">
          <p>Tu carrito está vacío.</p>
          <p className="text-small">Añade productos para continuar con el proceso de compra.</p>
        </div>
      ) : (
        <>
          <div className="cart-table">
            <div className="cart-table-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Subtotal</span>
              <span>Acciones</span>
            </div>
            {cart.map((item) => (
              <div key={item._id} className="cart-table-row">
                <div>
                <div className="cart-item-info">
                    <img
                      src={item.image || item.imagen || '/assets/no-image.png'}
                      alt={item.name}
                      className="cart-item-thumbnail"
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <p className="text-small">{item.category}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1}
                    onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                    className="input input-quantity"
                  />
                </div>
                <div>{formatCurrency(item.price)}</div>
                <div>{formatCurrency((item.price || 0) * (item.quantity || 0))}</div>
                <div>
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() =>
                      setConfirmModal({ isOpen: true, productId: item._id, productName: item.name })
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Envío</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          {confirmModal.isOpen && (
            <div
              className="modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-title"
              onClick={closeConfirmModal}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="icon-button modal-close-button"
                  aria-label="Cerrar modal"
                  onClick={closeConfirmModal}
                >
                  ×
                </button>
                <h3 className="modal-title" id="confirm-delete-title">
                  Confirmar eliminación
                </h3>
                <div className="modal-body">
                  <p className="modal-message">
                    ¿Estás seguro de querer eliminar{" "}
                    <strong>{confirmModal.productName}</strong> del carrito?
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeConfirmModal}
                  >
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={confirmRemoval}>
                    Eliminar producto
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CartPage
