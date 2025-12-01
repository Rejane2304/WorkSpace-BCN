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

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia la aplicación en modo desarrollo (http://localhost:3000). |
| `npm test` | Ejecuta la suite de pruebas (Jest + React Testing Library). |
| `npm run build` | Compila la aplicación para producción en la carpeta `build`. |

---

## Estructura de Carpetas

- **`public/`**: `index.html`, `manifest.json` y assets estáticos.
- **`src/`**:
    - **`api/`**: Configuración de Axios e interceptores para llamadas al backend.
    - **`assets/`**: Imágenes y recursos estáticos del frontend.
    - **`components/`**:
        - **`common/`**: Componentes genéricos (Botones, Inputs).
        - **`orders/`**: Componentes específicos de órdenes.
        - Componentes globales (`Header`, `Footer`, `ProductCard`).
    - **`context/`**: `AuthContext.js` (Proveedor de autenticación).
    - **`hooks/`**: Custom hooks (`useAsyncAction`, `useToastManager`).
    - **`pages/`**: Vistas principales (Rutas).
        - **`admin/`**: Vistas del panel de administración (`SalesAdmin`, `ProductsAdmin`).
        - `Home.js`, `Login.js`, `CartPage.js`, etc.
    - **`styles/`**: Archivos CSS organizados por responsabilidad (base, layout, components, pages).
    - **`tests/`**: Archivos de prueba (`.test.jsx`).
    - **`utils/`**: Funciones de utilidad (formateo de moneda, fechas).

---

## Autenticación y Roles

El frontend maneja dos niveles de acceso:
1. **Cliente:** Puede ver productos, añadir al carrito, comprar y ver su historial.
2. **Administrador:** Acceso al menú "Admin" para gestionar productos, ventas, pagos y usuarios.

La protección de rutas se realiza mediante componentes wrapper que verifican el estado en `AuthContext`.

---

## Testing

Los tests del frontend están diseñados para ser **independientes**. Utilizan `jest.mock` para simular las respuestas de la API, permitiendo probar la interfaz y la lógica de negocio sin necesidad de tener el backend ejecutándose.

Para correr los tests:
```bash
npm test
```
