import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/mensajes",
        destination: "/dashboard/buzon",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui.shadcn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      // Supabase Storage (URLs públicas y S3-compat)
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.storage.supabase.co" },
      // Backend Render (media servido por Django si falla el sync a Supabase)
      { protocol: "https", hostname: "zentt-backend.onrender.com" },
    ],
  },
};

export default nextConfig;
