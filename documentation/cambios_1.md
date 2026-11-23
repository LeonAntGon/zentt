# Cambios 1 — Integración del blog de Zentt

Fecha: 2026-11-22

## Objetivo

Publicar el blog corporativo de Zentt en `https://zentt.agency/blog`, usando el CMS “Vida Fuerte” como backoffice privado y MongoDB Atlas como fuente de verdad del contenido. El frontend público de Zentt consume la API del CMS únicamente desde el servidor.

## Arquitectura

- **Frontend público:** `saas/web/frontend` (Next.js App Router).
- **CMS/backoffice:** `blog-sistem/vida-fuerte--Full-Stack-Blog-Platform/backend` (Next.js Pages Router + NextAuth).
- **Base de datos del blog:** MongoDB Atlas, colección `blogtest`, modelo `Blog`.
- **API pública:** `GET /api/blogapi?public=true` en el CMS.
- **Caché:** las respuestas públicas usan `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` y `Vary: Cookie`; las respuestas autenticadas y las mutaciones usan `no-store`.
- **Separación:** el blog no comparte PostgreSQL ni la base de datos transaccional de Zentt. El frontend no recibe credenciales de MongoDB.

El frontend llama al CMS mediante `BLOG_API_URL` desde Server Components. Esa variable no debe llevar el prefijo `NEXT_PUBLIC_`.

## Correcciones bloqueantes aplicadas

1. **Allowlist de administradores (fail-closed)**
   - `BLOG_ADMIN_EMAILS` contiene los emails autorizados, separados por coma.
   - Si la variable está vacía, nadie puede iniciar sesión.
   - Se valida tanto en `authorize` (credenciales) como en el callback `signIn` (Google y credenciales).
   - El login muestra un mensaje claro para `AccessDenied` y otros errores de NextAuth.
   - Archivos: `backend/pages/api/auth/[...nextauth].js`, `backend/pages/login.js`, `backend/.env.example`.

2. **Middleware del CMS**
   - Se protegen `/`, `/blogs/:path*`, `/draft` y `/setting`.
   - Se configura `pages.signIn = "/login"`.
   - Archivo: `backend/middleware.js`.

3. **Imagen duplicada en el post**
   - La primera imagen Markdown se usa como imagen destacada y se elimina del cuerpo antes de renderizar.
   - Archivos: `saas/web/frontend/lib/blog.ts`, `saas/web/frontend/app/blog/[slug]/page.tsx`.

4. **Errores de API diferenciados**
   - Si el CMS no está configurado, no responde o devuelve 5xx, el frontend lanza un error controlado y muestra un error boundary (500).
   - Solo un post inexistente (respuesta 2xx sin resultados, o 404 del CMS) devuelve 404.
   - Ya no se muestra “Próximamente” cuando la API falla.
   - Archivos: `lib/blog.ts`, `app/blog/error.tsx`, `app/blog/[slug]/not-found.tsx`.
   - Durante `next build`, si el CMS no está disponible, se renderiza sin posts para no bloquear el build. En runtime el fallo sí se propaga.

5. **Dominio canónico**
   - `www.zentt.agency` redirige con 301 a `zentt.agency`, conservando ruta y query.
   - `sitemap.ts` y `robots.ts` usan `NEXT_PUBLIC_PUBLIC_SITE_URL` con fallback a `https://zentt.agency`.
   - Archivos: `middleware.ts`, `app/sitemap.ts`, `app/robots.ts`.

6. **Noindex de previews y del CMS**
   - Previews de Vercel (`VERCEL_ENV=preview`) y de Cloudflare Pages (rama distinta de `main`) reciben `X-Robots-Tag: noindex, nofollow`.
   - La metadata del layout también marca `robots: noindex, nofollow` en previews.
   - El CMS envía `X-Robots-Tag: noindex, nofollow` en todas sus rutas y `_document.js` incluye el meta robots.
   - Archivos: `next.config.ts`, `app/layout.tsx`, `backend/next.config.mjs`, `backend/pages/_document.js`.

