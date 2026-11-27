import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { FontVars } from "@/components/FontVars";
import { plusJakarta } from "@/lib/fonts/plusJakarta";
import { montserratNoPreload } from "@/lib/fonts/montserratNoPreload";

export default function PublicSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="public-site flex min-h-dvh flex-col font-public antialiased">
      {/* Solo Plus Jakarta se precarga; Inter no se carga en sitios públicos. */}
      <FontVars
        vars={{
          "--font-public": plusJakarta.style.fontFamily,
          "--font-body": plusJakarta.style.fontFamily,
          "--font-heading": montserratNoPreload.style.fontFamily,
        }}
      />
      <GoogleAnalytics />
      <CookieConsent />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
