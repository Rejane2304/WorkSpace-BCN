import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import { translateOrderStatus } from "../utils/translation";

function OrderCard({ order }) {
  const items = order.items || order.productos || [];
  return (
    <article className="order-card">
      <div className="order-card-content">
        <div className="text-small order-card-status">{translateOrderStatus(order.status)}</div>
        <div className="order-card-items">
          {items.map((item, idx) => {
            const prod = item.product || item.producto || {};
            const imgSrc = prod.image || prod.imagen || "/assets/no-image.png";
            const prodName = prod.name || item.name || prod.nombre || "Producto";
            return (
              <div key={idx} className="order-card-item">
                <img
                  src={imgSrc}
                  alt={prodName}
                  className="order-card-item-img"
                />
                <div className="order-card-item-info">
                  <div className="order-card-item-name">{prodName}</div>
                  <div className="text-small order-card-item-meta">{item.quantity || item.cantidad || 1} × {formatCurrency((item.unitPrice ?? item.precioUnitario ?? prod.price) || 0)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="order-card-total-section">
        <div className="text-small order-card-total-label">Total</div>
        <div className="order-card-total-value">{formatCurrency(order.total)}</div>
      </div>
      <Link to={`/orders/${order._id}`} className="btn btn-secondary order-card-btn">
        Ver pedido
      </Link>
    </article>
  );
}

export default OrderCard;