7. **Rebranding mínimo del CMS**
   - Se reemplazó “ADMIN” por “ZENTT BLOG”.
   - Se eliminó la foto personal y se usa la imagen de la cuenta o una inicial.
   - El login ya no muestra “Bienvenido Admin” ni `yop.jpg`.
   - Configuración sin teléfono/email de ejemplo; muestra la cuenta autenticada.
   - Categorías: `cabanas`, `turismo`, `consejos-para-anfitriones`, `noticias-zentt`, `guias`.
   - Tags: `reservas-directas`, `marketing`, `whatsapp`, `temporada`, `atencion-al-huesped`, `rentabilidad`.
   - Archivos: `backend/components/Header.js`, `backend/pages/login.js`, `backend/pages/setting.js`, `backend/components/Blog.js`, `backend/styles/globals.css`, `backend/pages/_app.js`.

8. **Build y typecheck**
   - Frontend Zentt: `next build` y `tsc --noEmit` correctos.
   - CMS backend: `next build` correcto usando variables de entorno ficticias para el build (sin credenciales reales).
   - Frontend antiguo del CMS: ver sección de validación.

9. **Documentación y commits**
   - Este documento y `resumen-sesion.txt` en la raíz del workspace.
   - Copia versionada en `saas/web/frontend/documentation/`.
   - Commits en español en los dos repositorios Git existentes.

## SEO implementado

- Rutas:
  - `/blog`
  - `/blog/[slug]`
  - `/blog/categoria/[category]`
  - `/blog/etiqueta/[tag]`
- Metadata por página con canonical, Open Graph y Twitter Cards.
- JSON-LD `Article` en cada post, con autor y publisher `Zentt`.
- `sitemap.xml` dinámico con home, blog y posts publicados.
- `robots.txt` con sitemap y bloqueo de `/dashboard/` y `/api/`.
- Enlaces al blog en el navbar y footer de Zentt.
- Filtrado estricto de borradores en la API pública y en el frontend antiguo.
- Categorías y tags con etiquetas legibles en la UI, manteniendo slugs en las URLs.

## Variables de entorno

### Frontend Zentt (`saas/web/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.zentt.agency/api
NEXT_PUBLIC_PUBLIC_SITE_URL=https://zentt.agency
BLOG_API_URL=https://blog-admin.zentt.agency
NEXT_PUBLIC_MEDIA_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

`BLOG_API_URL` es server-only. No debe exponerse como `NEXT_PUBLIC_BLOG_API_URL` en producción.

### CMS (`blog-sistem/vida-fuerte--Full-Stack-Blog-Platform/backend/.env.local`)

```env
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/zentt_blog?retryWrites=true&w=majority
NEXTAUTH_URL=https://blog-admin.zentt.agency
NEXTAUTH_SECRET=GENERAR_CON_OPENSSL_RAND_BASE64_32
BLOG_ADMIN_EMAILS=admin@zentt.agency,otro-admin@zentt.agency
DEMO_ADMIN_EMAIL=
DEMO_ADMIN_PASSWORD=
GOOGLE_ID=
GOOGLE_SECRET=
```

Notas:

- `BLOG_ADMIN_EMAILS` es obligatoria. Si queda vacía, el acceso queda cerrado.
- `DEMO_ADMIN_EMAIL` y `DEMO_ADMIN_PASSWORD` son opcionales. Si se usan, el email también debe estar en `BLOG_ADMIN_EMAILS`.
- En Google Cloud Console, el redirect URI autorizado debe ser `https://blog-admin.zentt.agency/api/auth/callback/google`.
- En MongoDB Atlas, habilitar el acceso de red correspondiente (idealmente salida fija de Cloudflare/Vercel o rangos documentados) y un usuario con permisos mínimos sobre la base del blog.

## Despliegue recomendado

1. **MongoDB Atlas**
   - Crear cluster y base `zentt_blog`.
   - Crear usuario dedicado y limitar permisos a esa base.
   - Configurar Network Access.
   - Guardar la cadena de conexión como secreto del CMS.

