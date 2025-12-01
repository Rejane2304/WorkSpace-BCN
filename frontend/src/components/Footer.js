
function Footer() {
  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Contacto", href: "/contacto" },
  ]

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>WorkSpaceBCN</h3>
          <p>Tu tienda de confianza para productos informáticos, de oficina y audiovisuales.</p>
          <p className="footer-schedule">
            Horario de atención: Viernes a sábado
            <span>09:00 - 18:00</span>
          </p>
        </div>

        <div className="footer-links">
          <h4>Navegación rápida</h4>
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contacto</h4>
          <p>Tel: <a href="tel:+34934567890">+34 934 567 890</a></p>
          <p>Email: <a href="mailto:info@workspacebcn.com">info@workspacebcn.com</a></p>
          <p className="footer-address">
            Dirección: Calle Example 123, Barcelona, España, 08001
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} WorkSpaceBCN. Hecho con pasión en Barcelona.</p>
      </div>
    </footer>
  )
}

export default Footer 


