# Enterprise Ops Web

Frontend SPA del sistema Enterprise Operations Platform. Interfaz web
para gestión de proyectos, tareas y usuarios con autenticación JWT y
control de acceso basado en roles.

**En producción:** https://enterprise-ops-web.vercel.app

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- React Router 7
- TanStack Query (data fetching + cache)
- React Hook Form + Zod (formularios)
- Axios (HTTP client con interceptores JWT)
- Lucide React (iconos)
- Recharts (gráficos)

## Funcionalidades

- **Autenticación JWT** con refresh automático en expiración
- **RBAC en cliente** (rutas protegidas por rol)
- **Dashboard** con métricas por rol
- **Projects** CRUD completo
- **Tasks** CRUD + cambio de estado inline + asignación
- **Users** CRUD + cambio de rol (solo ADMIN)
- **Profile** ver/editar datos propios
- **Audit Logs** (pendiente integración backend)

## Backend

Este frontend consume la API de [enterprise-ops-platform](https://github.com/fabianmm83/enterprise-ops-platform):

- API: https://enterprise-ops-api-931400252050.us-central1.run.app
- Swagger: https://enterprise-ops-api-931400252050.us-central1.run.app/swagger-ui.html

## Instalación local

```bash
git clone https://github.com/fabianmm83/enterprise-ops-web.git
cd enterprise-ops-web
npm install
Crea un archivo .env.local en la raíz del proyecto con:

env
VITE_API_URL=https://enterprise-ops-api-931400252050.us-central1.run.app
VITE_API_VERSION=v1
Luego arranca el servidor de desarrollo:

bash
npm run dev
Abre http://localhost:5174 en el navegador.

Scripts disponibles
Comando	Descripción
npm run dev	Servidor de desarrollo con HMR
npm run build	Build de producción (output en dist/)
npm run preview	Preview del build de producción
npm run typecheck	Verificar tipos con TypeScript
npm run lint	Ejecutar ESLint
npm run format	Formatear código con Prettier
Usuarios de prueba
Email	Password	Rol
test@example.com	Password123!	ADMIN
Los usuarios nuevos se crean con rol USER por defecto. Un ADMIN puede cambiar el rol desde el panel de usuarios.

Estructura del proyecto
text
src/
├── components/
│   ├── ui/              # Componentes reutilizables (Button, Input, Modal, Table...)
│   ├── layout/          # Layout principal (Sidebar, Header)
│   └── forms/           # Formularios con validación (ProjectForm, TaskForm...)
├── hooks/               # Hooks personalizados (useAuth, useProjects, useTasks...)
├── lib/
│   ├── api.ts           # Cliente Axios con interceptores JWT
│   ├── auth.ts          # Manejo de tokens y sesión
│   ├── queryClient.ts   # Configuración de TanStack Query
│   └── utils.ts         # Utilidades (cn, etc.)
├── pages/               # Páginas (Dashboard, Projects, Tasks, Users...)
├── routes/              # Router + ProtectedRoute
├── types/               # Tipos TypeScript (Project, Task, User...)
└── styles/
    └── globals.css      # Estilos globales + Tailwind
Autenticación
El flujo de autenticación usa JWT con dos tokens:

Access token (15 min) → se incluye en cada request

Refresh token (7 días) → se usa para renovar el access token automáticamente

Si un request falla con 401, el interceptor de Axios intenta refrescar el token. Si el refresh falla, el usuario se cierra sesión y se redirige a /login.

RBAC (Control de acceso basado en roles)
Rol	Acceso
USER	Dashboard, Projects (solo lectura), Tasks, Profile
MANAGER	+ crear/editar/eliminar Projects y Tasks
ADMIN	+ Users, Audit Logs, cambio de roles
Las rutas protegidas usan el componente ProtectedRoute con la prop allowedRoles.

Deploy
Deploy automático en cada push a main vía Vercel.

Preview deployments para cada PR

Producción: https://enterprise-ops-web.vercel.app

Licencia
MIT

Autor
Fabian Moreno Monroy — Full Stack Engineer

Portafolio: https://fabianmmcv.web.app

LinkedIn: https://linkedin.com/in/fabián-moreno-monroy83

GitHub: https://github.com/fabianmm83

Email: fabianmm83@hotmail.com