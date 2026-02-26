# Apicanta Report System - Frontend

Panel de administración y formulario público para el sistema de seguimiento semanal de estudiantes. Construido con Next.js 16, Tailwind CSS y shadcn/ui.

## Qué problema resuelve

Este frontend le da interfaz visual a dos actores del sistema:

1. **El administrador** necesita ver de un vistazo quién completó el formulario semanal, quién no, cuántas semanas consecutivas lleva sin responder cada estudiante, y poder gestionar el ciclo de generación/envío de formularios durante desarrollo.

2. **El estudiante** recibe un magic link por email y necesita completar un formulario simple sin crear cuenta ni autenticarse. La experiencia debe ser directa: abrir el link, completar, enviar.

## Cómo lo resuelve

### Panel de Administración (`/admin`)

- **Login con Basic Auth**: Credenciales almacenadas en `sessionStorage`. Sin persistencia entre sesiones por diseño.
- **Dashboard con tabla de estado**: Muestra todos los estudiantes con su estado semanal (completado, pendiente, expirado, no enviado), semanas consecutivas sin completar, fecha de completado, y estado activo/inactivo.
- **Búsqueda y filtros rápidos**: Filtrar por nombre/email/ID externo. Quick filters para ver todos, activos, inactivos, completados o pendientes.
- **Infinite scrolling**: Carga progresiva de 50 registros por vez dentro de la tabla, sin paginar toda la app.
- **Cache con SWR**: Los datos se cachean y se revalidan automáticamente cada 5 minutos, con deduplicación de requests de 30 segundos.

### Formulario Público (`/forms/:token`)

- **Acceso por magic link**: El token en la URL identifica un formulario individual. No requiere login.
- **Formulario dinámico**: Se renderiza desde el JSON Schema del template del backend. Soporta campos `text`, `number` y `select`.
- **Estados claros**: Muestra feedback visual para formulario completado, expirado, ya respondido o con error.
- **Ruta demo**: `/forms/demo` renderiza un formulario de ejemplo para testear la UI sin necesitar un token válido.

### Entorno de Desarrollo

- **Dev Toolbar**: Barra visible solo en `NEXT_PUBLIC_ENV=development` con acciones de testing:
  - **Reset**: Elimina todas las form instances
  - **Generar Forms**: Genera formularios de la semana para todos los estudiantes activos
  - **Enviar Emails**: Encola el envío de emails
  - **Mock 1000**: Alterna entre datos reales y 1000 estudiantes mock generados en memoria
