import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="public-site min-h-screen bg-white font-public text-slate-900 antialiased"
    >
      <GoogleAnalytics />
      {children}
    </div>
  );
}
