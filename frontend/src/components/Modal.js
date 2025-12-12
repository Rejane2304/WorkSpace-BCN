import { useEffect } from "react"

function Modal({
  isOpen,
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel = null,
  onConfirm,
  onCancel,
  onClose,
  children,
  confirmDisabled = false,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="icon-button modal-close-button"
          aria-label="Cerrar modal"
          onClick={onClose || onCancel}
        >
          ×
        </button>
        {title && <h3 className="modal-title">{title}</h3>}
        {message && <div className="modal-body"><p className="modal-message">{message}</p></div>}
        {children}
        <div className="modal-actions">
          {cancelLabel && (
            <button type="button" className="btn btn-outline" onClick={onCancel || onClose}>
              {cancelLabel}
            </button>
          )}
          {confirmLabel && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
