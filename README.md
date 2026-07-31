# Zentt — new-web (Next.js)

Frontend Next.js (App Router) del SaaS Zentt. Clon funcional de `react/web` (Vite), con landing basada en AcmeHero.

## Requisitos

- Node.js 18+
- Backend Django en `http://localhost:8000` (`django/1st-proyect`)

## Arranque

```bash
cd react/new-web
npm install
npm run dev
```

App en [http://localhost:3000](http://localhost:3000).

Variables en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MEDIA_URL=http://localhost:8000
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing (AcmeHero / Zentt) |
| `/login` | Login JWT |
| `/register` | Registro de dueños |
| `/dashboard` | Panel (Overview) |
| `/dashboard/cabanas` | Listado de alojamientos |
| `/dashboard/cabanas/crear` | Crear alojamiento |
| `/dashboard/cabanas/editar/[slug]` | Editar alojamiento |
| `/dashboard/mensajes` | Inbox |
| `/dashboard/configuracion` | Perfil / negocio |
| `/[slug]` | Sitio público del complejo |
| `/[slug]/cabana/[cabanaSlug]` | Detalle público de alojamiento |

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run start` — servir build
- `npm run lint` — ESLint

## Notas

- El frontend Vite original (`react/web`) sigue intacto.
- Auth: JWT en `localStorage` (`access_token` / `refresh_token`).
- CORS del backend ya permite `http://localhost:3000`.
