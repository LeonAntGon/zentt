# Zentt Web — Next.js

Frontend web del SaaS Zentt (Next.js App Router). El repo contiene `packages/ui`, origen de los componentes compartidos con `mobile`, y el harness web.

## Desarrollo

- Node.js 22+
- Backend Django: `../backend` dentro del workspace local.

```bash
cd web/frontend
npm install
npm run dev
```

La app queda en [http://localhost:3000](http://localhost:3000). Configurá `.env.local` usando `.env.example`.

## Harness sin backend

Abrí [http://localhost:3000/dev/components](http://localhost:3000/dev/components). El catálogo usa fixtures de `packages/ui/src/harness/fixtures.ts`, no importa `lib/api` y permite alternar estados de carga, error, vacío, validación y disabled.

## Pagos

- Mercado Pago conserva el checkout en ARS para Argentina.
- **Modo temporal:** los pagos internacionales (USD) se coordinan por WhatsApp (`lib/internationalPayments.ts`). Al elegir "Internacional", el botón abre `wa.me/5493813380751` con el plan y el precio precargados; no se llama al backend.
- Polar sigue implementado como fallback: para reactivarlo, cambiar `INTERNATIONAL_PAYMENT_MODE` a `"polar"` en `lib/internationalPayments.ts` y definir `NEXT_PUBLIC_POLAR_CHECKOUT_ENABLED=true`. El checkout se crea en Django mediante `POST /api/payments/create-polar-checkout/`; el navegador nunca recibe el token secreto.

## UI compartida con React Native

`packages/ui` usa primitivas de React Native y `react-native-web` para el render web. En este workspace local, `mobile` referencia el paquete con `file:../web/frontend/packages/ui`. Antes de compilar el repo móvil desde un checkout independiente, publicar una versión en el registro elegido (privado si corresponde) y reemplazar esa dependencia `file:` por una versión publicada.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run start` — servir el build
- `npm run lint` — ESLint

La autenticación web conserva JWT en `localStorage`; la app nativa usa `expo-secure-store`.
