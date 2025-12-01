import { Link } from "react-router-dom"
import heroImage from "../assets/hero-home.jpg"

function Inicio() {
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-white-container">
          <div className="hero-content">
            <h1>
              ¡Bienvenido a{" "}
              <span className="home-ws-primary">WorkSpace</span>
              <span className="home-ws-turquoise">BCN</span>!
            </h1>
            <p className="home-fs-1-25 home-mt-1 home-color-text-light">
              Tu tienda de confianza para productos informáticos, de oficina y audiovisuales.
            </p>
            <p className="home-fs-1 home-mt-075 home-color-primary-strong">
              Horario de atención: Lunes - Sábado · 09:00 - 18:00
            </p>
          </div>

          <div className="hero-image-wrapper">
            <img src={heroImage} alt="Espacio de trabajo moderno" className="hero-image" />
          </div>

          <div className="hero-cta">
            <Link to="/productos" className="btn btn-primary home-btn-fs-1-1">
              Ver Productos
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="text-center">¿Por qué elegirnos?</h2>
        <div className="home-features-grid home-grid-mt-2">
          <div className="card home-feature-card">
            <div className="home-feature-content">
              <div className="home-feature-header">
                <div className="home-feature-icon home-feature-icon--quality">🎯</div>
                <h3 className="home-feature-title">Calidad Garantizada</h3>
              </div>
              <p className="home-feature-text">
                Trabajamos solo con marcas líderes y productos probados para que tu espacio de trabajo sea fiable,
                moderno y duradero.
              </p>
            </div>
          </div>

          <div className="card home-feature-card">
            <div className="home-feature-content">
              <div className="home-feature-header">
                <div className="home-feature-icon home-feature-icon--shipping">🚚</div>
                <h3 className="home-feature-title">Envío Rápido</h3>
              </div>
              <p className="home-feature-text">
                Entregas en 24-48 horas en Barcelona con empaquetado seguro para tus equipos.
              </p>
            </div>
          </div>

          <div className="card home-feature-card">
            <div className="home-feature-content">
              <div className="home-feature-header">
                <div className="home-feature-icon home-feature-icon--support">💬</div>
                <h3 className="home-feature-title">Soporte Técnico</h3>
              </div>
              <p className="home-feature-text">
                Asesoramiento experto antes y después de la compra para montar, optimizar y mantener tu espacio de trabajo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="home-cta home-cta-mt-4 home-cta-center home-cta-padding-3 home-cta-bg home-cta-radius"
      >
        <h2>¿Listo para empezar?</h2>
        <p className="home-mt-1">Crea tu cuenta y disfruta de nuestras ofertas exclusivas.</p>
        <Link to="/registro" className="btn btn-primary home-cta-link-mt-1-5">
          Registrarse Ahora
        </Link>
      </section>
    </div>
  )
}

export default Inicio 



