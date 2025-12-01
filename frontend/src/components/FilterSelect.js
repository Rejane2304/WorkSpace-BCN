"use client"

import { useState, useEffect, useRef } from "react"

function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  inline = false,
  dataTestId,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find((opt) => opt.value === value) || { label: placeholder }

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function handleSelect(optionValue) {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="select-custom" ref={containerRef} data-testid={dataTestId ? `${dataTestId}-container` : undefined}>
      <button
        type="button"
        className={`select-custom-control ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid={dataTestId ? `${dataTestId}-toggle` : undefined}
      >
        <span>{selectedOption.label}</span>
        <span className="select-custom-arrow">▾</span>
      </button>

      {isOpen && (
        <div className={`select-custom-menu ${inline ? "select-custom-menu-inline" : ""}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select-custom-option ${option.value === value ? "active" : ""}`}
              onClick={() => handleSelect(option.value)}
              data-testid={
                dataTestId ? `${dataTestId}-option-${option.value}` : undefined
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterSelect
