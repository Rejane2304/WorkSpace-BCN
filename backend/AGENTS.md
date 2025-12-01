
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
