import localFont from "next/font/local";

/**
 * Cuerpo: UI, formularios, dashboard, datos.
 *
 * Cada fuente vive en su propio módulo para que Next solo precargue las que
 * importa cada layout (landing/panel vs. sitios públicos).
 */
export const inter = localFont({
  src: "../../app/fonts/inter-latin-wght-normal.woff2",
  display: "swap",
  weight: "100 900",
});
