import localFont from "next/font/local";

/**
 * Montserrat para los títulos de los sitios públicos, SIN preload: la fuente
 * crítica ahí es Plus Jakarta; los títulos pueden llegar un instante después.
 */
export const montserratNoPreload = localFont({
  src: "../../app/fonts/montserrat-latin-wght-normal.woff2",
  display: "swap",
  weight: "100 900",
  preload: false,
});
