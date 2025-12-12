import { useEffect } from "react"

function Toast({ type = "info", message, onClose, duration = 6000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
    </div>
  )
}

export default Toast
