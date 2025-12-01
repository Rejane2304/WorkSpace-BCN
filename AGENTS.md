# AGENTS.MD - Instrucciones Completas del Proyecto WorkSpaceBCN

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
12. [Soporte y Recursos]

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

