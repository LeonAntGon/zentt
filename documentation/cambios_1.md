# Cambios 1 — Integración del blog de Zentt

Fecha: 2026-11-23

## Objetivo

Publicar el blog corporativo de Zentt en `https://zentt.agency/blog`, usando un CMS privado independiente y MongoDB Atlas como fuente de verdad del contenido. El frontend público de Zentt consume la API del CMS únicamente desde el servidor.

## Estructura final del proyecto

| Proyecto | Ruta | Rol |
|---|---|---|
| Frontend público de Zentt | `saas/web/frontend` | Lo que ve el visitante en `zentt.agency/blog` |
| CMS de Zentt | `blog-sistem/zentt-blog-admin` | Panel admin + API pública del blog |
| Vida Fuerte | `blog-sistem/vida-fuerte--Full-Stack-Blog-Platform` | Proyecto original, intacto y separado |

Decisiones importantes:

- El CMS de Zentt **no vive dentro del repo de Vida Fuerte**. Se movió el backend adaptado a una carpeta propia: `blog-sistem/zentt-blog-admin`.
- Vida Fuerte se restauró a su último commit original (`4b36bcc tables responsiveness`), por lo que conserva sus categorías, tags y branding de fitness.
- El frontend antiguo de Vida Fuerte (`blog-sistem/vida-fuerte--Full-Stack-Blog-Platform/frontend`) no se usa para Zentt y quedó intacto.
- El frontend público de Zentt sigue en su repo independiente (`saas/web/frontend`, remoto `github.com/LeonAntGon/zentt`).

## Tipo de cambios realizados

### 1. Seguridad y autenticación

- Allowlist fail-closed con `BLOG_ADMIN_EMAILS` en NextAuth.
- Si la allowlist está vacía, nadie puede iniciar sesión.
- Validación tanto en `authorize` (credenciales) como en el callback `signIn` (Google y credenciales).
- Middleware del CMS protege `/`, `/blogs/:path*`, `/draft` y `/setting`.
- El CMS completo envía `X-Robots-Tag: noindex, nofollow` y meta robots.
- Previews de Vercel y Cloudflare Pages reciben `noindex, nofollow`.
- La API pública nunca expone borradores; las respuestas autenticadas usan `Cache-Control: private, no-store`.
- Las respuestas públicas usan `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` con `Vary: Cookie`.

### 2. API y datos

- `GET /api/blogapi` filtra `status: "publish"` para consumidores anónimos o cuando se envía `public=true`.
- Se validan los estados permitidos: `draft` y `publish`.
- Se devuelven códigos HTTP correctos: `201` al crear, `400` en datos inválidos, `401` sin sesión, `404` si no existe, `405` para métodos no permitidos y `500` ante errores internos.
- Se agregaron índices en MongoDB para `slug`, `status + createdAt`, `blogcategory + status` y `tags + status`.
- Conexión a MongoDB cacheada para evitar múltiples conexiones en serverless.
- La API tolera el build sin `MONGODB_URI`; en runtime el login falla cerrado hasta configurarla.

### 3. UI y experiencia del panel

- Rebranding mínimo del panel: “ZENTT BLOG” en lugar de “ADMIN”.
- Se eliminó la foto personal del login y se usa la imagen de la cuenta o una inicial.
- Login con mensajes claros para `AccessDenied`, `Configuration` y errores de OAuth.
- Configuración sin teléfono/email de ejemplo; muestra la cuenta autenticada.
- Categorías de contenido adaptadas a alojamiento y turismo.
- Tags adaptados a reservas directas, marketing, WhatsApp, temporada, atención al huésped y rentabilidad.

### 4. SEO del sitio público

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
- Redirección 301 de `www.zentt.agency` a `zentt.agency`.
- Imagen destacada sin duplicarse en el cuerpo del post.

### 5. Infraestructura y organización

- Separación del CMS de Zentt como proyecto independiente.
- Vida Fuerte restaurado a su estado original.
- `BLOG_API_URL` queda como variable server-only del frontend de Zentt.
- `NEXT_PUBLIC_PUBLIC_SITE_URL` define el dominio canónico usado por sitemap y robots.
- Documentación versionada en el repo del frontend público.

### 6. Documentación

- `documentation/cambios_1.md` (este archivo).
- `resumen-sesion.txt`.
- Copia versionada en `saas/web/frontend/documentation/`.
- README propio del CMS en `blog-sistem/zentt-blog-admin/README.md`.

## SEO implementado en el frontend público

- Canonical por ruta y por post.
- Open Graph con imagen destacada cuando existe.
- JSON-LD `Article` con `datePublished`, `dateModified`, autor y publisher.
- Sitemap dinámico con revalidación.
- Robots con sitemap y bloqueo de áreas privadas.
- Categorías y tags con etiquetas legibles en la UI y slugs en las URLs.
- Noindex en previews y en el CMS.

