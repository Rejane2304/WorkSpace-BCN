import { formatAddressLine } from "../utils/orderHelpers";
import { translateOrderStatus, translatePaymentMethod } from "../utils/translation";

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'pending' || s === 'pendiente') return 'badge badge-warning';
  if (s === 'processing' || s === 'procesando') return 'badge badge-info';
  if (s === 'shipped' || s === 'enviado') return 'badge badge-purple';
  if (s === 'delivered' || s === 'entregado' || s === 'completed' || s === 'completado') return 'badge badge-success';
  if (s === 'cancelled' || s === 'cancelado' || s === 'failed' || s === 'fallido') return 'badge badge-error';
  if (s === 'paid' || s === 'pagado') return 'badge badge-success';
  return 'badge badge-neutral';
}

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
          Estado: <span className={getStatusBadgeClass(order.payment?.status ?? order.status)}>{translateOrderStatus(order.payment?.status ?? order.status)}</span>
        </div>
      </div>
    </section>
  );
}

export default OrderMetaPanel;
