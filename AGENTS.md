# AGENTS.md - Instrucciones Completas del Proyecto WorkSpaceBCN

Este documento contiene todas las instrucciones, requisitos y especificaciones necesarias para desarrollar, mantener y extender el proyecto WorkSpaceBCN. Está diseñado para ser usado por desarrolladores, IAs asistentes y cualquier colaborador del proyecto.

---


## ÍNDICE

1. [Contexto del Proyecto]
2. [Requisitos Académicos Obligatorios]
3. [Arquitectura del Sistema]
4. [Especificaciones Técnicas]
5. [Reglas de Código]
6. [Estructura de Datos]
7. [Flujos de Trabajo]
8. [Diseño y Estilos]
9. [Instrucciones para IAs]
10. [Testing y Validación]
11. [Despliegue]

---

## CONTEXTO DEL PROYECTO

### Descripción General
WorkSpaceBCN es un e-commerce Full Stack desarrollado para la venta de productos informáticos, de oficina y audiovisuales en Barcelona. El proyecto debe cumplir con requisitos académicos específicos y estar construido con una arquitectura simple y comprensible para desarrolladores principiantes.

### Objetivos del Proyecto
1. Demostrar conocimientos completos de desarrollo Full Stack
2. Implementar buenas prácticas de arquitectura de software
3. Crear una aplicación funcional con UX/UI profesional
4. Generar una base de datos desde archivos CSV
5. Implementar autenticación con roles y permisos
6. Utilizar hooks avanzados de React
7. Mantener código limpio y fácil de entender

### Tecnología Core
- **Backend:** Node.js + Express + MongoDB
- **Frontend:** React 18 (JavaScript puro)
- **Estilos:** CSS puro con variables personalizadas
- **Autenticación:** JWT (JSON Web Tokens)
- **Base de Datos:** MongoDB con Mongoose ODM

---

## REQUISITOS ACADÉMICOS OBLIGATORIOS

### ✅ Requisitos Esenciales

1. **Variables CSS**
   - Definir variables de colores, espaciados, fuentes en `:root`
   - Usar variables en todo el proyecto para consistencia
   - Ejemplo: `--color-primary`, `--spacing-md`, `--font-main`

2. **Reutilización de CSS**
   - Estilos modulares y bien organizados
   - Evitar duplicación de código CSS
   - Usar clases reutilizables

3. **Mínimo 3 Colecciones Relacionadas**
   - Usuario (con roles: admin/cliente)
   - Productos (referenciados en ventas)
   - Ventas (contiene referencias a usuarios y productos)
   - **Importante:** Las colecciones deben estar relacionadas mediante IDs

4. **Buena Arquitectura React**
   - Componentización clara y lógica
   - Separación de responsabilidades
   - Reutilización de componentes
   - Uso de Context API para estado global

5. **Buena UX/UI**
   - Diseño moderno y profesional
   - Responsive design (mobile, tablet, desktop)
   - Feedback visual de acciones
   - Navegación intuitiva
   - Estados de carga y errores

6. **Base de Datos desde CSV**
   - Crear archivos CSV con datos (mínimo 100 registros)
   - Usar módulo `fs` de Node.js para leer CSV
   - Script de seed que puebla MongoDB automáticamente
   - Datos relacionados correctamente entre colecciones

7. **Hooks Avanzados de React**
   - `useState` - Gestión de estado local
   - `useEffect` - Efectos secundarios y ciclo de vida
   - `useContext` - Estado global (autenticación)
   - Custom hooks opcionales

8. **Autenticación con Roles**
   - Sistema de login/registro
   - Tokens JWT con expiración
   - Middleware de verificación de autenticación
   - Protección de rutas según rol (admin vs cliente)
   - Diferentes vistas según el rol del usuario

---

## ARQUITECTURA DEL SISTEMA

WorkSpaceBCN está basado en el stack MERN (MongoDB, Express, React, Node.js), con una separación clara entre backend y frontend para facilitar el desarrollo, mantenimiento y escalabilidad.

