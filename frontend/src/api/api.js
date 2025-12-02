import axios from "axios"
import {
  mapUserFromApi,
  mapUserToApi,
  mapProductFromApi,
  mapProductToApi,
  mapSaleFromApi,
  mapPaymentFromApi,
  mapContactToApi,
} from "../utils/apiMappers"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    // Ensure no double quotes in token
    const cleanToken = token.replace(/^"|"$/g, '')
    config.headers.Authorization = `Bearer ${cleanToken}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, it might mean the token is expired or invalid
      // We should clear the token and redirect to login, but only if we are not already there
      const currentPath = window.location.pathname
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    const userPayload = response.data.user || response.data.usuario
    return {
      ...response,
      data: {
        ...response.data,
        user: mapUserFromApi(userPayload),
      },
    }
  },
  register: async (data) => {
    const payload = {
      ...data,
      name: data.name || data.nombre,
      phone: data.phone || data.telefono,
      address: data.address || data.direccion,
      city: data.city || data.ciudad,
      postalCode: data.postalCode || data.codigoPostal,
    }
    const response = await api.post("/auth/registro", payload)
    const userPayload = response.data.user || response.data.usuario
    return {
      ...response,
      data: {
        ...response.data,
        user: mapUserFromApi(userPayload),
      },
    }
  },
}

export const products = {
  getAll: async () => {
    const response = await api.get("/products")
    const mapped = Array.isArray(response.data) ? response.data.map(mapProductFromApi) : []
    return { ...response, data: mapped }
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return { ...response, data: mapProductFromApi(response.data) }
  },
  create: (data) => api.post("/products", mapProductToApi(data)),
  update: (id, data) => api.put(`/products/${id}`, mapProductToApi(data)),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (file, category) => {
    const formData = new FormData()
    formData.append("imagen", file)
    formData.append("categoria", category)
    return api.post("/products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export const customers = {
  getAll: async () => {
    const response = await api.get("/customers")
    const mapped = Array.isArray(response.data) ? response.data.map(mapUserFromApi) : []
    return { ...response, data: mapped }
  },
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`)
    return { ...response, data: mapUserFromApi(response.data) }
  },
  getProfile: async () => {
    const response = await api.get("/customers/perfil")
    return { ...response, data: mapUserFromApi(response.data) }
  },
  updateProfile: async (data) => {
    const response = await api.put("/customers/perfil", mapUserToApi(data))
    return { ...response, data: mapUserFromApi(response.data) }
  },
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, mapUserToApi(data))
    return { ...response, data: mapUserFromApi(response.data) }
  },
  delete: (id) => api.delete(`/customers/${id}`),
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append("imagen", file)
    return api.post("/profile-image/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export const sales = {
  getAll: async () => {
    const response = await api.get("/sales")
    const salesArray = Array.isArray(response.data?.ventas) ? response.data.ventas : []
    const mappedSales = salesArray.map(mapSaleFromApi)
    return { ...response, data: { ...response.data, sales: mappedSales } }
  },
  getMyPurchases: async () => {
    const response = await api.get("/sales/mis-compras")
    const mapped = Array.isArray(response.data) ? response.data.map(mapSaleFromApi) : []
    return { ...response, data: mapped }
  },
  create: (data) => api.post("/sales", data),
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`)
    return { ...response, data: mapSaleFromApi(response.data) }
  },
  updateStatus: (id, status) => api.put(`/sales/${id}/estado`, { status }),
}

export const orders = {
  create: (data) => api.post("/orders", data),
  getMine: () => api.get("/orders/me"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}

export const payments = {
  create: (data) => api.post("/payments", data),
  getMine: async () => {
    const response = await api.get("/payments/mis-pagos")
    const mapped = Array.isArray(response.data) ? response.data.map(mapPaymentFromApi) : []
    return { ...response, data: mapped }
  },
  getAllAdmin: async () => {
    const response = await api.get("/payments/admin")
    const mapped = Array.isArray(response.data) ? response.data.map(mapPaymentFromApi) : []
    return { ...response, data: mapped }
  },
  getById: async (id) => {
    const response = await api.get(`/payments/${id}`)
    return { ...response, data: mapPaymentFromApi(response.data) }
  },
  updateStatusAdmin: (id, status) => api.put(`/payments/${id}/estado`, { estado: status }),
}

export const inventory = {
  getMovements: (params) => api.get("/inventory/movements", { params }),
  registerMovement: (data) => api.post("/inventory/movements", data),
  getLowStock: () => api.get("/inventory/low-stock"),
  getStats: () => api.get("/inventory/stats"),
  getOverview: (params) => api.get("/inventory/overview", { params }),
}

export const admin = {
  getAlerts: () => api.get("/admin/alerts"),
  getAlertDetail: (alertId) => api.get(`/admin/alerts/${alertId}`),
}

export const contact = {
  sendMessage: (data) => api.post("/contact", mapContactToApi(data)),
}

export default api
