"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __zenttGaConfigured?: boolean;
  }
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag || ((...args: unknown[]) => window.dataLayer.push(args));

    if (!window.__zenttGaConfigured) {
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false });
      window.__zenttGaConfigured = true;
    }

    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [measurementId, pathname]);

  if (!measurementId) return null;

  const encodedMeasurementId = JSON.stringify(measurementId);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
if (!window.gtag) {
  window.gtag = function gtag(){window.dataLayer.push(arguments);};
}
if (!window.__zenttGaConfigured) {
  window.gtag('js', new Date());
  window.gtag('config', ${encodedMeasurementId}, { send_page_view: false });
  window.__zenttGaConfigured = true;
}`}
      </Script>
    </>
  );
}