### Estructura de Carpetas (Resumen)

```
/backend
  /config
  /data
  /public
  /seeds
  /src
    /middleware
    /models
    /routes
    /utils
  /tests
  server.js
  socket.js

/frontend
  /public
  /src
    /api
    /assets
    /components
    /context
    /hooks
    /pages
    /styles
    /tests
    /utils
  index.js
```

### Modelos Principales (Backend)

| Modelo         | Descripción                                 | Relaciones clave                |
|----------------|---------------------------------------------|---------------------------------|
| User           | Usuarios (admin, cliente)                   | Ventas, Órdenes                 |
| Product        | Productos en catálogo                       | Ventas, Órdenes, Inventario     |
| Sale           | Ventas realizadas                           | Usuario, Productos, Pagos       |
| Order          | Órdenes de compra                           | Usuario, Productos, Pagos       |
| Payment        | Pagos asociados a ventas/órdenes            | Venta, Orden                    |
| InventoryMove  | Movimientos de inventario                   | Producto                        |
| ContactMessage | Mensajes de contacto del usuario            | Usuario (opcional)              |
| Alert          | Alertas administrativas                     | Usuario (opcional)              |

### Rutas y Endpoints Principales (Backend)

- `/api/auth` - Autenticación y registro de usuarios
- `/api/products` - Gestión y consulta de productos
- `/api/sales` - Gestión de ventas
- `/api/orders` - Gestión de órdenes de compra
- `/api/payments` - Procesamiento de pagos
- `/api/inventory` - Movimientos de inventario
- `/api/contact` - Mensajes de contacto
- `/api/admin` - Funcionalidades administrativas

### Frontend (React 18)

- Componentes reutilizables: ProductCard, Modal, Header, Footer, OrderCard, PaymentMethodSelect, Toast, etc.
- Context API para autenticación y sesión global.
- Hooks personalizados: useAsyncAction, useToastManager, etc.
- Páginas principales: Home, Productos, Detalle de Producto, Carrito, Checkout, Perfil, Historial de Órdenes, Panel de Administración.
- Estilos CSS modulares y variables globales.
- Testing: React Testing Library y Cypress (e2e).
- Panel de administración protegido por roles.

### Flujos y Características Clave

- Autenticación JWT y protección de rutas por rol.
- Carrito persistente en localStorage y sincronizado con backend.
- Checkout validado, creación de órdenes y pagos.
- Feedback visual, estados de carga y errores.
- Diseño responsive (mobile, tablet, desktop).

---

## ESPECIFICACIONES TÉCNICAS

### Backend

- **Lenguaje:** JavaScript (Node.js)
- **Framework:** Express.js
- **Base de datos:** MongoDB (con Mongoose ODM)
- **Autenticación:** JWT (JSON Web Tokens), middleware de protección de rutas y roles
- **Carga de archivos:** Cloudinary (para imágenes de productos y perfiles)
- **Lectura de datos:** Módulo `fs` para importar datos desde archivos CSV
- **Testing:** Jest y Supertest para pruebas unitarias e integración
- **Estructura modular:** Separación clara de modelos, rutas, middleware, utilidades y seeds
- **Seed automático:** Script para poblar la base de datos desde CSV, relacionando colecciones por IDs
- **Variables de entorno:** Uso de `.env` para credenciales y configuración sensible
- **Logs y utilidades:** Logger de desarrollo personalizado (`devlog.js`)
- **Websockets:** Integración opcional con `socket.js` para notificaciones en tiempo real

### Frontend

- **Lenguaje:** JavaScript (React 18)
- **Gestión de estado:** Context API para autenticación y sesión global
- **Hooks personalizados:** `useAsyncAction`, `useToastManager`, entre otros
- **Estilos:** CSS puro, modularizado, con variables globales en `:root` y media queries para responsive
- **Componentización:** Componentes reutilizables y desacoplados (ProductCard, Modal, Toast, etc.)
- **Rutas:** React Router para navegación entre páginas
- **Persistencia local:** Carrito sincronizado con localStorage y backend
- **Testing:** React Testing Library para unitarios y Cypress para e2e
- **Feedback visual:** Toasts, loaders, mensajes de error y éxito
- **Accesibilidad:** Navegación por teclado y etiquetas semánticas

