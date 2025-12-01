"use client"

import { useCallback, useState } from "react"
import { flushSync } from "react-dom"

const defaultToast = { type: "info", message: "" }

export function useToastManager(initialToast = defaultToast) {
  const [toast, setToast] = useState(initialToast)

  const updateToast = useCallback(
    (value) => {
      flushSync(() => {
        setToast((previous) =>
          typeof value === "function" ? value(previous) : { ...previous, ...value },
        )
      })
    },
    [],
  )

  const clearToast = useCallback(() => {
    updateToast((previous) => ({ ...previous, message: "" }))
  }, [updateToast])

  return { toast, updateToast, clearToast }
}
