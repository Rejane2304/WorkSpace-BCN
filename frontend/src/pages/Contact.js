"use client"

import { useState } from "react"
import { contact } from "../api/api"
import Toast from "../components/Toast.js"

function Contact() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ type: "info", message: "" })

  function manejarCambio(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      await contact.sendMessage(formData)
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
      })
      setToast({ type: "success", message: "¡Mensaje enviado exitosamente! Te responderemos pronto." })
    } catch (err) {
      console.error("Error al enviar mensaje de contacto:", err)
      const msg = "No se pudo enviar tu mensaje. Inténtalo de nuevo más tarde."
      setError(msg)
      setToast({ type: "error", message: msg })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="container contact-padding-y-2-1">
        <h1 className="text-center contact-title">Contacto</h1>
        <p className="text-center contact-mt-1 contact-color-primary-strong">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
        </p>
      </div>

      <div
        className="container contact-page contact-padding-y-2-2 contact-mt-1-5"
      >
        <div className="contact-inner">
          <div className="contact-form-wrapper">
            <div className="card contact-form-card">
          <h2 className="text-center">Envíanos un mensaje</h2>
          {error && (
            <p className="text-error contact-text-center contact-error-mt-1">
              {error}
            </p>
          )}

          <form onSubmit={manejarEnvio} className="contact-mt-2">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
            />
            <div className="flex gap-2 contact-form-row">
            <div className="form-group contact-flex-1">
              <label className="label" htmlFor="contact-nombre">
                Nombre completo *
              </label>
              <input
                id="contact-nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                className="input"
                required
              />
            </div>

            <div className="form-group contact-flex-1">
              <label className="label" htmlFor="contact-email">
                Email *
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={manejarCambio}
                className="input"
                required
                placeholder="nombre@ejemplo.com"
              />
            </div>
            </div>

            <div className="flex gap-2 contact-form-row">
            <div className="form-group contact-flex-1">
              <label className="label" htmlFor="contact-telefono">
                Teléfono
              </label>
              <input
                id="contact-telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={manejarCambio}
                className="input"
                placeholder="+34 600 000 000"
                pattern="^\\+?[0-9\\s]{7,20}$"
                title="Introduce un teléfono válido (solo números, espacios y opcionalmente + al inicio)"
              />
            </div>

            <div className="form-group contact-flex-1">
              <label className="label" htmlFor="contact-asunto">
                Asunto *
              </label>
              <input
                id="contact-asunto"
                type="text"
                name="asunto"
                value={formData.asunto}
                onChange={manejarCambio}
                className="input"
                required
              />
            </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="contact-mensaje">
                Mensaje *
              </label>
              <textarea
                id="contact-mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={manejarCambio}
                className="textarea"
                rows="6"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary contact-btn-block"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
            </div>
          </div>

          <div className="contact-info-panel">
          <div className="contact-text contact-text--double">
            <strong>Horario de Atención</strong>
            <div>
              <span>Lunes - Sábado: 9:00 - 18:00</span>
            </div>
          </div>
          <div className="contact-text">
            <strong>Teléfono</strong>
            <span>+34 934 567 890</span>
          </div>
          <div className="contact-text">
            <strong>Email</strong>
            <span>info@workspacebcn.com</span>
            <span>soporte@workspacebcn.com</span>
          </div>
          <div className="contact-text contact-text--inline">
            <strong>Dirección:</strong>
            <span>Calle Example 123, Barcelona, España, 08001</span>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
