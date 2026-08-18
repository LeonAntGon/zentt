import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://zentt.agency"),
  title: "Zentt — Gestión de alojamientos",
  description:
    "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
  openGraph: {
    title: "Zentt — Gestión de alojamientos",
    description:
      "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zentt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentt — Gestión de alojamientos",
    description:
      "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
    images: ["/assets/og-image.png"],
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
