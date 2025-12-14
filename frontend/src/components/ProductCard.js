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
        <h3 className="product-title fw-bold">{product.name}</h3>
        <div className="product-info-header d-flex align-center justify-between">
          <p className="product-category text-success m-0" style={{ fontWeight: 700 }}>{product.category}</p>
          <span className="product-price text-primary fs-lg" style={{ fontWeight: 700 }}>{formatCurrency(product.price)}</span>
        </div>

        <div className="product-card-actions-row product-card-actions-equal d-flex gap-1">
          <button
            type="button"
            onClick={handleBuy}
            className="btn btn-primary btn-equal"
            disabled={!canPurchase}
            style={{ cursor: canPurchase ? "pointer" : "not-allowed" }}
          >
            Comprar
          </button>
          <Link
            to={`/productos/${product._id}`}
            className="btn btn-secondary btn-equal"
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
          <p className="product-out-stock text-center" style={{ marginTop: "0.5rem" }}>
            Producto sin stock
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard 


