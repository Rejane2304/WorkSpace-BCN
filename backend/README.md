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

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción. |
| `npm run dev` | Inicia el servidor en modo desarrollo con `nodemon` (recarga automática). |
| `npm run seed` | Ejecuta el script de poblado de base de datos. **¡Atención! Borra los datos existentes.** |
| `npm test` | Ejecuta la suite de pruebas automatizadas. |

---

## Variables de Entorno (.env)

Crea un archivo `.env` en la raíz de `/backend` con las siguientes claves:

```env
# Servidor
PORT=5001
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/workspacebcn

# Seguridad
JWT_SECRET=tu_clave_secreta_super_segura

# Cloudinary (Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## Estructura de Carpetas

- **`config/`**: Configuración de base de datos y servicios externos (Cloudinary).
- **`data/`**: Archivos `.csv` fuente para el seed (users.csv, products.csv, etc.).
- **`public/assets/`**: Imágenes locales usadas como fallback o carga inicial.
- **`seeds/`**: Lógica del script de importación de datos (`seed.js`).
- **`src/`**:
    - **`middleware/`**: `auth.js` (verificación de token y roles).
    - **`models/`**: Definición de esquemas Mongoose (`User`, `Product`, `Order`, etc.).
    - **`routes/`**: Controladores y definición de rutas de la API.
    - **`utils/`**: Funciones auxiliares (logs, traducciones).
- **`tests/`**: Pruebas automatizadas de los flujos de negocio.

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

El proyecto incluye tests de integración que verifican el flujo completo de negocio (Login -> Compra -> Stock).

Para ejecutar los tests:
```bash
npm test
```
