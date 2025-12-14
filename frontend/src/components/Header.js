"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  
  const currentAvatarUrl = user?.image || user?.imagen || ""

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

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase()
    if (user?.nombre) return user.nombre.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return "U"
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

              {!isAuthenticated && (
                <>
                  <Link to="/login" className="nav-link show-on-mobile" onClick={closeMenu}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className="nav-link show-on-mobile" onClick={closeMenu}>
                    Registrarse
                  </Link>
                </>
              )}

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

              {isAuthenticated && (
                <div className="nav-dropdown header-user">
                  <button
                    ref={triggerRef}
                    type="button"
                    className={`nav-link nav-dropdown-toggle ${isAdmin ? "is-admin" : ""}`}
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  >
                    <div className="header-avatar">
                      {currentAvatarUrl ? (
                        <img
                          src={currentAvatarUrl}
                          alt={user?.nombre ? `Avatar de ${user.nombre}` : "Avatar de usuario"}
                        />
                      ) : (
                        <span>{getUserInitial()}</span>
                      )}
                    </div>
                    <span>{isAdmin ? "Admin" : `Hola ${user?.name?.split(" ")[0] || user?.nombre?.split(" ")[0] || "Cliente"}`}</span>
                    <span className="header-avatar-arrow">▾</span>
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <Link to="/registro" className="btn btn-primary header-register hide-on-mobile" onClick={closeMenu}>
                  Registrarse
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

      {isAuthenticated && isUserDropdownOpen && (
        <div className="nav-dropdown-menu" ref={dropdownRef}>
          <button
            type="button"
            className="nav-dropdown-close"
            aria-label="Cerrar menú"
            onClick={() => setIsUserDropdownOpen(false)}
          >
            ✕
          </button>
          {isAdmin && (
            <>
              <Link to="/admin" className="nav-dropdown-item" onClick={closeMenu}>
                Panel Admin
              </Link>
              <Link to="/admin/productos" className="nav-dropdown-item" onClick={closeMenu}>
                Gestión Productos
              </Link>
              <Link to="/admin/clientes" className="nav-dropdown-item" onClick={closeMenu}>
                Gestión Clientes
              </Link>
              <Link to="/admin/ventas" className="nav-dropdown-item" onClick={closeMenu}>
                Gestión Ventas
              </Link>
              <Link to="/admin/pagos" className="nav-dropdown-item" onClick={closeMenu}>
                Gestión Pagos
              </Link>
              <Link to="/admin/inventario" className="nav-dropdown-item" onClick={closeMenu}>
                Gestión Inventario
              </Link>
              <hr className="nav-dropdown-separator" />
            </>
          )}
          <Link to="/perfil" className="nav-dropdown-item" onClick={closeMenu}>
            Mi Perfil
          </Link>
          {!isAdmin && (
            <>
              <Link to="/orders" className="nav-dropdown-item" onClick={closeMenu}>
                Mis Pedidos
              </Link>
              <Link to="/carrito" className="nav-dropdown-item" onClick={closeMenu}>
                Carrito
              </Link>
            </>
          )}
          <button
            type="button"
            className="nav-dropdown-item nav-dropdown-logout"
            onClick={() => {
              logout()
              closeMenu()
              navigate("/")
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  )
}

export default Header 


