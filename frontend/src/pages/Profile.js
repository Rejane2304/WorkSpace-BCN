import "../styles/pages/baseForm.css";

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { customers } from "../api/api"
import Toast from "../components/Toast.js"
import { normalizePhone, isValidPhone } from "../utils/validation"

function Profile() {
  const { user, isAuthenticated, updateUser, isAdmin } = useAuth()
  const [profile, setProfile] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    image: "",
  })
  const [originalProfile, setOriginalProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [toast, setToast] = useState({ type: "info", message: "" })
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    passwordConfirm: "",
  })
  const [mostrarPasswordPerfil, setMostrarPasswordPerfil] = useState(false)
  const [mostrarPasswordPerfilConfirm, setMostrarPasswordPerfilConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    async function loadData() {
      try {
        const profileRes = await customers.getProfile()
        const profilePayload = profileRes?.data || {}
        const hasProfileData = Boolean(
          profilePayload.nombre ||
            profilePayload.email ||
            profilePayload.telefono ||
            profilePayload.direccion ||
            profilePayload.ciudad,
        )
        if (!hasProfileData) {
          setToast({
            type: "warning",
            message:
              "Parece que tu perfil aún no tiene todos los datos. Completa el formulario para terminarlo.",
          })
        }

        const loadedProfile = {
          nombre: profilePayload.name || user?.nombre || "",
          email: profilePayload.email || user?.email || "",
          telefono: profilePayload.phone || "",
          direccion: profilePayload.address || "",
          ciudad: profilePayload.city || "",
          codigoPostal: profilePayload.postalCode || "",
          image: profilePayload.image || "",
        }

        setProfile(loadedProfile)
        setOriginalProfile(loadedProfile)
        setIsLoading(false)
      } catch (error) {
        console.error("Error al cargar datos de perfil:", error)
        setIsLoading(false)
        setToast({
          type: "error",
          message: "No se pudieron cargar tus datos. Inténtalo de nuevo más tarde.",
        })
      }
    }
    loadData()
  }, [isAuthenticated, navigate, user?.nombre, user?.email])

  function handleProfileChange(e) {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setIsSaving(true)

    const normalizedPhone = normalizePhone(profile.telefono)
    if (!isValidPhone(profile.telefono)) {
      setIsSaving(false)
      setToast({
        type: "error",
        message: "Introduce un teléfono válido (solo números, espacios y opcionalmente + al inicio).",
      })
      return
    }

    const newPassword = passwordForm.password.trim()
    const newPasswordConfirm = passwordForm.passwordConfirm.trim()

    if (newPassword || newPasswordConfirm) {
      if (newPassword !== newPasswordConfirm) {
        setIsSaving(false)
        setToast({ type: "error", message: "Las contraseñas no coinciden." })
        return
      }
      if (newPassword.length < 6) {
        setIsSaving(false)
        setToast({
          type: "error",
          message: "La nueva contraseña debe tener al menos 6 caracteres.",
        })
        return
      }
    }

    try {
      let finalImageUrl = profile.image

      if (selectedImageFile) {
        try {
          const uploadRes = await customers.uploadProfileImage(selectedImageFile)
          finalImageUrl = uploadRes.data.url
        } catch (uploadError) {
          console.error("Error al subir imagen:", uploadError)
          setIsSaving(false)
          setToast({
            type: "error",
            message: "Error al subir la imagen. Inténtalo de nuevo.",
          })
          return
        }
      }

      const fieldsToSend = {
        ...profile,
        image: finalImageUrl,
        telefono: normalizedPhone 
      }
      
      if (newPassword) {
        fieldsToSend.password = newPassword
      }

      const response = await customers.updateProfile(fieldsToSend)
      const updatedProfile = response.data
      setProfile(updatedProfile)
      setOriginalProfile(updatedProfile)
      setSelectedImageFile(null)

      updateUser({
        nombre: updatedProfile.nombre,
        imagen: updatedProfile.imagen || updatedProfile.image,
        image: updatedProfile.image || updatedProfile.imagen,
        telefono: updatedProfile.telefono,
        direccion: updatedProfile.direccion,
        ciudad: updatedProfile.ciudad,
        codigoPostal: updatedProfile.codigoPostal,
        email: updatedProfile.email || user?.email,
      })
      setToast({ type: "success", message: "Perfil actualizado correctamente." })
      
      if (isAdmin) {
        setTimeout(() => navigate("/admin"), 1500)
      } else {
        setTimeout(() => navigate("/productos"), 1500)
      }

      setPasswordForm({
        password: "",
        passwordConfirm: "",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      const msg = error.response?.data?.mensaje || "No se pudo actualizar el perfil. Inténtalo de nuevo."
      setToast({ type: "error", message: msg })
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancelChanges() {
    if (originalProfile) {
      setProfile(originalProfile)
    }
    setPasswordForm({ password: "", passwordConfirm: "" })
  }

  function handleProfileImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        image: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) {
    return (
      <div className="container text-center profile-py-4">
        Cargando...
      </div>
    )
  }

  return (
    <div className="base-form-shell">
      <div className="base-form-card">
        <h1 className="base-form-title">Mi Perfil</h1>
        <Toast
          type={toast.type}
          message={toast.message}
          duration={6000}
          onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
        />
        <div className="profile-avatar-row">
          <div className="header-avatar header-avatar-lg">
            {profile.image ? (
              <img src={profile.image} alt={profile.nombre || user?.nombre || "Avatar de usuario"} />
            ) : (
              <span>
                {(profile.nombre || profile.email || user?.nombre || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-secondary">
            Actualiza tus datos personales y mantén tu perfil seguro.
          </p>
        </div>
        <form onSubmit={handleSaveProfile} className="base-form">
          <div className="base-form-group">
            <label className="base-form-label" htmlFor="nombre">
              Nombre completo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="base-form-input"
              value={profile.nombre || ""}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="base-form-input"
              value={profile.email || user?.email || ""}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              className="base-form-input"
              placeholder="+34 600 000 000"
              value={profile.telefono || ""}
              onChange={handleProfileChange}
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="direccion">
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              className="base-form-input"
              value={profile.direccion || ""}
              onChange={handleProfileChange}
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="ciudad">
              Ciudad
            </label>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              className="base-form-input"
              value={profile.ciudad || ""}
              onChange={handleProfileChange}
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="codigoPostal">
              Código postal
            </label>
            <input
              id="codigoPostal"
              name="codigoPostal"
              type="text"
              className="base-form-input"
              value={profile.codigoPostal || ""}
              onChange={handleProfileChange}
              placeholder="08001"
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="imagen">
              Imagen de perfil
            </label>
            <input
              id="imagen"
              name="imagen"
              type="file"
              className="base-form-input profile-mt-05"
              accept="image/*"
              onChange={handleProfileImageChange}
            />
          </div>

          <div className="base-form-group">
            <label className="base-form-label" htmlFor="password">
              Nueva contraseña
            </label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={mostrarPasswordPerfil ? "text" : "password"}
                className="base-form-input"
                value={passwordForm.password || ""}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Dejar en blanco para no cambiarla"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setMostrarPasswordPerfil((prev) => !prev)}
                aria-label={mostrarPasswordPerfil ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPasswordPerfil ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 9a3 3 0 0 0-3 3 1 1 0 1 0 2 0 1 1 0 0 1 1-1 1 1 0 1 0 0-2Z"
                    />
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
            <label className="base-form-label" htmlFor="passwordConfirm">
              Confirmar nueva contraseña
            </label>
            <div className="password-field">
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={mostrarPasswordPerfilConfirm ? "text" : "password"}
                className="base-form-input"
                value={passwordForm.passwordConfirm || ""}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    passwordConfirm: e.target.value,
                  }))
                }
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                disabled={!passwordForm.password}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setMostrarPasswordPerfilConfirm((prev) => !prev)}
                aria-label={mostrarPasswordPerfilConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={!passwordForm.password}
              >
                {mostrarPasswordPerfilConfirm ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 9a3 3 0 0 0-3 3 1 1 0 1 0 2 0 1 1 0 0 1 1-1 1 1 0 1 0 0-2Z"
                    />
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

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleCancelChanges} disabled={isSaving}>
              Cancelar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