2. **CMS en Vercel o Cloudflare**
   - Configurar todas las variables del CMS.
   - Verificar que `NEXTAUTH_URL` sea el dominio público del CMS.
   - Confirmar que el CMS responde `X-Robots-Tag: noindex, nofollow`.
   - Probar login con una cuenta incluida en `BLOG_ADMIN_EMAILS` y con una que no lo esté.

3. **Frontend Zentt**
   - Configurar `BLOG_API_URL` y `NEXT_PUBLIC_PUBLIC_SITE_URL`.
   - Desplegar en Cloudflare Pages o Vercel.
   - Verificar el 301 de `www.zentt.agency` a `zentt.agency`.
   - Verificar que las previews tengan `noindex` y que producción no lo tenga.

4. **Cloudflare**
   - DNS: `zentt.agency` y `www` apuntando al frontend.
   - Regla/Redirect Rule para `www` como respaldo del middleware.
   - No cachear respuestas de API autenticadas del CMS.
   - Revisar el PDF `BLOG_ZENTT_CLOUDFLARE_MONGODB.pdf` para la arquitectura completa.

## Validación ejecutada

```powershell
# Frontend Zentt
node .\node_modules\next\dist\bin\next build
node .\node_modules\typescript\bin\tsc --noEmit --pretty false

# CMS backend
node .\node_modules\next\dist\bin\next build

# Frontend antiguo del CMS
npm ci --no-audit --no-fund
node .\node_modules\next\dist\bin\next build
```

Resultados:

- Frontend Zentt: build correcto; 25 rutas generadas; sin errores de tipos.
- CMS backend: build correcto; 10 rutas generadas.
- Frontend antiguo del CMS: build correcto; 6 rutas generadas. Solo aparecen avisos no bloqueantes de `baseline-browser-mapping` y `browserslist` por datos desactualizados.
- El build se ejecutó sin credenciales reales de Atlas/Google. El CMS tolera la ausencia de `MONGODB_URI` durante el build y falla cerrado en runtime.

## Pendientes antes de publicar

- [ ] Cargar credenciales reales en los entornos de despliegue.
- [ ] Crear el cluster de MongoDB Atlas y el usuario de aplicación.
- [ ] Configurar Google OAuth con el redirect URI definitivo.
- [ ] Publicar al menos un post real en el CMS y verificar `/blog` y `/blog/[slug]`.
- [ ] Verificar el 301 de `www` en producción.
- [ ] Verificar `X-Robots-Tag` en previews y en el CMS.
- [ ] Enviar el sitemap a Google Search Console.
- [ ] Revisar el renderer Markdown: no soporta tablas GFM, listas anidadas ni HTML embebido.
- [ ] Definir si se elimina el frontend antiguo del CMS o se mantiene como respaldo.

## Archivos principales

### Frontend Zentt

- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/blog/[slug]/not-found.tsx`
- `app/blog/categoria/[category]/page.tsx`
- `app/blog/etiqueta/[tag]/page.tsx`
- `app/blog/error.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `components/blog/BlogCard.tsx`
- `components/blog/BlogListing.tsx`
- `components/blog/BlogMarkdown.tsx`
- `lib/blog.ts`
- `middleware.ts`
- `next.config.ts`
- `app/layout.tsx`
- `app/globals.css`
- `components/landing/Navbar.tsx`
- `components/landing/Footer.tsx`
- `.env.example`

### CMS

- `backend/pages/api/auth/[...nextauth].js`
- `backend/pages/api/blogapi.js`
- `backend/middleware.js`
- `backend/lib/mongodb.js`
- `backend/lib/mongoose.js`
- `backend/models/blog.js`
- `backend/pages/login.js`
- `backend/pages/setting.js`
- `backend/components/Header.js`
- `backend/components/Blog.js`
- `backend/pages/_app.js`
- `backend/pages/_document.js`
- `backend/next.config.mjs`
- `backend/styles/globals.css`
- `backend/.env.example`
- `frontend/pages/api/getblog.js`
- `frontend/pages/blog/[slug].js`
