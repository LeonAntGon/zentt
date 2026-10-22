# @zentt/ui

Primitives compartidos entre Next.js y Expo. Están implementados con React Native y se renderizan en Next.js mediante React Native Web.

El paquete y sus historias de ejemplo viven en el repositorio `web/frontend`. `mobile` lo consume localmente desde `../web/frontend/packages/ui`; npm lo instala como copia local para que Metro no cargue un segundo React. Después de cambiar el paquete, ejecutar `npm install` desde `mobile`. Antes de compilar el repo móvil en un checkout independiente, publicar una versión del paquete y reemplazar esa dependencia `file:` por la versión publicada.

El registro privado debe configurarse en Vercel/EAS con un token de solo lectura (`NODE_AUTH_TOKEN`); no guardar el token en Git.

El catálogo web está en `/dev/components`; el catálogo nativo de desarrollo está en `/dev/components` dentro de la app Expo. Ambos usan fixtures, no importan el cliente API y pueden probarse sin backend.
