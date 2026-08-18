import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://zentt.agency"),
  title: "Zentt — Gestión de alojamientos",
  description:
    "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
  icons: {
    icon: [{ url: "/assets/t-logotipo.png", type: "image/png" }],
    apple: [{ url: "/assets/t-logotipo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    title: "Zentt — Gestión de alojamientos",
    description:
      "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
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
    title: "Zentt — Gestión de alojamientos",
    description:
      "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
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
