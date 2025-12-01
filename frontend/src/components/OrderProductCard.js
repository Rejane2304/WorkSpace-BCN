import { useState } from "react"
import { formatCurrency } from "../utils/format"
import { getItemImage } from "../utils/orderHelpers"

function OrderProductCard({ item }) {
  const imageUrl = getItemImage(item);
  const [imgError, setImgError] = useState(false);
  
  const { getItemPrice, getItemQuantity } = require("../utils/orderHelpers");
  const qty = getItemQuantity(item);
  const unit = getItemPrice(item);
  return (
    <div className="order-product-card">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={item.producto?.name || item.name}
          className="checkout-summary-thumb order-product-thumb"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="checkout-summary-thumb no-image-fallback order-product-thumb-fallback">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17l2-2a2 2 0 0 1 2.8 0l2.2 2.2M8 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
        </div>
      )}
      <div className="order-product-info">
        <div className="texto-grande order-product-name">{item.producto?.name || item.name}</div>
        <div className="texto-pequeno order-product-meta">
          {qty} x <span className="order-product-price">{formatCurrency(unit)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderProductCard
