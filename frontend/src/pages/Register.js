import "../styles/pages/baseForm.css";

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { auth } from "../api/api"
import Toast from "../components/Toast.js"

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    ciudad: "Barcelona",
    codigoPostal: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [toast, setToast] = useState({ type: "info", message: "" })
  const [profileImage, setProfileImage] = useState("")
  const [profileImageName, setProfileImageName] = useState("")
  const [imagePreview, setImagePreview] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setToast({ type: "info", message: "" })

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
      setToast({
        type: "error",
        message: "Por favor, completa nombre, email y contraseña.",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload = {}
      payload.name = formData.nombre.trim()
      payload.email = formData.email.trim()
      payload.password = formData.password.trim()
      if (formData.telefono?.trim()) payload.phone = formData.telefono.trim()
      if (formData.direccion?.trim()) payload.address = formData.direccion.trim()
      if (formData.ciudad?.trim()) payload.city = formData.ciudad.trim()
      if (formData.codigoPostal?.trim()) payload.postalCode = formData.codigoPostal.trim()
      if (profileImage) {
        payload.image = profileImage
        if (profileImageName) {
          payload.imageName = profileImageName
        }
      }

      const response = await auth.register(payload)
      login(response.data.user, response.data.token)
      navigate("/perfil")
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "Error al registrarse"
      setToast({
        type: "error",
        message: mensaje,
      })
      setIsLoading(false)
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setProfileImage("")
      setImagePreview("")
      setProfileImageName("")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
      setImagePreview(reader.result)
    }
    setProfileImageName(file.name)
    reader.readAsDataURL(file)
  }

  return (
    <div className="base-form-shell">
      <div className="base-form-card">
        <form className="base-form" onSubmit={handleSubmit}>
          <h2 className="base-form-title">Crear Cuenta</h2>

          <div className="base-form-group">
            <label className="base-form-label">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="base-form-input"
              required
              aria-label="Nombre completo"
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="base-form-input"
              required
              placeholder="nombre@ejemplo.com"
              aria-label="Email"
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label">Contraseña</label>
            <div className="password-field">
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="base-form-input"
                required
                aria-label="Contraseña"
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setMostrarPassword((prev) => !prev)}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? (
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

          <div className="base-form-group">
            <label className="base-form-label">Imagen de perfil (opcional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="base-form-input" />
            {imagePreview && (
              <div className="register-img-preview">
                <img
                  src={imagePreview}
                  alt="Previsualización de perfil"
                  className="register-img"
                />
              </div>
            )}
          </div>

          <div className="base-form-group">
            <label className="base-form-label">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="base-form-input"
              placeholder="+34 600 000 000"
              aria-label="Teléfono"
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="base-form-input"
              aria-label="Dirección"
            />
          </div>

          <div className="flex gap-2">
            <div className="base-form-group register-flex-2">
              <label className="base-form-label">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="base-form-input"
                aria-label="Ciudad"
              />
            </div>

            <div className="base-form-group register-flex-1">
              <label className="base-form-label">Código Postal</label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                className="base-form-input"
                aria-label="Código postal"
              />
            </div>
          </div>

          <Toast
            type={toast.type}
            message={toast.message}
            duration={6000}
            onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
          />

          <button
            type="submit"
            className="btn btn-primary register-btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>

          <p className="text-center mt-2">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="register-link-primary">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
