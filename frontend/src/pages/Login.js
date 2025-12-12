import "../styles/pages/baseForm.css";

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { auth } from "../api/api"
import Toast from "../components/Toast.js"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [toast, setToast] = useState({ type: "info", message: "" })

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setToast({ type: "info", message: "" })
    setIsLoading(true)

    try {
      const response = await auth.login(email, password)
      login(response.data.user, response.data.token)
      if (response.data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/productos")
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.mensaje || "Error al iniciar sesión",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="base-form-shell">
      <div className="base-form-card">
        <form className="base-form" onSubmit={handleSubmit}>
          <h2 className="base-form-title">Iniciar Sesión</h2>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="base-form-input"
              required
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="password">
              Contraseña
            </label>
            <div className="password-field">
              <input
                type={mostrarPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="base-form-input"
                required
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

          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
          />

          <button
            type="submit"
            className="btn btn-primary login-btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          <p className="text-center mt-2">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="login-link-primary">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
