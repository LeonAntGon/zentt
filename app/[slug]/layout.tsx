import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/consent/CookieConsent";

export default function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="public-site flex min-h-dvh flex-col font-public antialiased">
      <GoogleAnalytics />
      <CookieConsent />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