### Integración y DevOps

- **Despliegue:** Backend en Render, frontend en Vercel/Netlify, base de datos en MongoDB Atlas
- **Variables de entorno:** Separación de configuración para desarrollo y producción
- **Documentación:** AGENTS.md como fuente única de especificaciones y buenas prácticas

---

## REGLAS DE CÓDIGO

1. **Convenciones de Nombres**
   - Usar `camelCase` para variables y funciones en JavaScript.
   - Usar `PascalCase` para componentes de React.
   - Usar `kebab-case` para archivos y carpetas.

2. **Indentación y Espaciado**
   - Usar 2 espacios para indentación en JavaScript y JSX.
   - No usar tabulaciones.

3. **Longitud de Línea**
   - Se recomienda máximo 80 caracteres por línea en JS/JSX y 120 en Markdown, pero no es obligatorio.

4. **Punto y Coma**
   - El uso de punto y coma al final de cada sentencia es opcional, según el estilo del archivo.

5. **Comillas**
   - Usar comillas simples `'` para strings en JavaScript.
   - Usar comillas dobles `"` para atributos en JSX.

6. **Espacios en Blanco**
   - Usar un espacio después de las comas `,` en listas y argumentos.
   - Usar un espacio antes y después de los operadores `=`, `+`, `-`, `*`, `/`.

7. **Exportaciones e Importaciones**
   - Agrupar todas las importaciones al inicio del archivo.
   - Se recomienda ordenar por tipo (npm, locales, estilos), pero no es obligatorio.

8. **Hooks de React**
   - Nombrar los hooks personalizados con prefijo `use`.
   - Llamar a los hooks en el nivel superior del componente, nunca dentro de condicionales o bucles.

9. **Manejo de Errores**
    - Usar `try/catch` para manejar errores en funciones asíncronas.
    - Retornar objetos con `success` y `error` para manejar el estado en el frontend.

---

## ESTRUCTURA DE DATOS

### Colecciones y Documentos (MongoDB)

1. **Usuarios (`users`)**
   - `_id`: ObjectId
   - `name`: String
   - `email`: String (único)
   - `password`: String (encriptado)
   - `role`: String (`admin` o `cliente`)
   - `phone`: String
   - `address`: String
   - `city`: String
   - `postalCode`: String
   - `image`: String (URL)
   - `createdAt`: Date

2. **Productos (`products`)**
   - `_id`: ObjectId
   - `category`: String (`Informática`, `Oficina`, `Audiovisual`)
   - `name`: String
   - `description`: String
   - `price`: Number
   - `stock`: Number
   - `minStock`: Number
   - `maxStock`: Number
   - `image`: String (URL)
   - `createdAt`: Date

3. **Ventas (`sales`)**
   - `_id`: ObjectId
   - `customer`: ObjectId (referencia a `users`)
   - `items`: [
       - `product`: ObjectId (referencia a `products`)
       - `quantity`: Number
       - `unitPrice`: Number
     ]
   - `total`: Number
   - `status`: String (`pending`, `processing`, `shipped`, `delivered`, `cancelled`, `paid`)
   - `shippingAddress`: { `street`, `city`, `postalCode` }
   - `shippingCost`: Number
   - `saleDate`: Date

