import { Link } from "react-router-dom"
import { formatCurrency } from "../utils/format"


function ProductCard({ product, onAddToCart, isAdmin }) {
  const isAvailable = product.stock > 0;
  const canPurchase = isAvailable && !isAdmin;

  const handleBuy = () => {
    if (!canPurchase || typeof onAddToCart !== "function") return;
    onAddToCart(product);
  };

  const prod = product || product.producto || {};
  const imgSrc = prod.image || prod.imagen || "/assets/no-image.png";
  const prodName = prod.name || prod.nombre || "Producto";
  return (
    <div className="card product-card">
      <div className="product-image-wrapper">
        <img
          src={imgSrc}
          alt={prodName}
          className="product-image"
        />
      </div>
      <div className="product-info">
        <h3 className="titulo-producto">{product.name}</h3>
        <div className="product-info-header">
          <p className="product-category">{product.category}</p>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </div>

        <div className="product-card-actions-row">
          <div className="product-buttons">
            <Link
              to={`/productos/${product._id}`}
              className="btn btn-secondary btn-ms"
            >
              Ver Detalle
            </Link>
          </div>
          <div className="product-card-actions-right">
            <button
              type="button"
              onClick={handleBuy}
              className="btn btn-primary btn-ms"
              disabled={!canPurchase}
              style={{ cursor: canPurchase ? "pointer" : "not-allowed" }}
            >
              Comprar
            </button>
          </div>
        </div>
        {isAdmin && (
          <div className="product-card-warning">
            Solo clientes pueden comprar
          </div>
        )}
        {!isAvailable && (
          <p className="text-secondary text-center" style={{ marginTop: "0.5rem" }}>
            Producto sin stock
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard 


