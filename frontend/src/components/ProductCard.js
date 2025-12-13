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
        <h3 className="product-title color-primary fw-bold">{product.name}</h3>
        <div className="product-info-header">
          <p className="product-category color-success fw-bold">{product.category}</p>
          <span className="product-price color-primary fw-bold">{formatCurrency(product.price)}</span>
        </div>

        <div className="product-card-actions-row product-card-actions-equal">
          <button
            type="button"
            onClick={handleBuy}
            className="btn btn-primary btn-ms btn-equal"
            disabled={!canPurchase}
            style={{ cursor: canPurchase ? "pointer" : "not-allowed" }}
          >
            Comprar
          </button>
          <Link
            to={`/productos/${product._id}`}
            className="btn btn-secondary btn-ms btn-equal"
          >
            Ver detalles
          </Link>
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


