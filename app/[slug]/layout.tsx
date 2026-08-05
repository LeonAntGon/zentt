import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="public-site min-h-screen bg-white text-slate-900 antialiased"
      style={{
        fontFamily:
          "var(--font-public), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <GoogleAnalytics />
      {children}
    </div>
  );
}
