import localFont from "next/font/local";

/**
 * Fuentes auto-alojadas con next/font/local.
 *
 * No usamos next/font/google para que el build no dependa de la red de
 * Google Fonts. Los archivos viven en app/fonts y se sirven desde el repo.
 */

/** Cuerpo: UI, formularios, dashboard, datos */
export const inter = localFont({
  src: "../app/fonts/inter-latin-wght-normal.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "100 900",
});

/** Display: títulos de marketing y páginas */
export const montserrat = localFont({
  src: "../app/fonts/montserrat-latin-wght-normal.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "100 900",
});

/** Sitios públicos generados para clientes */
export const plusJakarta = localFont({
  src: "../app/fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-public",
  display: "swap",
  weight: "200 800",
});

export const fontVariables = `${inter.variable} ${montserrat.variable} ${plusJakarta.variable}`;
