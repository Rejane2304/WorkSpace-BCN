import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { products as productsAPI } from "../api/api"
import { formatCurrency } from "../utils/format"
import { useAuth } from "../context/AuthContext"

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await productsAPI.getById(id)
        setProduct(response.data)
      } catch (err) {
        console.error("Error al cargar el producto:", err)
        setError("No se pudo cargar la información del producto.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  function handleBuy() {
    if (!product) return

    const currentCart = JSON.parse(localStorage.getItem("carrito") || "[]")
    const existingProduct = currentCart.find((item) => item._id === product._id)

    if (existingProduct) {
      existingProduct.cantidad += 1
    } else {
      currentCart.push({ ...product, cantidad: 1 })
    }

    localStorage.setItem("carrito", JSON.stringify(currentCart))
    
    window.dispatchEvent(new Event("cart-updated"))
    navigate("/carrito")
  }

  if (isLoading) {
    return (
      <div className="container productdetail-py-3 text-center">
        Cargando producto...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container productdetail-py-3 text-center">
        <p className="text-secondary">{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container productdetail-py-3 text-center">
        <p className="text-secondary">Producto no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="container productdetail-py-3">
      <div className="card product-detail">
        <div className="product-detail-image">
          <img
            src={product.image || product.imagen}
            alt={product.name || product.nombre}
            className="product-image"
          />
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name || product.nombre}</h1>
          <p className={"product-detail-category"}>{product.category || product.categoria}</p>

          {(product.description || product.descripcion) && (
            <p className="productdetail-mt-1">
              {(() => {
                const text = String(product.description || product.descripcion).trim()
                if (!text) return ""
                const lastChar = text[text.length - 1]
                if ([".", "!", "?", "…"].includes(lastChar)) {
                  return text
                }
                return `${text}.`
              })()}
            </p>
          )}

          <div className="product-detail-price">
            {formatCurrency(product.price || product.precio)}
          </div>

          <div className="product-detail-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBuy}
              disabled={isAdmin}
            >
              Comprar
            </button>
            <Link to="/productos" className="btn btn-secondary">
              Volver a Productos
            </Link>
          </div>
          {isAdmin && (
            <div className="product-detail-warning">
              <span className="clients-only-notice">Solo clientes pueden comprar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
