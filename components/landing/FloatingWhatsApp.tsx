"use client";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WA_MESSAGES, waHref } from "@/components/landing/whatsapp";

/** Botón de WhatsApp siempre visible en la landing. */
export function FloatingWhatsApp() {
  return (
    <a
      href={waHref(WA_MESSAGES.demo)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedí tu demo por WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105 hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" title="" />
    </a>
  );
}

export default FloatingWhatsApp;
