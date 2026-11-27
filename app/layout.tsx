import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-phone-number-input/style.css";
import { Providers } from "@/components/providers";

const isPreviewDeployment =
  process.env.VERCEL_ENV === "preview" ||
  (process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH !== "main");

export const metadata: Metadata = {
  metadataBase: new URL("https://zentt.agency"),
  robots: isPreviewDeployment ? { index: false, follow: false } : undefined,
  title: "Zentt — Páginas de reservas directas para alojamientos",
  description:
    "Te armo la página de reservas directas de tu alojamiento, conectada a WhatsApp y lista para la temporada. Pago único, llave en mano.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
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

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zentt.agency/#organization",
      name: "Zentt",
      url: "https://zentt.agency",
      logo: {
        "@type": "ImageObject",
        url: "https://zentt.agency/assets/logo-for-ico.png",
      },
      sameAs: ["https://www.instagram.com/somoszentt/"],
    },
    {
      "@type": "WebSite",
      "@id": "https://zentt.agency/#website",
      name: "Zentt",
      url: "https://zentt.agency",
      inLanguage: "es-AR",
      publisher: { "@id": "https://zentt.agency/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}
