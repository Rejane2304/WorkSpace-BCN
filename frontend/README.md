# WorkSpaceBCN - Frontend Client 

Este directorio contiene la aplicación cliente de **WorkSpaceBCN**, una Single Page Application (SPA) desarrollada con React 18. Ofrece una experiencia de usuario fluida para la navegación de productos, gestión del carrito y administración del sistema.

---

## Características del Frontend

- **React 18:** Uso de Hooks modernos (`useState`, `useEffect`, `useContext`, `useCallback`).
- **Gestión de Estado:**
    - **AuthContext:** Manejo global de la sesión del usuario y roles.
    - **Carrito:** Lógica de carrito de compras persistente (localStorage).
- **Estilos:**
    - CSS puro modularizado.
    - Uso extensivo de **Variables CSS** (`:root`) para consistencia de diseño (colores, espaciados, tipografía).
    - Diseño totalmente **Responsive** (Mobile-first).
- **Componentes Reutilizables:** Arquitectura basada en componentes (`ProductCard`, `Modal`, `Header`, etc.).
- **Panel de Administración:** Vistas protegidas para administradores con tablas, filtros y formularios de edición.
- **Testing:** Tests unitarios y de integración con Mocks para asegurar la estabilidad sin depender del backend.

---

## Scripts Disponibles

| Comando           | Descripción                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| `npm start`       | Inicia la aplicación en modo desarrollo (http://localhost:3000).            |
| `npm test`        | Ejecuta la suite de pruebas unitarias e integración (React Testing Library). |
| `npm run build`   | Compila la aplicación para producción en la carpeta `build`.                 |
| `npx cypress run --config-file cypress.config.js` | Ejecuta las pruebas E2E con Cypress.        |

---

## Testing

- **Unitarios e integración:**
  - Ejecuta `npm test` para correr los tests con Jest y React Testing Library.
  - Los archivos de prueba están en `src/tests/` y siguen el formato `.test.jsx`.
- **End-to-End (E2E):**
  - Ejecuta `npx cypress run --config-file cypress.config.js` para pruebas E2E automatizadas.
  - Los tests E2E están en `cypress/e2e/` y cubren los flujos principales del usuario y admin.

---

## Estructura de Carpetas

- **`public/`**: `index.html`, `manifest.json` y assets estáticos.
- **`src/`**:
    - **`api/`**: Configuración de Axios e interceptores para llamadas al backend.
    - **`assets/`**: Imágenes y recursos estáticos del frontend.
    - **`components/`**: Componentes reutilizables (`ProductCard`, `Modal`, `Header`, `Footer`, `OrderCard`, `PaymentMethodSelect`, `Toast`, etc.).
    - **`context/`**: `AuthContext.js` (Proveedor de autenticación).
    - **`hooks/`**: Custom hooks (`useAsyncAction`, `useToastManager`).
    - **`pages/`**: Vistas principales (Home, Login, CartPage, CheckoutPage, OrdersHistory, OrderDetail, Perfil, Contact, y admin).
    - **`styles/`**: Archivos CSS organizados por responsabilidad (main.css, base, layout, components, pages, utilities).
    - **`tests/`**: Archivos de prueba unitarios e integración (`.test.jsx`).
    - **`utils/`**: Funciones de utilidad (formateo de moneda, fechas, helpers).

---

## Autenticación y Roles

El frontend maneja dos niveles de acceso:
1. **Cliente:** Puede ver productos, añadir al carrito, comprar y ver su historial.
2. **Administrador:** Acceso al menú "Admin" para gestionar productos, ventas, pagos y usuarios.

La protección de rutas se realiza mediante componentes wrapper que verifican el estado en `AuthContext`.
