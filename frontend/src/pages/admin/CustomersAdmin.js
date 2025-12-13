"use client";

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { customers as customersAPI, auth } from "../../api/api"
import Modal from "../../components/Modal"
import Toast from "../../components/Toast"

function CustomersAdmin() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState("")
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Aceptar",
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
  })
  const [editCustomer, setEditCustomer] = useState(null)
  const [editForm, setEditForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    imagen: "",
  })
  const [editImageFile, setEditImageFile] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    nombre: "",
    email: "",
    password: "",
    passwordConfirm: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    imagen: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createImageFile, setCreateImageFile] = useState(null)
  const [isUploadingCreateImage, setIsUploadingCreateImage] = useState(false)

  function handleCreateImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setCreateImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setCreateForm((prev) => ({
        ...prev,
        imagen: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }
  const [mostrarPasswordCreate, setMostrarPasswordCreate] = useState(false)
  const [mostrarPasswordCreateConfirm, setMostrarPasswordCreateConfirm] = useState(false)
  const [toast, setToast] = useState({ type: "info", message: "" })
  const { isAdmin, isAuthenticated, user, updateUser } = useAuth()
  const navigate = useNavigate()

  function handleCreateChange(e) {
    const { name, value } = e.target
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const loadCustomers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return

    try {
      const response = await customersAPI.getAll()
      const clientesOrdenados = [...(response.data || [])].sort((a, b) => {
        const aName = (a?.nombre || a?.name || "").trim()
        const bName = (b?.nombre || b?.name || "").trim()
        return aName.localeCompare(bName, "es", { sensitivity: "base" })
      })
      setCustomers(clientesOrdenados)
    } catch (error) {
      console.error("Error al cargar customers:", error)
    }
  }, [isAuthenticated, isAdmin])

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
      return
    }
    loadCustomers()
  }, [isAdmin, isAuthenticated, navigate, loadCustomers])

  const filteredCustomers = [...customers]
    .filter(
      (customer) =>
        (customer.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (customer.email?.toLowerCase() || "").includes(search.toLowerCase())
    )

  function getCustomerField(customer, key) {
    const map = {
      nombre: ["nombre", "name"],
      telefono: ["telefono", "phone", "telefono_contacto"],
      direccion: ["direccion", "address", "direccion_envio"],
      ciudad: ["ciudad", "city", "ciudad_residencia"],
      codigoPostal: ["codigoPostal", "postalCode", "codigo_postal"],
      imagen: ["imagen", "image", "imagen_perfil"],
    }
    for (const k of map[key] || [key]) {
      if (customer[k]) return customer[k]
    }
    return ""
  }

  async function handleEdit(customer) {
    setEditCustomer(customer)
    setEditForm({
      nombre: getCustomerField(customer, "nombre"),
      email: customer.email || "",
      telefono: getCustomerField(customer, "telefono"),
      direccion: getCustomerField(customer, "direccion"),
      ciudad: getCustomerField(customer, "ciudad"),
      codigoPostal: getCustomerField(customer, "codigoPostal"),
      imagen: getCustomerField(customer, "imagen"),
    })
    setEditImageFile(null)
  }

  async function handleEditSave() {
    if (!editCustomer) return

    try {
      let imagenUrl = editForm.imagen

      if (editImageFile) {
        setIsUploadingImage(true)
        try {
          const uploadResponse = await customersAPI.uploadProfileImage(editImageFile)
          imagenUrl = uploadResponse.data.url
        } finally {
          setIsUploadingImage(false)
        }
      }

      const payload = {
        nombre: editForm.nombre.trim(),
        telefono: editForm.telefono.trim(),
        direccion: editForm.direccion.trim(),
        ciudad: editForm.ciudad.trim(),
        codigoPostal: editForm.codigoPostal.trim(),
        imagen: imagenUrl,
      }

      const response = await customersAPI.update(editCustomer._id, payload)
      setCustomers((prev) => prev.map((c) => (c._id === editCustomer._id ? response.data : c)))
      setEditCustomer(null)

      if (user && (user.id === response.data._id || user.id === editCustomer._id)) {
        updateUser({
          nombre: response.data.nombre,
          imagen: response.data.imagen,
          telefono: response.data.telefono,
          direccion: response.data.direccion,
          ciudad: response.data.ciudad,
          codigoPostal: response.data.codigoPostal,
        })
      }

      setModalConfig({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "Aceptar",
        cancelLabel: null,
        onConfirm: null,
        onCancel: null,
      })
      setToast({ type: "success", message: "El cliente se ha actualizado correctamente." })
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.mensaje || "No se pudo actualizar el cliente. Intenta de nuevo.",
      })
    }
  }

  async function handleEditImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setEditImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditForm((prev) => ({
        ...prev,
        imagen: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  async function handleCreateSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    try {
      if (!createForm.password || !createForm.passwordConfirm) {
        setModalConfig({
          isOpen: true,
          title: "Contraseña requerida",
          message: "Debes indicar una contraseña y su confirmación para el nuevo cliente.",
          confirmLabel: "Cerrar",
          cancelLabel: null,
          onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          onCancel: null,
        })
        return
      }

      if (createForm.password !== createForm.passwordConfirm) {
        setModalConfig({
          isOpen: true,
          title: "Contraseña no coincide",
          message: "La contraseña y su confirmación deben ser iguales.",
          confirmLabel: "Cerrar",
          cancelLabel: null,
          onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          onCancel: null,
        })
        return
      }

      if (createForm.password.length < 6) {
        setModalConfig({
          isOpen: true,
          title: "Contraseña insegura",
          message: "La contraseña debe tener al menos 6 caracteres.",
          confirmLabel: "Cerrar",
          cancelLabel: null,
          onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          onCancel: null,
        })
        return
      }

      setIsCreating(true)
      let imagenUrl = ""

      if (createImageFile) {
        setIsUploadingCreateImage(true)
        try {
          const uploadResponse = await customersAPI.uploadProfileImage(createImageFile)
          imagenUrl = uploadResponse.data.url
        } finally {
          setIsUploadingCreateImage(false)
        }
      }

      await auth.register({
        nombre: createForm.nombre.trim(),
        email: createForm.email.trim(),
        password: createForm.password.trim(),
        telefono: createForm.telefono.trim(),
        direccion: createForm.direccion.trim(),
        ciudad: createForm.ciudad.trim(),
        codigoPostal: createForm.codigoPostal.trim(),
        imagen: imagenUrl,
      })

      await loadCustomers()

      setShowCreateModal(false)
      setCreateForm({
        nombre: "",
        email: "",
        password: "",
        passwordConfirm: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        codigoPostal: "",
        imagen: "",
      })
      setCreateImageFile(null)

      setToast({ type: "success", message: "El nuevo cliente se ha registrado correctamente." })
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.mensaje ||
          "No se pudo crear el cliente. Verifica los datos e inténtalo de nuevo.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(customer) {
    setModalConfig({
      isOpen: true,
      title: "Eliminar cliente",
      message: `¿Seguro que deseas eliminar al cliente ${getCustomerField(customer, "nombre")}?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await customersAPI.delete(customer._id)
          setCustomers((prev) => prev.filter((c) => c._id !== customer._id))
          setToast({ type: "success", message: "El cliente se ha eliminado correctamente." })
        } catch (error) {
          setModalConfig({
            isOpen: true,
            title: "Error al eliminar",
            message: "No se pudo eliminar el cliente. Intenta de nuevo.",
            confirmLabel: "Cerrar",
            cancelLabel: null,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
            onCancel: null,
          })
        }
      },
      onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    })
  }

  return (
    <div className="container customersadmin-padding-y-2">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
      />
      <Modal
        isOpen={!!editCustomer}
        title="Editar cliente"
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
        onConfirm={handleEditSave}
        onCancel={() => setEditCustomer(null)}
      >
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <form className="customersadmin-modal-form">
          <div className="form-group">
            <label className="label">Nombre completo</label>
            <input
              type="text"
              className="input"
              value={editForm.nombre}
              onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))}
              required
            />
          </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" className="input" value={editForm.email} disabled />
        </div>
        <div className="form-group">
          <label className="label">Teléfono</label>
          <input
            type="tel"
            className="input"
            placeholder="+34 600 000 000"
            value={editForm.telefono}
            onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="label">Dirección</label>
          <input
            type="text"
            className="input"
            value={editForm.direccion}
            onChange={(e) => setEditForm((prev) => ({ ...prev, direccion: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="label">Ciudad</label>
          <input
            type="text"
            className="input"
            value={editForm.ciudad}
            onChange={(e) => setEditForm((prev) => ({ ...prev, ciudad: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="label">Código postal</label>
          <input
            type="text"
            className="input"
            placeholder="08001"
            value={editForm.codigoPostal}
            onChange={(e) => setEditForm((prev) => ({ ...prev, codigoPostal: e.target.value }))}
          />
        </div>
          <div className="form-group">
            <label className="label">Imagen de perfil</label>
            <input
              type="file"
              className="input customersadmin-mb-1"
              accept="image/*"
              onChange={handleEditImageChange}
              disabled={isUploadingImage}
              style={{ marginBottom: 16 }}
            />
            {isUploadingImage && (
              <p className="text-secondary customersadmin-mt-0-5">
                Subiendo imagen...
              </p>
            )}
            {(editForm.imagen || editForm.nombre || editForm.email) && (
              <div className="customersadmin-mt-0-75 flex customersadmin-align-center customersadmin-gap-1">
                <div className="header-avatar-lg">
                  {editForm.imagen ? (
                    <img src={editForm.imagen} alt={editForm.nombre || "Imagen de perfil"} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <span>
                      {(editForm.nombre || editForm.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-secondary">Vista previa del avatar del cliente.</p>
              </div>
            )}
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={showCreateModal}
        title="Agregar cliente"
        confirmLabel={isCreating ? "Creando..." : "Crear Cliente"}
        cancelLabel="Cancelar"
        onConfirm={handleCreateSubmit}
        onCancel={() => {
          if (!isCreating) {
            setShowCreateModal(false)
          }
        }}
      >
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <form className="customersadmin-modal-form">
          <div className="form-group">
            <label className="label">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              className="input"
              value={createForm.nombre}
              onChange={handleCreateChange}
              required
            />
          </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input"
            value={createForm.email}
            onChange={handleCreateChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            className="input"
            placeholder="+34 600 000 000"
            value={createForm.telefono}
            onChange={handleCreateChange}
          />
        </div>
        <div className="form-group">
          <label className="label">Dirección</label>
          <input
            type="text"
            name="direccion"
            className="input"
            value={createForm.direccion}
            onChange={handleCreateChange}
          />
        </div>
        <div className="form-group">
          <label className="label">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            className="input"
            value={createForm.ciudad}
            onChange={handleCreateChange}
          />
        </div>
        <div className="form-group">
          <label className="label">Código postal</label>
          <input
            type="text"
            name="codigoPostal"
            className="input"
            placeholder="08001"
            value={createForm.codigoPostal}
            onChange={handleCreateChange}
          />
        </div>
          <div className="form-group">
            <label className="label">Imagen de perfil</label>
            <input
              type="file"
              className="input customersadmin-mb-1"
              accept="image/*"
              onChange={handleCreateImageChange}
              disabled={isUploadingCreateImage}
              style={{ marginBottom: 16 }}
            />
            {isUploadingCreateImage && (
              <p className="text-secondary customersadmin-mt-0-5">
                Subiendo imagen...
              </p>
            )}
            {(createForm.imagen || createForm.nombre || createForm.email) && (
              <div className="customersadmin-mt-0-75 flex customersadmin-align-center customersadmin-gap-1">
                <div className="header-avatar-lg">
                  {createForm.imagen ? (
                    <img src={createForm.imagen} alt={createForm.nombre || "Imagen de perfil"} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <span>
                      {(createForm.nombre || createForm.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-secondary">Vista previa del avatar del cliente.</p>
              </div>
            )}
          </div>
        </form>
        <div className="form-group">
          <label className="label">Contraseña</label>
          <div className="password-field">
            <input
              type={mostrarPasswordCreate ? "text" : "password"}
              name="password"
              className="input"
              value={createForm.password}
              onChange={handleCreateChange}
              required
            />
            <button
              type="button"
              className="btn-toggle-password"
              onClick={() => setMostrarPasswordCreate((prev) => !prev)}
              aria-label={mostrarPasswordCreate ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPasswordCreate ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                  />
                  <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3 1 1 0 1 0 2 0 1 1 0 0 1 1-1 1 1 0 1 0 0-2Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M2.81 2.81 1.39 4.22 4.7 7.53C3.06 8.57 1.78 10.11 1 12c1.73 3.89 6 7 11 7 2.01 0 3.89-.5 5.54-1.39l2.24 2.24 1.41-1.41L2.81 2.81ZM12 17c-2.76 0-5-2.24-5-5 0-.73.16-1.43.44-2.06l1.53 1.53A2.99 2.99 0 0 0 9 12a3 3 0 0 0 3 3c.39 0 .76-.08 1.1-.21l1.53 1.53A4.96 4.96 0 0 1 12 17Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 7c1.43 0 2.73.5 3.76 1.32l1.49-1.49C15.89 5.7 14.02 5 12 5 7 5 2.73 8.11 1 12c.64 1.43 1.62 2.7 2.81 3.76l1.46-1.46C4.46 13.24 4 12.17 4 12c1.73-3.89 6-7 8-7Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Confirmar contraseña</label>
          <div className="password-field">
            <input
              type={mostrarPasswordCreateConfirm ? "text" : "password"}
              name="passwordConfirm"
              className="input"
              value={createForm.passwordConfirm}
              onChange={handleCreateChange}
              required
            />
            <button
              type="button"
              className="btn-toggle-password"
              onClick={() => setMostrarPasswordCreateConfirm((prev) => !prev)}
              aria-label={mostrarPasswordCreateConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPasswordCreateConfirm ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                  />
                  <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3 1 1 0 1 0 2 0 1 1 0 0 1 1-1 1 1 0 1 0 0-2Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M2.81 2.81 1.39 4.22 4.7 7.53C3.06 8.57 1.78 10.11 1 12c1.73 3.89 6 7 11 7 2.01 0 3.89-.5 5.54-1.39l2.24 2.24 1.41-1.41L2.81 2.81ZM12 17c-2.76 0-5-2.24-5-5 0-.73.16-1.43.44-2.06l1.53 1.53A2.99 2.99 0 0 0 9 12a3 3 0 0 0 3 3c.39 0 .76-.08 1.1-.21l1.53 1.53A4.96 4.96 0 0 1 12 17Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 7c1.43 0 2.73.5 3.76 1.32l1.49-1.49C15.89 5.7 14.02 5 12 5 7 5 2.73 8.11 1 12c.64 1.43 1.62 2.7 2.81 3.76l1.46-1.46C4.46 13.24 4 12.17 4 12c1.73-3.89 6-7 8-7Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Modal>
      <div className="mb-2">
        <h1 className="page-title">Gestión de Clientes</h1>
        <button
          type="button"
          className="btn btn-primary mt-1 customersadmin-btn-add"
          onClick={() => setShowCreateModal(true)}
        >
          Agregar Cliente
        </button>
      </div>

      <p className="mb-2">Total de Clientes: {customers.length}</p>

      <div className="customersadmin-filtros-bar-superior" style={{ marginBottom: 24 }}>
        <div className="flex gap-3 customersadmin-flex-center-wrap">
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-filtro customersadmin-input-naranja"
              style={{ border: '2px solid orange', borderRadius: 12 }}
            />
          </div>
        </div>
      </div>

      <div className="customersadmin-overflow-x-auto">
        <table className="customersadmin-table">
          <thead className="customersadmin-table-head">
            <tr>
              <th className="customersadmin-table-th">Nombre</th>
              <th className="customersadmin-table-th">Email</th>
              <th className="customersadmin-table-th">Teléfono</th>
              <th className="customersadmin-table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer._id || customer.email || `${customer.nombre}-${customer.telefono}`}
                className="customersadmin-table-row"
              >
                <td className="customersadmin-table-td">{getCustomerField(customer, "nombre")}</td>
                <td className="customersadmin-table-td">{customer.email}</td>
                <td className="customersadmin-table-td">{getCustomerField(customer, "telefono") || "-"}</td>
                <td className="customersadmin-table-td">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="btn btn-primary customersadmin-btn-sm"
                      onClick={() => handleEdit(customer)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline customersadmin-btn-sm"
                      onClick={() => handleDelete(customer)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default CustomersAdmin
