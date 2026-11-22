# PulsePass — Frontend Web (Fase 5)

Aplicación web SPA construida con **React 19**, **TypeScript (`strict`)**, **Tailwind CSS v4**, **React Router v8 (`react-router`)**, **TanStack Query**, **React Hook Form + Zod** y **Vitest + Testing Library + MSW**.

## Requisitos previos

- **Node.js 22.22+**
- Backend de **PulsePass** corriendo en `http://localhost:8080` (Fases 1 a 4 con PostgreSQL y Flyway).

## Variables de entorno

Copia `.env.example` a `.env` si necesitas personalizar la ruta base (en desarrollo Vite redirige `/api` hacia `http://localhost:8080` mediante su proxy):

```env
VITE_API_BASE_URL=/api
```

## Comandos principales

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo (con proxy /api -> http://localhost:8080)
npm run dev

# Compilar TypeScript estricto y generar bundle de producción
npm run build

# Ejecutar análisis estático ESLint
npm run lint

# Ejecutar suite completa de pruebas (Vitest + Testing Library + MSW)
npm test
```

## Roles de demostración

| Actor | Usuario / Correo | Rol | Capacidades en la UI |
| :--- | :--- | :--- | :--- |
| **Visitante** | *(Sin sesión)* | `ANONYMOUS` | Explorar inicio, cartelera, detalle de eventos publicados, artistas, sedes, registro e inicio de sesión |
| **Andrea / Carlos** | Registrados vía `/registro` | `USER` | Comprar entradas, consultar y filtrar *Mis tickets*, ver detalle de ticket y cancelar tickets en estado `PAID` |
| **Personal de puerta** | `staff_e2e` (`password`) | `STAFF` | Validar ingreso por código (`/staff/validacion`) y consultar/usar tickets pagados por evento |
| **Administración** | `admin_e2e` (`password`) | `ADMIN` | Crear eventos en borrador, publicar eventos, asociar artistas y consultar eventos por código |

## Mapa de rutas principales

- `/` — Inicio (Hero, próximos eventos y artistas destacados)
- `/eventos` — Cartelera con filtros persistentes en URL (`?q=&categoria=&artista=`)
- `/eventos/:eventCode` — Detalle de evento y compra de entradas
- `/artistas` y `/artistas/:id` — Catálogo y perfil de artista
- `/sedes` y `/sedes/:code` — Catálogo y detalle de sede
- `/login` y `/registro` — Autenticación JWT (`sessionStorage` + memoria) y registro público
- `/cuenta` — Perfil del usuario autenticado
- `/mis-tickets`, `/mis-tickets/:ticketCode` y `/compra/confirmacion/:ticketCode` — Gestión de entradas del usuario (`USER`)
- `/staff/validacion` y `/staff/eventos/:eventCode/tickets` — Operación de ingreso (`STAFF` / `ADMIN`)
- `/admin/eventos`, `/admin/eventos/nuevo` y `/admin/eventos/:eventCode` — Administración del catálogo (`ADMIN`)
- `/403` y `*` — Páginas de acceso denegado (`403`) y ruta no encontrada (`404`)
