"use client";

import { useEffect, useState } from "react";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";
import { BookingIcon } from "@/components/icons/BookingIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

/**
 * Marquee infinito sin huecos.
 * - Cada track repite los ítems hasta superar el viewport.
 * - Dos tracks idénticos; la animación desplaza exactamente -50% (un track).
 * - Gap uniforme al final de cada track para que el empalme sea continuo.
 * - El track animado se monta solo en cliente para evitar hydration mismatch.
 */
const Icon = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <li className="flex items-center gap-1.5 sm:gap-2 shrink-0 list-none">
    <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full">
      {children}
    </div>
    <span className="text-xs sm:text-sm font-heading font-medium text-foreground/70 whitespace-nowrap tracking-wide">
      {label}
    </span>
  </li>
);

const GCal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M18 4h-1V2h-2v2H9V2H7v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    <path fill="#fff" d="M6 8h12v10H6V8Z" />
    <path fill="#EA4335" d="M8 10h2v2H8v-2Z" />
    <path fill="#FBBC05" d="M11 10h2v2h-2v-2Z" />
    <path fill="#34A853" d="M14 10h2v2h-2v-2Z" />
    <path fill="#4285F4" d="M8 13h2v2H8v-2Z" />
    <path fill="#EA4335" d="M11 13h2v2h-2v-2Z" />
    <path fill="#FBBC05" d="M14 13h2v2h-2v-2Z" />
  </svg>
);

const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      stroke="#E4405F"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="4.2" stroke="#E4405F" strokeWidth="1.8" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#E4405F" />
  </svg>
);

const INTEGRATIONS = [
  { label: "WhatsApp", Icon: () => <WhatsAppIcon className="text-[#25D366]" title="" /> },
  { label: "Airbnb", Icon: () => <AirbnbIcon className="text-[#FF385C]" title="" /> },
  { label: "Booking.com", Icon: () => <BookingIcon className="text-[#003580]" /> },
  { label: "Instagram", Icon: Instagram },
  { label: "Facebook", Icon: () => <FacebookIcon className="text-[#1877F2]" /> },
  { label: "Google Calendar", Icon: GCal },
] as const;

/** Repeticiones por track: asegura ancho > viewport y evita huecos en desktop. */
const REPEAT = 3;

function MarqueeTrack({
  id,
  ariaHidden,
}: {
  id: string;
  ariaHidden?: boolean;
}) {
  const items = Array.from({ length: REPEAT }, () => INTEGRATIONS).flat();

  return (
    <ul
      className="flex shrink-0 items-center gap-8 sm:gap-12 md:gap-16 pr-8 sm:pr-12 md:pr-16"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((item, index) => (
        <Icon key={`${id}-${item.label}-${index}`} label={item.label}>
          <item.Icon />
        </Icon>
      ))}
    </ul>
  );
}

export function IntegrationsMarquee() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative w-full max-w-full overflow-hidden bg-background py-8 sm:py-10 md:py-12"
      aria-label="Integraciones compatibles"
    >
      <p className="px-4 text-center text-[10px] sm:text-[11px] font-heading font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-muted-foreground mb-5 sm:mb-6">
        Compatible con lo que ya usas
      </p>

      <div className="relative w-full overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 md:w-28 bg-gradient-to-r from-background to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 md:w-28 bg-gradient-to-l from-background to-transparent"
          aria-hidden
        />

        {mounted ? (
          <div className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none hover:[animation-play-state:paused]">
            <MarqueeTrack id="a" />
            <MarqueeTrack id="b" ariaHidden />
          </div>
        ) : (
          <div className="h-5 sm:h-6" aria-hidden />
        )}
      </div>
    </section>
  );
}
export default IntegrationsMarquee;
