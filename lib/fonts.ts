import { Inter, Montserrat, Plus_Jakarta_Sans } from "next/font/google";

/** Cuerpo: UI, formularios, dashboard, datos */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/** Display: títulos de marketing y páginas */
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

/** Sitios públicos generados para clientes */
export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-public",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const fontVariables = `${inter.variable} ${montserrat.variable} ${plusJakarta.variable}`;