## Variables de entorno

### Frontend Zentt (`saas/web/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.zentt.agency/api
NEXT_PUBLIC_PUBLIC_SITE_URL=https://zentt.agency
BLOG_API_URL=https://blog-admin.zentt.agency
NEXT_PUBLIC_MEDIA_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

`BLOG_API_URL` es la URL base del CMS, sin `/api` y sin barra final. Es server-only; no debe exponerse como `NEXT_PUBLIC_BLOG_API_URL` en producción.

### CMS Zentt (`blog-sistem/zentt-blog-admin/.env.local`)

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
- En MongoDB Atlas, habilitar el acceso de red correspondiente y un usuario con permisos mínimos sobre la base del blog.

## Cómo se conecta con zentt.agency

1. El editor crea o publica un post en el CMS (`blog-sistem/zentt-blog-admin`).
2. El post se guarda en MongoDB Atlas.
3. El frontend público de Zentt (`saas/web/frontend`) consulta `${BLOG_API_URL}/api/blogapi?public=true`.
4. El contenido aparece en `https://zentt.agency/blog`.

El panel admin no es visible para los visitantes. La UI pública del blog sí es 100% Zentt (navbar, footer y colores de Zentt).

## Despliegue recomendado

1. **MongoDB Atlas**
   - Crear cluster y base `zentt_blog`.
   - Crear usuario dedicado y limitar permisos a esa base.
   - Configurar Network Access.
   - Guardar la cadena de conexión como secreto del CMS.

2. **CMS de Zentt**
   - Desplegar la carpeta `blog-sistem/zentt-blog-admin` en Vercel o Cloudflare.
   - Configurar todas las variables del CMS.
   - Verificar que el CMS responde `X-Robots-Tag: noindex, nofollow`.
   - Probar login con una cuenta de la allowlist y con una que no lo esté.

3. **Frontend Zentt**
   - Desplegar `saas/web/frontend`.
   - Configurar `BLOG_API_URL` y `NEXT_PUBLIC_PUBLIC_SITE_URL`.
   - Verificar el 301 de `www.zentt.agency` a `zentt.agency`.
   - Verificar que las previews tengan `noindex` y producción no.

4. **Cloudflare**
   - DNS: `zentt.agency` y `www` apuntando al frontend.
   - Regla/Redirect Rule para `www` como respaldo del middleware.
   - No cachear respuestas autenticadas del CMS.
   - Revisar `BLOG_ZENTT_CLOUDFLARE_MONGODB.pdf` para la arquitectura completa.

## Validación ejecutada

```powershell
# Frontend Zentt
node .\node_modules\next\dist\bin\next build
node .\node_modules\typescript\bin\tsc --noEmit --pretty false

# CMS Zentt
node .\node_modules\next\dist\bin\next build

# Frontend antiguo del CMS (validación histórica)
npm ci --no-audit --no-fund
node .\node_modules\next\dist\bin\next build
```

Resultados:

- Frontend Zentt: build correcto; 25 rutas generadas; sin errores de tipos.
- CMS Zentt: build correcto; 10 rutas generadas.
- Frontend antiguo del CMS: build correcto; 6 rutas generadas. Solo avisos no bloqueantes de `baseline-browser-mapping` y `browserslist`.
- El build se ejecutó sin credenciales reales de Atlas/Google. El CMS tolera la ausencia de `MONGODB_URI` durante el build y falla cerrado en runtime.

## Pendientes antes de publicar

- [ ] Cargar credenciales reales en los entornos de despliegue.
- [ ] Crear el cluster de MongoDB Atlas y el usuario de aplicación.
- [ ] Configurar Google OAuth con el redirect URI definitivo.
- [ ] Publicar al menos un post real en el CMS y verificar `/blog` y `/blog/[slug]`.
- [ ] Verificar el 301 de `www` en producción.
- [ ] Verificar `X-Robots-Tag` en previews y en el CMS.
- [ ] Enviar el sitemap a Google Search Console.
- [ ] Revisar el renderer Markdown del frontend: no soporta tablas GFM, listas anidadas ni HTML embebido.

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

### CMS Zentt

- `pages/api/auth/[...nextauth].js`
- `pages/api/blogapi.js`
- `middleware.js`
- `lib/mongodb.js`
- `lib/mongoose.js`
- `models/blog.js`
- `pages/login.js`
- `pages/setting.js`
- `components/Header.js`
- `components/Blog.js`
- `pages/_app.js`
- `pages/_document.js`
- `next.config.mjs`
- `styles/globals.css`
- `.env.example`
- `README.md`
- `package.json`
