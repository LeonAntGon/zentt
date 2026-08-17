import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Zentt — Gestión de alojamientos",
  description:
    "Plataforma SaaS para dueños de complejos de alojamientos: sitio público, reservas y mensajes.",
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