- **Alerta de producción**: Si el entorno es development pero la API apunta a una URL que no es localhost, la toolbar se pone roja con advertencia "Apuntando a base de datos de producción".
- **Magic links visibles**: En desarrollo, la tabla muestra una columna extra con los magic links para testear el flujo sin revisar emails.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                             │
│                                                                     │
│  /admin/login ──────> Login (Basic Auth)                            │
│       │                                                             │
│       ▼                                                             │
│  /admin/dashboard ──> Tabla de estado semanal                       │
│       │                  ├── Búsqueda por nombre/email/ID           │
│       │                  ├── Filtros rápidos (estado)               │
│       │                  ├── Infinite scrolling                     │
│       │                  ├── Ordenamiento por columnas              │
│       │                  └── Dev Toolbar (solo development)         │
│       │                                                             │
│  /forms/:token ─────> Formulario público (magic link)               │
│       │                  ├── Renderizado dinámico (JSON Schema)     │
│       │                  ├── Validación de campos requeridos        │
│       │                  └── Estados: enviado/completado/expirado   │
│       │                                                             │
│  /forms/demo ───────> Formulario demo (siempre disponible)          │
│                                                                     │
│  /api/proxy/* ──────> Rewrite al backend (evita CORS)               │
└─────────────────────────────────────────────────────────────────────┘
```

## Estructura del proyecto

```
src/
├── app/                             # Rutas (Next.js App Router)
│   ├── layout.tsx                   # Layout raíz (fonts, toasts, metadata)
│   ├── page.tsx                     # Redirect a /admin/dashboard
│   ├── globals.css                  # Tailwind + variables de tema
│   ├── admin/
│   │   ├── layout.tsx               # Auth guard + sidebar
│   │   ├── login/
│   │   │   └── page.tsx             # Login con Basic Auth
│   │   └── dashboard/
│   │       └── page.tsx             # Tabla de estado semanal
│   └── forms/
│       └── [token]/
│           └── page.tsx             # Formulario público por magic link
├── components/
│   ├── admin/
│   │   ├── dashboard-table.tsx      # Tabla con TanStack Table + infinite scroll
│   │   ├── dev-toolbar.tsx          # Barra de desarrollo (solo dev)
│   │   └── sidebar.tsx              # Navegación lateral responsive
│   ├── forms/
│   │   └── dynamic-form.tsx         # Renderizador de formularios desde JSON Schema
│   └── ui/                          # Componentes shadcn/ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── hooks/
│   └── use-students-status.ts       # SWR hook con cache, mock toggle y refresh
├── lib/
│   ├── api.ts                       # Cliente API con proxy y auth
│   ├── auth.ts                      # Gestión de credenciales (sessionStorage)
│   ├── env.ts                       # Detección de entorno (dev/prod, local/remoto)
│   ├── mock-data.ts                 # Generador de 1000 estudiantes mock
│   └── utils.ts                     # cn() para class names
└── types/
    └── index.ts                     # Interfaces TypeScript (Student, FormInstance, etc.)
```

## Requisitos previos

- **Node.js** >= 20
- **Backend corriendo** en `http://localhost:3000` (o URL configurada en `NEXT_PUBLIC_API_URL`)

## Getting Started

**1. Instalar dependencias**

```bash
npm install
```

**2. Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus valores (ver `.env.example` para referencia).

**3. Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3001`.

## Variables de entorno

| Variable | Descripción | Valor por defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:3000` | Sí |
| `NEXT_PUBLIC_ENV` | Entorno: `development` o `production` | `development` | Sí |
| `NEXT_PUBLIC_ADMIN_USERNAME` | Pre-rellena el campo de usuario en login (solo dev) | — | No |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Pre-rellena el campo de password en login (solo dev) | — | No |

### Comportamiento por entorno

| Funcionalidad | `development` | `production` |
|---------------|:-------------:|:------------:|
| Dev Toolbar (Reset, Generar, Enviar, Mock) | ✅ | ❌ |
| Columna Magic Link en tabla | ✅ | ❌ |
| Pre-llenado de credenciales en login | ✅ | ❌ |
| Mock de 1000 estudiantes | ✅ | ❌ |
| Alerta "Apuntando a prod" | ✅ (si API no es localhost) | ❌ |
| Cache SWR (revalidación cada 5 min) | ✅ | ✅ |

## Proxy API (CORS)

El frontend no llama al backend directamente. Todas las requests pasan por un rewrite de Next.js configurado en `next.config.ts`:

```
Frontend: /api/proxy/dashboard/students-status
    ↓ (rewrite)
Backend:  http://localhost:3000/dashboard/students-status
```

Esto evita problemas de CORS ya que las requests salen del mismo origen. En producción (Vercel), el rewrite apunta a la URL de Heroku configurada en `NEXT_PUBLIC_API_URL`.

## Endpoints del backend consumidos

### Desde el panel de administración (con Basic Auth)

| Endpoint | Uso en el frontend |
|----------|-------------------|
| `GET /dashboard/students-status` | Tabla principal del dashboard |
| `GET /dashboard/students/:id/history` | Historial de un estudiante |
| `GET /students` | Listado de estudiantes |
| `POST /students` | Crear estudiante |
| `PATCH /students/:id/toggle-active` | Activar/desactivar estudiante |

### Desde el formulario público (sin auth)

| Endpoint | Uso en el frontend |
|----------|-------------------|
| `GET /forms/:token` | Obtener template y datos del formulario |
| `POST /forms/:token/submit` | Enviar respuestas del formulario |

### Desde la Dev Toolbar (solo development, con Basic Auth)

| Endpoint | Uso en el frontend |
|----------|-------------------|
| `POST /dashboard/dev/generate-forms` | Generar formularios de la semana |
| `POST /dashboard/dev/send-emails` | Encolar envío de emails |
| `POST /dashboard/dev/reset` | Eliminar todas las form instances |

## Deployment (Vercel)

La aplicación está deployada en Vercel bajo el team **Apicanta**.

**URL de producción:** `https://apicanta-report-system-frontend.vercel.app`

### Variables de entorno en Vercel

Configuradas en el dashboard de Vercel (Settings > Environment Variables):

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://apicanta-reports-bd723bfdd39c.herokuapp.com` |
| `NEXT_PUBLIC_ENV` | `production` |

> `NEXT_PUBLIC_ADMIN_USERNAME` y `NEXT_PUBLIC_ADMIN_PASSWORD` no se configuran en producción.

### Deploy manual

```bash
vercel --prod --scope apicanta --yes
```

### Consideraciones

- El archivo `.vercelignore` excluye `.env*` para evitar que las variables locales pisen las de Vercel.
- Las variables `NEXT_PUBLIC_*` se inline-an en el build. Un cambio de variable requiere un nuevo deploy.
- El rewrite de `/api/proxy/*` funciona en Vercel igual que en local.

## Tech Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16 | Framework frontend (App Router) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Estilos utility-first |
| shadcn/ui | — | Componentes UI (Radix + Tailwind) |
| TanStack Table | 8 | Tabla con sorting, filtros, virtualización |
| SWR | 2 | Data fetching con cache y revalidación |
| React Hook Form | 7 | Manejo de formularios |
| Zod | 4 | Validación de schemas |
| Lucide React | — | Iconos |
| Sonner | 2 | Toast notifications |
