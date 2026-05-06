
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Toast from "../components/Toast.js"
import { formatCurrency } from "../utils/format"

function CartPage() {
  const [cart, setCart] = useState([])
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState({ type: "info", message: "" })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, productId: null, productName: "" })
  const location = useLocation();


    useEffect(() => {
      if (cart.length === 0 && confirmModal.isOpen) {
        setConfirmModal({ isOpen: false, productId: null, productName: "" });
      }
    }, [cart.length, confirmModal.isOpen]);

  
  useEffect(() => {
    const syncCart = () => {
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
    }
    syncCart()
    const handleStorage = (e) => {
      if (e.key === "carrito" || e.key === null) {
        syncCart()
      }
    }
    window.addEventListener("storage", handleStorage)
    window.addEventListener("cart-updated", syncCart)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("cart-updated", syncCart)
    }
  }, [])


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

  useEffect(() => {
    setConfirmModal({ isOpen: false, productId: null, productName: "" });
  }, [location.pathname]);

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
    <div className="container cartpage-padding-y-2 cartpage-minh-70vh" data-testid="cart-page">
      <div className="cart-hero" data-testid="cart-hero">
        <div className="cart-hero-content">
          <h1 className="cart-title" data-testid="cart-title">Tu Carrito de Compras</h1>
          <p className="cart-subtitle">
            Revisa los productos que has seleccionado. Cuando estés listo, procede al pago de forma segura.
          </p>
        </div>
        <div className="cart-hero-actions" data-testid="cart-hero-actions">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast((prev) => ({ ...prev, message: "" }))} />
          <button
            className="btn btn-secondary"
            onClick={clearCart}
            disabled={!cart.length}
            data-testid="empty-cart-button"
          >
            Vaciar Carrito
          </button>
          <button
            className="btn btn-primary"
            onClick={proceedToCheckout}
            disabled={!cart.length}
            data-testid="pay-button"
          >
            Pagar
          </button>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card" data-testid="cart-empty-message">
          <h3>Tu carrito está vacío</h3>
          <p className="text-muted">Parece que aún no has añadido ningún producto. Explora nuestro catálogo y encuentra lo que necesitas.</p>
          <button
            className="btn btn-outline mt-4"
            onClick={() => navigate('/productos')}
            data-testid="go-products-button"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <>
          <div className="cart-table" data-testid="cart-products-list">
            <div className="cart-table-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Subtotal</span>
              <span>Acciones</span>
            </div>
            {cart.map((item) => (
              <div key={item._id} className="cart-table-row" data-testid={`cart-product-${item._id}`}>
                <div className="cart-col-product">
                  <div className="cart-item-info">
                    <img
                      src={item.image || item.imagen || '/assets/no-image.png'}
                      alt={item.name}
                      className="cart-item-thumbnail"
                      data-testid={`cart-product-image-${item._id}`}
                    />
                    <div>
                      <strong data-testid={`cart-product-name-${item._id}`}>{item.name}</strong>
                      <p className="text-small" data-testid={`cart-product-category-${item._id}`}>{item.category}</p>
                    </div>
                  </div>
                </div>
                <div className="cart-col-quantity" data-label="Cantidad">
                  <input
                    type="number"
                    min="1"
                    value={typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1}
                    onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                    className="input input-quantity"
                    data-testid={`cart-product-qty-${item._id}`}
                  />
                </div>
                <div className="cart-col-price" data-label="Precio" data-testid={`cart-product-price-${item._id}`}>
                  {formatCurrency(item.price)}
                </div>
                <div className="cart-col-subtotal" data-label="Subtotal" data-testid={`cart-product-subtotal-${item._id}`}>
                  {formatCurrency((item.price || 0) * (item.quantity || 0))}
                </div>
                <div className="cart-col-actions" data-label="Acciones">
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() =>
                      setConfirmModal({ isOpen: true, productId: item._id, productName: item.name })
                    }
                    data-testid={`cart-product-remove-${item._id}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-summary" data-testid="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span data-testid="cart-summary-subtotal">{formatCurrency(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Envío</span>
                <span data-testid="cart-summary-shipping">{formatCurrency(shipping)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span data-testid="cart-summary-total">{formatCurrency(total)}</span>
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
              data-testid="cart-remove-modal"
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
                  data-testid="cart-remove-modal-close"
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
                    data-testid="cart-remove-modal-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={confirmRemoval}
                    data-testid="cart-remove-modal-confirm"
                  >
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

