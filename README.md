# WorkSpaceBCN 

**WorkSpaceBCN** es una plataforma de comercio electrónico Full Stack diseñada para la venta de productos informáticos, de oficina y audiovisuales. Este proyecto demuestra una arquitectura robusta y escalable utilizando el stack MERN (MongoDB, Express, React, Node.js), cumpliendo con estándares profesionales de desarrollo y buenas prácticas.

---

## 🚀 Enlaces de Despliegue (Demo)

El proyecto se encuentra desplegado y operativo en los siguientes enlaces:

- **🌐 Aplicación Web (Frontend):** [https://workspacebcn-frontend.vercel.app](https://workspacebcn-frontend.vercel.app)
- **⚙️ API del Servidor (Backend):** [https://workspace-bcn-api.onrender.com](https://workspace-bcn-api.onrender.com)

**Credenciales de Acceso (Demo):**
- **Admin:** `admin@workspacebcn.com` / `admin123`
- **Cliente:** `maria.rodriguez@email.com` / `password123`

---

## Tabla de Contenidos

- [WorkSpaceBCN]
  - [Tabla de Contenidos]
  - [Características Principales]
  - [Tecnologías Utilizadas]
    - [Backend]
    - [Frontend]
  - [Arquitectura del Proyecto]
  - [Requisitos Previos]
  - [Instalación y Ejecución]
    - [1. Clonar el repositorio]
    - [2. Configuración del Backend]
    - [3. Configuración del Frontend]
  - [Estructura del Repositorio]
  - [Autor]

---

## Características Principales

- **Gestión de Usuarios:** Autenticación segura con JWT, roles de usuario (Cliente y Administrador).
- **Catálogo de Productos:** Visualización, filtrado y búsqueda de productos con imágenes alojadas en Cloudinary.
- **Carrito de Compras:** Gestión de estado global para el carrito, persistencia y flujo de checkout.
- **Panel de Administración:** Dashboard completo para gestionar productos, ventas, pagos, inventario y alertas.
- **Base de Datos Dinámica:** Sistema de "Seeding" avanzado que puebla la base de datos desde archivos CSV, incluyendo la gestión de imágenes.
- **Gestión de Imágenes:** Integración con Cloudinary para subida y optimización de imágenes.
- **Diseño Responsive:** Interfaz adaptada a dispositivos móviles y escritorio utilizando CSS puro y Variables CSS.

---

## Tecnologías Utilizadas

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB (con Mongoose ODM)
- **Autenticación:** JSON Web Tokens (JWT) y bcryptjs
- **Almacenamiento:** Cloudinary
- **Testing:** Jest y Supertest

### Frontend
- **Librería:** React 18
- **Estado Global:** Context API (`AuthContext`, `CartContext` implícito)
- **Enrutamiento:** React Router v6
- **Estilos:** CSS3 Puro con Variables (`:root`), Flexbox y Grid
- **Testing:** Jest y React Testing Library
- **HTTP Client:** Axios

---

## Arquitectura del Proyecto

El proyecto sigue una estructura de **monorepo** (aunque gestionado en carpetas separadas) dividiendo claramente las responsabilidades:

- **/backend:** Contiene toda la lógica del servidor, API RESTful, modelos de datos y scripts de utilidad.
- **/frontend:** Contiene la aplicación cliente (SPA) construida con React.

---

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:
- **Node.js** (v16 o superior)
- **npm** (v8 o superior)
- **MongoDB** (Instancia local o URI de MongoDB Atlas)
- Cuenta en **Cloudinary** (para gestión de imágenes)

---

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/Rejane2304/WorkSpace-BCN.git
cd WorkSpace-BCN
```

### 2. Configuración del Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:
```env
PORT=5001
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NODE_ENV=development
```

**Poblar la Base de Datos (Seed):**
```bash
npm run seed
```
*Esto leerá los archivos CSV en `backend/data` y cargará usuarios, productos, ventas, etc.*

**Iniciar Servidor:**
```bash
npm run dev
```

### 3. Configuración del Frontend
En una nueva terminal:
```bash
cd frontend
npm install
```
El frontend está configurado para conectar con `http://localhost:5001` por defecto (proxy en package.json o configuración de API).

**Iniciar Cliente:**
```bash
npm start
```

---

## Estructura del Repositorio

```
WorkSpace-BCN/
├── backend/                # Servidor Node.js/Express
│   ├── config/             # Configuraciones (DB, Cloudinary)
│   ├── data/               # Archivos CSV para el seed
│   ├── seeds/              # Script de poblado de DB
│   ├── src/
│   │   ├── controllers/    # (Lógica en rutas en este proyecto)
│   │   ├── middleware/     # Auth, validaciones
│   │   ├── models/         # Esquemas Mongoose
│   │   ├── routes/         # Definición de endpoints
│   │   └── utils/          # Utilidades
│   └── tests/              # Tests de integración y unitarios
│
├── frontend/               # Cliente React
│   ├── public/             # Assets estáticos
│   └── src/
│       ├── api/            # Configuración Axios
│       ├── components/     # Componentes reutilizables
│       ├── context/        # Contextos (Auth)
│       ├── hooks/          # Custom Hooks
│       ├── pages/          # Vistas principales
│       ├── styles/         # Archivos CSS modulares
│       └── tests/          # Tests de componentes
│
└── AGENTS.md               # Documentación para Agentes IA
```

---

## Autor

Desarrollado por **Rejane Rodrigues** como parte del proyecto final Full Stack.
