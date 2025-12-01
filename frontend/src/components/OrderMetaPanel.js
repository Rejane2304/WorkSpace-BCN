import { formatAddressLine } from "../utils/orderHelpers";
import { translateOrderStatus, translatePaymentMethod } from "../utils/translation";

function OrderMetaPanel({ order, shippingAddress }) {
  return (
    <section className="order-meta-panel">
      <div className="order-meta-block">
        <h3 className="order-meta-title">Dirección de envío</h3>
        <div className="texto-pequeno order-meta-text">{formatAddressLine(shippingAddress) || "-"}</div>
        <div className="texto-pequeno order-meta-subtext">{shippingAddress.phone}</div>
      </div>
      <div className="order-meta-block">
        <h3 className="order-meta-title">Pago</h3>
        <div className="texto-pequeno order-meta-text">
          Método: <span className="order-meta-value">{translatePaymentMethod(order.paymentMethod || order.payment?.paymentMethod)}</span>
        </div>
        <div className="texto-pequeno order-meta-subtext">
          Estado: <span className="order-meta-value">{translateOrderStatus(order.payment?.status ?? order.status)}</span>
        </div>
      </div>
    </section>
  );
}

export default OrderMetaPanel;
