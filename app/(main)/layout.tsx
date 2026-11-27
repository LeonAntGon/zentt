import type { ReactNode } from "react";
import { FontVars } from "@/components/FontVars";
import { inter } from "@/lib/fonts/inter";
import { montserrat } from "@/lib/fonts/montserrat";

/** Landing, blog, auth y panel: Inter (cuerpo) + Montserrat (títulos). */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <FontVars
        vars={{
          "--font-body": inter.style.fontFamily,
          "--font-heading": montserrat.style.fontFamily,
        }}
      />
      {children}
    </>
  );
}
