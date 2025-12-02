import "../styles/pages/cart.css";

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Toast from "../components/Toast.js"
import { customers, orders, payments } from "../api/api"
import { formatCurrency } from "../utils/format"
import { hasValue } from "../utils/validation"
import PaymentMethodSelect from "../components/PaymentMethodSelect"
import { flushSync } from "react-dom"
import { useToastManager } from "../hooks/useToastManager"


function CheckoutPage() {
  const [cart, setCart] = useState([])
  const [shippingAddress, setShippingAddress] = useState({
    nombre: "",
    email: "",
    calle: "",
    ciudad: "Barcelona",
    codigoPostal: "",
    pais: "España",
    telefono: "",
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("tarjeta")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast, updateToast, clearToast } = useToastManager()

  const { isAuthenticated, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const handleBackToCart = () => navigate("/carrito")

  const safeSetIsSubmitting = useCallback((value) => flushSync(() => setIsSubmitting(value)), [])
  const safeSetShippingAddress = useCallback(
    (updater) => {
      flushSync(() =>
        setShippingAddress((prev) =>
          typeof updater === "function" ? updater(prev) : { ...prev, ...updater },
        ),
      )
    },
    [],
  )

  useEffect(() => {
    if (isAdmin) {
      updateToast({ type: "warning", message: "Los administradores no pueden completar un pago." })
      navigate("/admin")
      return
    }
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout")
      return
    }
    const savedCart = JSON.parse(localStorage.getItem("carrito") || "[]")
    const normalizedCart = savedCart.map(item => ({
      ...item,
      precio: item.precio ?? item.price ?? 0,
      cantidad: item.cantidad ?? item.quantity ?? 1,
      nombre: item.nombre ?? item.name ?? '',
      imagen: item.imagen ?? item.image ?? '',
    }))
    setCart(normalizedCart)

    async function loadProfile() {
      try {
        const profileRes = await customers.getProfile()
        const profile = profileRes.data || {}
        safeSetShippingAddress((prev) => ({
          ...prev,
          nombre: profile.nombre || profile.name || user?.nombre || user?.name || prev.nombre,
          email: profile.email || user?.email || prev.email,
          calle: profile.direccion || profile.address || profile.direccion_envio || prev.calle,
          ciudad: profile.ciudad || profile.city || profile.ciudad_residencia || prev.ciudad,
          codigoPostal: profile.codigoPostal || profile.postalCode || profile.codigo_postal || prev.codigoPostal,
          pais: profile.pais || profile.country || prev.pais,
          telefono: profile.telefono || profile.phone || profile.telefono_contacto || prev.telefono,
        }))
        setProfileLoaded(true)
      } catch (error) {
        setProfileLoaded(false)
        console.error("No se pudieron cargar los datos del cliente:", error)
      }
    }
    loadProfile()
  }, [isAuthenticated, isAdmin, navigate, safeSetShippingAddress, updateToast, user])

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target
      safeSetShippingAddress((prev) => ({ ...prev, [name]: value }))
    },
    [safeSetShippingAddress],
  )

  const subtotal = cart.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 0), 0)
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99
  const total = subtotal + shipping

  async function handleConfirm() {
    if (
      !hasValue(shippingAddress.nombre) ||
      !hasValue(shippingAddress.email) ||
      !hasValue(shippingAddress.calle) ||
      !hasValue(shippingAddress.codigoPostal) ||
      !hasValue(shippingAddress.telefono)
    ) {
      updateToast({ type: "error", message: "Completa todos los campos de envío antes de continuar" })
      return
    }
    if (!cart.length) {
      updateToast({ type: "error", message: "Tu carrito está vacío" })
      return
    }

    safeSetIsSubmitting(true)
    try {
      const items = cart.map((item) => ({
        product: item._id,
        quantity: item.cantidad,
        unitPrice: item.precio,
        producto: item._id,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
      }))

      const shippingPayload = {
        name: shippingAddress.nombre,
        email: shippingAddress.email,
        street: shippingAddress.calle,
        city: shippingAddress.ciudad,
        postalCode: shippingAddress.codigoPostal,
        country: shippingAddress.pais,
        phone: shippingAddress.telefono,
        ...shippingAddress,
      }

      const orderResponse = await orders.create({
        productos: items,
        items,
        shippingAddress: shippingPayload,
        paymentMethod,
        paymentDetails: { metodo: paymentMethod, referencia: `CHK-${Date.now()}` },
      })

      const { order: createdOrder, saleId: saleFromOrder } = orderResponse.data
      const saleId =
        saleFromOrder ??
        createdOrder?.sale?._id ??
        createdOrder?.sale ??
        createdOrder?.venta?._id ??
        createdOrder?.venta ??
        createdOrder?.saleId
      if (!saleId) {
        throw new Error("No se pudo identificar la venta asociada a la orden")
      }

      const paymentResponse = await payments.create({
        saleId,
        orderId: createdOrder._id,
        paymentMethod,
        paymentDetails: {
          metodo: paymentMethod,
          referencia: `PAY-${Date.now()}`,
        },
      })

      const paymentSucceeded =
        paymentResponse.data?.success ?? paymentResponse.data?.exito ?? false

      if (!paymentSucceeded) {
        try {
          await orders.cancel(createdOrder._id)
        updateToast({
          type: "error",
          message:
            "El pago no se pudo procesar. Hemos revertido la orden. Por favor, inténtalo otra vez.",
          })
        } catch (cancelError) {
          updateToast({
            type: "error",
            message:
              "El pago falló y no se pudo cancelar la orden automáticamente. Por favor, contacta con soporte.",
          })
        }
        return
      }

      localStorage.removeItem("carrito")
      window.dispatchEvent(new Event("cart-updated"))
      navigate(`/orders/success/${createdOrder._id}`, { replace: true })
    } catch (error) {
      updateToast({
        type: "error",
        message: "No se pudo crear el pedido: " + (error.response?.data?.mensaje || error.message),
      })
    } finally {
      safeSetIsSubmitting(false)
    }
  }

  return (
    <div className="container checkout-padding-y-2">
      <h1 className="page-title">Pago</h1>
      <div className="checkout-actions">
        <button type="button" className="btn btn-secondary" onClick={handleBackToCart}>
          Volver al carrito
        </button>
      </div>

      <div className="checkout-layout">
        <section className="card checkout-form">
          <h2>Datos de envío</h2>
          {profileLoaded && (
            <div className="checkout-info-msg checkout-mb-18">
              <span>
                Datos cargados automáticamente.<br/>
                Puedes editarlos antes de confirmar el pedido.
              </span>
            </div>
          )}
          <form autoComplete="on" onSubmit={e => { e.preventDefault(); handleConfirm(); }}>
            <div className="form-group">
              <label className="label">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                aria-label="Nombre completo"
                value={shippingAddress.nombre}
                onChange={handleChange}
                className="input"
                placeholder="Ej: María Rodríguez"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Email de contacto</label>
              <input
                type="email"
                name="email"
                aria-label="Email"
                value={shippingAddress.email}
                onChange={handleChange}
                className="input"
                placeholder="Ej: maria@ejemplo.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Calle</label>
              <input
                type="text"
                name="calle"
                aria-label="Calle"
                value={shippingAddress.calle}
                onChange={handleChange}
                className="input"
                placeholder="Ej: Gran Via 123, 2ºB"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="form-group checkout-flex-1">
                <label className="label">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  aria-label="Ciudad"
                  value={shippingAddress.ciudad}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Barcelona"
                  required
                />
              </div>
              <div className="form-group checkout-flex-1">
                <label className="label">Código postal</label>
                <input
                  type="text"
                  name="codigoPostal"
                  aria-label="Código postal"
                  value={shippingAddress.codigoPostal}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: 08001"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="form-group checkout-flex-1">
                <label className="label">País</label>
                <input
                  type="text"
                  name="pais"
                  aria-label="País"
                  value={shippingAddress.pais}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: España"
                  required
                />
              </div>
              <div className="form-group checkout-flex-1">
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  aria-label="Teléfono"
                  value={shippingAddress.telefono}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: 600123456"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Método de pago</label>
              <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} />
            </div>
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={clearToast}
            />
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Procesando..." : "Confirmar pedido"}
            </button>
          </form>
        </section>

        <section className="card checkout-summary">
          <h2>Resumen del carrito</h2>
          <div className="checkout-summary-items">
            {cart.map((item) => (
              <div key={item._id} className="checkout-summary-item">
                  <img
                    src={item.imagen || item.image}
                    alt={item.nombre}
                    className="checkout-summary-thumb"
                  />
                <div>
                  <strong>{item.nombre}</strong>
                  <p className="text-small">{item.cantidad} unidades</p>
                </div>
                <span>{formatCurrency((item.precio || 0) * (item.cantidad || 0))}</span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
              <p>Subtotal: {formatCurrency(subtotal)}</p>
              <p>Envío: {formatCurrency(shipping)}</p>
              <p>
                <strong>Total: {formatCurrency(total)}</strong>
              </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CheckoutPage
