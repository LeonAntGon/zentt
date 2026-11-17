import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-phone-number-input/style.css";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://zentt.agency"),
  title: "Zentt — Páginas de reservas directas para alojamientos",
  description:
    "Te armo la página de reservas directas de tu alojamiento, conectada a WhatsApp y lista para la temporada. Pago único, llave en mano. Hecho en Tucumán.",
  icons: {
    icon: [{ url: "/assets/logo-for-ico.png", type: "image/png" }],
    apple: [{ url: "/assets/logo-for-ico.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    title: "Zentt — Páginas de reservas directas para alojamientos",
    description:
      "Dejá de regalarle comisiones a Booking y Airbnb. Tu página de reservas directas, conectada a WhatsApp, llave en mano y con pago único.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Zentt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentt — Páginas de reservas directas para alojamientos",
    description:
      "Dejá de regalarle comisiones a Booking y Airbnb. Tu página de reservas directas, conectada a WhatsApp, llave en mano y con pago único.",
    images: ["/assets/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={fontVariables} suppressHydrationWarning>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
