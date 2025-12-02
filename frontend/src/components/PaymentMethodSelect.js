"use client"

import { useState, useRef, useEffect } from "react"

const PAYMENT_OPTIONS = [
  { value: "tarjeta", label: "Tarjeta" },
  { value: "paypal", label: "PayPal" },
]

function PaymentMethodSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = PAYMENT_OPTIONS.find((option) => option.value === value) || PAYMENT_OPTIONS[0]

  const handleSelect = (newValue) => {
    onChange(newValue)
    setIsOpen(false)
  }

  return (
    <div className="select-custom" ref={containerRef}>
      <button
        type="button"
        className={`select-custom-control ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption.label}</span>
        <span className="select-custom-arrow">▾</span>
      </button>

      {isOpen && (
        <div className="select-custom-menu">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select-custom-option ${option.value === value ? "active" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentMethodSelect
