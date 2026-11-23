import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zentt/ui"],
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": require.resolve("react-native-web"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/dashboard/mensajes",
        destination: "/dashboard/buzon",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/embed/:slug/cabana/:cabanaSlug",
        destination: "/:slug/cabana/:cabanaSlug?embed=1&theme=lanorita",
      },
    ];
  },
  async headers() {
    const isPreview =
      process.env.VERCEL_ENV === "preview" ||
      (process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH !== "main");

    const headers: {
      source: string;
      headers: { key: string; value: string }[];
    }[] = [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 https://*.vercel.app https://xn--cabaaslanorita-tnb.com https://www.xn--cabaaslanorita-tnb.com",
          },
        ],
      },
    ];

    if (isPreview) {
      headers.push({
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      });
    }

    return headers;
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