4. **Órdenes (`orders`)**
   - `_id`: ObjectId
   - `sale`: ObjectId (referencia a `sales`)
   - `user`: ObjectId (referencia a `users`)
   - `items`: [
       - `product`: ObjectId (referencia a `products`)
       - `name`: String
       - `quantity`: Number
       - `unitPrice`: Number
     ]
   - `shippingAddress`: { `street`, `city`, `postalCode`, `country`, `phone` }
   - `paymentMethod`: String (`tarjeta`, `paypal`, `transferencia`)
   - `paymentDetails`: Mixed
   - `shippingCost`: Number
   - `total`: Number
   - `status`: String (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
   - `paidAt`: Date
   - `createdAt`/`updatedAt`: Date (timestamps)

5. **Pagos (`payments`)**
   - `_id`: ObjectId
   - `sale`: ObjectId (referencia a `sales`)
   - `order`: ObjectId (referencia a `orders`)
   - `paymentMethod`: String (`tarjeta`, `paypal`, `transferencia`, `efectivo`)
   - `status`: String (`pending`, `processing`, `completed`, `failed`, `refunded`)
   - `amount`: Number
   - `currency`: String
   - `transactionId`: String
   - `paymentDetails`: { `last4Digits`, `cardType`, `paypalEmail` }
   - `paymentDate`: Date
   - `errorMessage`: String

---

## FLUJOS DE TRABAJO

### Flujo de Registro y Autenticación

1. El usuario se registra con nombre, email y contraseña.
2. Se valida que el email no esté en uso y que la contraseña cumpla requisitos mínimos.
3. Se crea un nuevo usuario en la base de datos con rol de cliente por defecto.
4. El usuario puede iniciar sesión con su email y contraseña.
5. Se genera y envía un token JWT al cliente para autenticación en futuras solicitudes.

### Flujo de Compra

1. El usuario navega por los productos y los añade a su carrito.
2. El usuario accede al carrito y revisa los productos seleccionados.
3. El usuario procede al checkout, ingresando dirección de envío y método de pago.
4. Se valida la disponibilidad de los productos.
5. Se crea una nueva orden y una venta en la base de datos.
6. Se procesa el pago según el método seleccionado.
7. Se actualiza el estado de la orden y la venta.

### Flujo de Administración de Productos

1. El administrador accede al panel de administración y gestiona productos.
2. Puede ver, crear, editar o eliminar productos.
3. Al crear o editar, se validan los campos requeridos y se puede subir una imagen.
4. El producto se guarda en la base de datos y se muestra en el catálogo.

### Flujo de Gestión de Órdenes

1. El administrador accede al panel de administración y gestiona órdenes.
2. Puede ver el listado de órdenes, filtrar y buscar por diferentes criterios.
3. Al seleccionar una orden, puede ver el detalle y actualizar su estado.
4. El usuario recibe el cambio de estado al consultar su historial.

---

## DISEÑO Y ESTILOS

1. **Variables CSS**
   - Todos los colores, fuentes, tamaños y espaciados principales están definidos en `:root` (ver `base/variables.css`).
   - Se usan variables para colores, tipografía, espaciados, bordes y sombras.

2. **Organización Modular**
   - Los estilos están organizados en carpetas: `base`, `components`, `layout`, `pages`, `utilities`.
   - Cada componente y página tiene su propio archivo CSS.

3. **Colores**
   - Paleta principal basada en tonos naranja, turquesa y neutros.
   - Variables: `--color-primary`, `--color-success`, `--color-warning`, `--color-error`, etc.

4. **Tipografía**
   - Fuente principal: Inter, con fallback a system-ui y sans-serif.
   - Tamaños y pesos definidos por variables (`--font-size-*`, `--font-weight-*`).

5. **Espaciado y Bordes**
   - Espaciados definidos por variables (`--spacing-*`).
   - Bordes y border-radius también con variables.

6. **Botones**
   - Clases `.btn`, `.btn-primary`, `.btn-equal`, etc.
   - Bordes redondeados, colores y sombras según la variable.

7. **Inputs y Formularios**
   - Inputs con bordes redondeados y fondo claro.
   - Estados de error y éxito con colores variables.

8. **Responsive**
   - Media queries y breakpoints definidos en variables.
   - Diseño adaptativo para mobile, tablet y desktop.

9. **Utilidades**
   - Clases utilitarias para espaciado, color, display, flex, etc.

10. **Accesibilidad**
    - Contraste suficiente en botones y textos.
    - Navegación por teclado soportada en los principales componentes.

---

## INSTRUCCIONES PARA IAS

Este proyecto es académico e individual. Las siguientes pautas están adaptadas a este contexto:

### Generales

- Seguir siempre las especificaciones y requisitos definidos en este documento.
- Mantener una comunicación clara y constante con la desarrolladora responsable del proyecto.
- Consultar dudas sobre el alcance, requisitos o implementación antes de actuar.
- Proponer mejoras o alternativas solo si están justificadas y son viables.

### Tareas Específicas

1. **Creación de Componentes React**
   - Seguir la estructura y convenciones de nombres definidas.
   - Usar `PropTypes` para validar las props de los componentes si se utiliza PropTypes.
   - La documentación en línea es opcional, ya que el código actual no incluye comentarios.

2. **Consultas a la API**
   - Usar `axios` o `fetch` según lo especificado en las instrucciones.
   - Manejar siempre los errores de red o respuesta de la API.
   - Incluir mensajes de éxito o error para el usuario según corresponda.

3. **Estilos CSS**
   - Seguir las guías de estilo definidas en la sección de Diseño y Estilos.
   - Usar variables CSS para colores, fuentes y espaciados.
   - Asegurarse de que todos los estilos sean responsivos y accesibles.

4. **Testing**
   - Escribir pruebas unitarias para todos los componentes y funciones nuevas.
   - Usar React Testing Library para pruebas de integración y unitarias.
   - Asegurarse de que todas las pruebas pasen antes de marcar una tarea como completa.

5. **Documentación**
   - Actualizar este documento con cualquier cambio o adición significativa.
   - Documentar nuevas funciones, componentes o flujos de trabajo si es relevante.
   - Usar comentarios en el código solo si es estrictamente necesario (actualmente el código no incluye comentarios).

---

## TESTING Y VALIDACIÓN

### Estrategia de Testing

1. **Pruebas Unitarias**
   - Existen pruebas unitarias para módulos backend (Jest) y componentes frontend (React Testing Library).
2. **Pruebas de Integración**
   - Se cubren flujos críticos del backend con Supertest y Jest.
3. **Pruebas End-to-End (E2E)**
   - Se utilizan pruebas E2E con Cypress para simular la interacción del usuario en los flujos principales.
4. **Pruebas Manuales**
   - Se realizan pruebas manuales para verificar la usabilidad y el diseño en diferentes dispositivos.
5. **Cobertura**
   - No se exige cobertura mínima, pero se recomienda cubrir los flujos principales.

### Herramientas de Testing

- **Jest:** Pruebas unitarias e integración en backend.
- **Supertest:** Pruebas de endpoints backend.
- **React Testing Library:** Pruebas unitarias de componentes frontend.
- **Cypress:** Pruebas end-to-end (E2E) en frontend.

---

## DESPLIEGUE

### Estrategia Recomendada
Para este proyecto (MERN Stack), se recomienda una estrategia de despliegue desacoplada:

1. **Frontend:** Vercel o Netlify (Optimizado para React)
2. **Backend:** Render o Railway (Soporte nativo para Node.js)
3. **Base de Datos:** MongoDB Atlas (Ya configurado)

### Pasos para Despliegue

#### 1. Backend (Render.com)
1. Crear cuenta en Render y seleccionar "New Web Service".
2. Conectar repositorio de GitHub.
3. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Variables de Entorno (Environment Variables):
   - Copiar todas las variables del `.env` local (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_...`).
   - **Importante:** No incluir `PORT`, Render lo asigna automáticamente.

#### 2. Frontend (Vercel.com)
1. Crear cuenta en Vercel y seleccionar "Add New Project".
2. Importar repositorio de GitHub.
3. Configuración:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Variables de Entorno:
   - `REACT_APP_API_URL`: La URL que te dio Render para el backend (ej: `https://workspacebcn-api.onrender.com/api`).

#### 3. Verificación
- Asegurar que en MongoDB Atlas (Network Access) esté permitida la IP `0.0.0.0/0` (acceso desde cualquier lugar) para que Render pueda conectarse.

---

