"use client"

import { devError } from "../../utils/devlog"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { products as productsAPI } from "../../api/api"
import Modal from "../../components/Modal"


function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated } = useAuth()

  const normalizeCategoryValue = (value = "Informática") => {
    if (!value) return "Informática"
    const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    if (normalized === "informatica") return "Informática"
    if (normalized === "oficina") return "Oficina"
    if (normalized === "audiovisual") return "Audiovisual"
    return value
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Informática",
    stock: "",
    minStock: "2",
    maxStock: "20",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
      return
    }

    if (!isAdmin) {
      setModalConfig({
        isOpen: true,
        title: "Acceso denegado",
        message: "No tienes permisos para acceder a esta página.",
        confirmLabel: "Ir al inicio",
        cancelLabel: null,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          navigate("/")
        },
        onCancel: null,
      })
    }
  }, [isAdmin, isAuthenticated, navigate])

  useEffect(() => {
    async function loadProduct() {
      if (!isAdmin || !isAuthenticated) return

      try {
        const response = await productsAPI.getById(id)
        const product = response.data
        const safeNumber = (value, fallback) =>
          value != null && value !== "" ? String(value) : String(fallback ?? "")

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          category: normalizeCategoryValue(product.category || ""),
          stock: safeNumber(product.stock, product.stock ?? ""),
          minStock: safeNumber(product.minStock ?? product.stockMinimo, 2),
          maxStock: safeNumber(product.maxStock ?? product.stockMaximo, 20),
          image: product.image || "",
        })
        setImagePreview(product.image || "")
      } catch (error) {
        devError(" Error al cargar producto:", error)
        setModalConfig({
          isOpen: true,
          title: "Error al cargar",
          message: "No se pudo cargar el producto. Intenta de nuevo.",
          confirmLabel: "Volver",
          cancelLabel: null,
          onConfirm: () => {
            setModalConfig((prev) => ({ ...prev, isOpen: false }))
            navigate("/admin/productos")
          },
          onCancel: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, isAdmin, isAuthenticated, navigate])

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return formData.imagen

    setIsUploadingImage(true)
    try {
      const response = await productsAPI.uploadImage(imageFile, formData.category ?? formData.categoria)
      return response.data.url
    } catch (error) {
      devError(" Error al subir imagen:", error)
      setModalConfig({
        isOpen: true,
        title: "Error al subir imagen",
        message: "Error al subir imagen: " + (error.response?.data?.mensaje || "Error desconocido"),
        confirmLabel: "Cerrar",
        cancelLabel: null,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
        onCancel: null,
      })
      return formData.imagen
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      let imagenUrl = formData.imagen
      if (imageFile) {
        imagenUrl = await uploadImageToCloudinary()
      }

      const data = {
        ...formData,
        image: imagenUrl,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        minStock: Number.parseInt(formData.minStock),
        maxStock: Number.parseInt(formData.maxStock),
      }

      await productsAPI.update(id, data)

      setModalConfig({
        isOpen: true,
        title: "Producto actualizado",
        message: "El producto se ha actualizado correctamente.",
        confirmLabel: "Volver a productos",
        cancelLabel: null,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          navigate("/admin/productos")
        },
        onCancel: null,
      })
    } catch (error) {
      devError(" Error al guardar producto:", error)
      setModalConfig({
        isOpen: true,
        title: "Error al guardar",
        message: "Error al guardar producto: " + (error.response?.data?.mensaje || "Error desconocido"),
        confirmLabel: "Cerrar",
        cancelLabel: null,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
        onCancel: null,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container admin-padding-y-2">
        <p>Cargando producto...</p>
      </div>
    )
  }

  return (
    <div className="container admin-padding-y-2">
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

      <h1 className="page-title">Editar Producto</h1>

      <div className="card admin-margin-top-1-5">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="textarea" />
          </div>

          <div className="form-group">
            <label className="label">Imagen del Producto</label>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="input" />
            {imagePreview && (
              <div className="admin-margin-top-1">
                  <img
                    src={imagePreview}
                    alt="Previsualización"
                    className="admin-img-preview"
                  />
              </div>
            )}
            {isUploadingImage && (
              <p className="admin-text-accent admin-margin-top-0-5">Subiendo imagen...</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="form-group admin-flex-1">
              <label className="label">Precio (€)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group admin-flex-1">
              <label className="label">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select"
                required
              >
                <option value="Informática">Informática</option>
                <option value="Oficina">Oficina</option>
                <option value="Audiovisual">Audiovisual</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="form-group admin-flex-1">
              <label className="label">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group admin-flex-1">
              <label className="label">Stock Mínimo</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group admin-flex-1">
              <label className="label">Stock Máximo</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={isUploadingImage}>
              {isUploadingImage ? "Subiendo..." : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/productos")}
              className="btn btn-secondary"
              disabled={isUploadingImage}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductEdit
