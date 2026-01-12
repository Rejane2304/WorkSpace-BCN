"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Header() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  const refreshCartCount = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("carrito") || "[]")
      const totalUnits = savedCart.reduce((sum, item) => {
        if (typeof item.quantity === 'number' && !isNaN(item.quantity)) {
          return sum + item.quantity
        } else if (typeof item.cantidad === 'number' && !isNaN(item.cantidad)) {
          return sum + item.cantidad
        } else {
          return sum + 1
        }
      }, 0)
      setCartCount(totalUnits)
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    refreshCartCount()
    const handleCartUpdated = () => refreshCartCount()
    window.addEventListener("cart-updated", handleCartUpdated)
    window.addEventListener("storage", handleCartUpdated)
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated)
      window.removeEventListener("storage", handleCartUpdated)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isUserDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserDropdownOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsUserDropdownOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
    setIsUserDropdownOpen(false)
  }



  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to={isAdmin ? "/admin" : "/"} className="logo" onClick={closeMenu}>
            <span className="logo-workspace">WorkSpace</span>
            <span className="logo-bcn">BCN</span>
          </Link>
          <div className="header-right">
            <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
              {!isAdmin && (
                <Link to="/" className="nav-link" onClick={closeMenu}>
                  Inicio
                </Link>
              )}
              {!isAdmin && (
                <Link to="/productos" className="nav-link" onClick={closeMenu}>
                  Productos
                </Link>
              )}
              {!isAdmin && (
                <Link to="/contacto" className="nav-link" onClick={closeMenu}>
                  Contacto
                </Link>
              )}
              {/* Eliminados los enlaces de login y registro para móvil del nav, solo aparecen en el menú hamburguesa */}
            </nav>
            <div className="header-actions">
              {!isAdmin && (
                <Link to="/carrito" className="nav-link header-cart-link" onClick={closeMenu}>
                  <span className="header-cart-icon" aria-label="Carrito">
                    🛒
                  </span>
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="nav-link hide-on-mobile" onClick={closeMenu}>
                  Iniciar Sesión
                </Link>
              )}
            </div>
            {!isAdmin && (
              <button className="menu-toggle" onClick={toggleMenu} aria-label="Alternar menú">
                {"☰"}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Menú hamburguesa fuera del header-right para evitar errores de cierre */}
      {isMenuOpen && (
        <div className="nav-dropdown-menu" ref={dropdownRef}>
          <button
            type="button"
            className="nav-dropdown-close"
            aria-label="Cerrar menú"
            onClick={closeMenu}
            style={{ position: 'absolute', top: 4, right: 8, fontSize: '1rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer', zIndex: 10 }}
          >
            &#10005;
          </button>
          <Link to="/" className="nav-dropdown-item" onClick={closeMenu}>
            Inicio
          </Link>
          <Link to="/productos" className="nav-dropdown-item" onClick={closeMenu}>
            Productos
          </Link>
          <Link to="/contacto" className="nav-dropdown-item" onClick={closeMenu}>
            Contacto
          </Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-dropdown-item" onClick={closeMenu}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="nav-dropdown-item" onClick={closeMenu}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header 