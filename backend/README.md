# WorkSpaceBCN - Backend API 

Este directorio contiene el servidor y la API RESTful de **WorkSpaceBCN**. Construido con Node.js y Express, gestiona toda la lógica de negocio, conexión a base de datos y seguridad.

---

## Características Técnicas

- **API RESTful:** Endpoints estructurados para recursos (Productos, Usuarios, Ventas, etc.).
- **MongoDB & Mongoose:** Modelado de datos con esquemas estrictos y validaciones.
- **Autenticación JWT:** Middleware de protección de rutas y verificación de roles.
- **Seeding Automatizado:** Script robusto (`npm run seed`) que:
    - Limpia la base de datos.
    - Lee datos desde archivos CSV (`/data`).
    - Sube/Gestiona imágenes en Cloudinary automáticamente.
    - Crea relaciones complejas entre colecciones (Ventas -> Usuarios -> Productos).
- **Gestión de Errores:** Respuestas JSON estandarizadas para errores.
- **Testing:** Suite de pruebas de integración con `Jest` y `Supertest`.

---

## Scripts Disponibles

| Comando           | Descripción                                                        |
|-------------------|--------------------------------------------------------------------|
| `npm start`       | Inicia el servidor en modo producción (`node server.js`).           |
| `npm run dev`     | Inicia el servidor en modo desarrollo con `nodemon`.               |
| `npm run seed`    | Ejecuta el script de poblado de base de datos (`node seeds/seed.js`). **¡Atención! Borra los datos existentes.** |
| `npm test`        | Ejecuta la suite de pruebas unitarias e integración (Jest + Supertest). |

---

## Testing

- **Unitarios e integración:**
  - Ejecuta `npm test` para correr los tests con Jest y Supertest.
  - Los archivos de prueba están en `tests/` y cubren endpoints, lógica de negocio y utilidades.
- **End-to-End (E2E):**
  - Los flujos principales pueden ser probados desde el frontend con Cypress, pero el backend está cubierto por integración y unitarios.

---

## Estructura de Carpetas

- **`config/`**: Configuración de base de datos y servicios externos (Cloudinary).
- **`data/`**: Archivos `.csv` fuente para el seed (users.csv, products.csv, etc.).
- **`public/assets/`**: Imágenes locales usadas como fallback o carga inicial.
- **`seeds/`**: Script de poblado de base de datos (`seed.js`).
- **`src/`**:
    - **`middleware/`**: Middlewares de autenticación y validación.
    - **`models/`**: Esquemas Mongoose para cada colección.
    - **`routes/`**: Endpoints de la API REST.
    - **`utils/`**: Funciones de utilidad y helpers.
- **`tests/`**: Pruebas unitarias e integración (`.test.js`).
- **`server.js`**: Punto de entrada del servidor.
- **`socket.js`**: Configuración de WebSockets.

---

## Endpoints Principales

### Auth
- `POST /api/auth/login`: Iniciar sesión.
- `POST /api/auth/register`: Registrar nuevo usuario.

### Productos
- `GET /api/products`: Listar productos (con filtros).
- `GET /api/products/:id`: Detalle de producto.
- `POST /api/products`: Crear producto (Admin).
- `PUT /api/products/:id`: Actualizar producto (Admin).
- `DELETE /api/products/:id`: Eliminar producto (Admin).

### Ventas y Órdenes
- `POST /api/orders`: Crear nueva orden de compra.
- `GET /api/orders/me`: Historial de órdenes del usuario.
- `GET /api/sales`: Listar todas las ventas (Admin).

### Admin
- `GET /api/inventory`: Gestión de inventario.
- `GET /api/admin-alerts`: Alertas del sistema.

---

## Testing

El proyecto incluye pruebas unitarias y de integración que cubren los principales endpoints y lógica de negocio (autenticación, ventas, pagos, utilidades, etc.). 

Para ejecutar los tests:
```bash
npm test
```
