import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="public-site flex min-h-dvh flex-col bg-white font-public text-slate-900 antialiased">
      <GoogleAnalytics />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
