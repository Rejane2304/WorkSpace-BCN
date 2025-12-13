import { SALE_STATUS_TRANSLATIONS, PAYMENT_STATUS_TRANSLATIONS, toSpanishStatus } from "./translation"

const toSpanishSaleStatus = (status) => toSpanishStatus(status, SALE_STATUS_TRANSLATIONS)
const toSpanishPaymentStatus = (status) => toSpanishStatus(status, PAYMENT_STATUS_TRANSLATIONS)
const extractUserPayload = (payload) => {
  if (!payload) return null
  if (payload.user) return payload.user
  if (payload.usuario) return payload.usuario
  return payload
}

const emptyUser = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  image: "",
  role: "customer",
}

const mapUserFromApi = (payload = {}) => {
  const user = extractUserPayload(payload)
  if (!user) {
    return emptyUser
  }
  return {
    name: user.name || user.nombre || "",
    email: user.email || "",
    phone: user.phone || user.telefono || user.telefono_contacto || "",
    address: user.address || user.direccion || user.direccion_envio || "",
    city: user.city || user.ciudad || user.ciudad_residencia || "",
    postalCode: user.postalCode || user.codigoPostal || user.codigo_postal || "",
    image: user.image || user.imagen || user.imagen_perfil || "",
    role: user.role || user.rol || "customer",
  }
}

const mapUserToApi = (profile = {}) => ({
  name: profile.nombre || "",
  email: profile.email || "",
  phone: profile.telefono || "",
  address: profile.direccion || "",
  city: profile.ciudad || "",
  postalCode: profile.codigoPostal || "",
  image: profile.image || profile.imagen || "",
})

const mapProductFromApi = (product = {}) => ({
  _id: product._id,
  name: product.name || "",
  description: product.description || "",
  price: product.price || 0,
  category: product.category || "Informática",
  stock: product.stock || 0,
  minStock: product.minStock || 0,
  maxStock: product.maxStock || 0,
  image: product.image || "",
})

const mapProductToApi = (form = {}) => ({
  name: form.name || "",
  description: form.description || "",
  price: Number(form.price) || 0,
  category: form.category || "Informática",
  stock: Number(form.stock) || 0,
  minStock: Number(form.minStock) || 0,
  maxStock: Number(form.maxStock) || 0,
  image: form.image || "",
})

const mapSaleFromApi = (sale = {}) => ({
  ...sale,
  cliente: {
    nombre: sale.customer?.name || sale.customer?.nombre || "",
    email: sale.customer?.email || "",
    id: sale.customer?._id || "",
  },
  estado: toSpanishSaleStatus(sale.status || sale.estado || ""),
  items: Array.isArray(sale.items)
    ? sale.items.map((item) => ({
        producto: {
          nombre: item.product?.name || item.product?.nombre || "",
          precio: item.product?.price || item.product?.precio || 0,
          imagen: item.product?.image || item.product?.imagen || "",
          categoria: item.product?.category || item.product?.categoria || "",
          _id: item.product?._id,
        },
        cantidad: item.quantity || item.cantidad,
        precioUnitario: item.unitPrice || item.precioUnitario,
        subtotal: (item.unitPrice || item.precioUnitario || 0) * (item.quantity || item.cantidad || 0),
      }))
    : [],
  total: sale.total || 0,
  shippingCost: sale.shippingCost || 0,
  fechaVenta: sale.saleDate || sale.fechaVenta,
  direccionEnvio: {
    calle: sale.shippingAddress?.street || sale.direccionEnvio?.calle || "",
    ciudad: sale.shippingAddress?.city || sale.direccionEnvio?.ciudad || "",
    codigoPostal: sale.shippingAddress?.postalCode || sale.direccionEnvio?.codigoPostal || "",
  },
})


const buildPaymentSale = (payment = {}) => {
  const sale = payment.sale || payment.order || null;
  if (!sale) {
    return {
      _id: "",
      cliente: {
        nombre: payment.customer?.name || payment.customer?.nombre || "",
        email: payment.customer?.email || "",
        id: payment.customer?._id || "",
      },
    };
  }
  const customer = sale.customer || sale.cliente || {};
  return {
    _id: sale._id,
    cliente: {
      nombre: customer.name || customer.nombre || "",
      email: customer.email || "",
      id: customer._id || "",
    },
    items: sale.items || [],
    shippingCost: sale.shippingCost || 0,
    total: sale.total || 0,
  };
};

const mapPaymentFromApi = (payment = {}) => {
  const paymentDetails = {
    last4Digits: payment.paymentDetails?.last4Digits || payment.paymentDetails?.ultimos4Digitos || "",
    paypalEmail: payment.paymentDetails?.paypalEmail || payment.paymentDetails?.emailPaypal || "",
    ultimos4Digitos: payment.paymentDetails?.last4Digits || payment.paymentDetails?.ultimos4Digitos || "",
    emailPaypal: payment.paymentDetails?.paypalEmail || payment.paymentDetails?.emailPaypal || "",
  };

  const saleObj = payment.sale || payment.order || payment.venta || {};

  return {
    ...payment,
    _id: payment._id,
    amount: payment.amount || payment.monto || 0,
    paymentMethod: payment.paymentMethod || payment.method || payment.metodoPago || "",
    status: payment.status || payment.estado || "",
    paymentDate: payment.paymentDate || payment.fechaPago,
    errorMessage: payment.errorMessage || payment.mensajeError || "",
    sale: saleObj,
    
    monto: payment.amount || payment.monto || 0,
    metodoPago: payment.paymentMethod || payment.method || payment.metodoPago || "",
    estado: toSpanishPaymentStatus(payment.status || payment.estado || ""),
    venta: buildPaymentSale(payment),
    usuario: payment.user || payment.usuario || {},
    fechaPago: payment.paymentDate || payment.fechaPago,
    detallesPago: paymentDetails,
    mensajeError: payment.errorMessage || payment.mensajeError || "",
  };
};

const mapContactToApi = (payload = {}) => ({
  name: payload.nombre,
  email: payload.email,
  phone: payload.telefono,
  subject: payload.asunto,
  message: payload.mensaje,
})

export {
  mapUserFromApi,
  mapUserToApi,
  mapProductFromApi,
  mapProductToApi,
  mapSaleFromApi,
  mapPaymentFromApi,
  mapContactToApi,
}
