"use client";

import { useEffect, useState } from "react";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";

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

const Calendly = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#006BFF"
      d="M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z"
    />
  </svg>
);

const WhatsApp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#25D366"
      d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"
    />
  </svg>
);

const Airbnb = () => <AirbnbIcon className="text-[#FF385C]" title="" />;

const Excel = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
    <path fill="#217346" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
    <path fill="#185C37" d="M14 2v6h6l-6-6Z" />
    <path
      fill="#fff"
      d="M8.5 13 10 15.5 8.5 18H10l.75-1.5L11.5 18h1.5l-1.5-2.5L13 13h-1.5l-.75 1.5L10 13H8.5Z"
    />
  </svg>
);

const PDF = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
    <path fill="#E5252A" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
    <path fill="#B71C1C" d="M14 2v6h6l-6-6Z" />
    <path
      fill="#fff"
      d="M8 13h1.5a1.5 1.5 0 0 1 0 3H9v2H8v-5Zm1 2.5h.5a.5.5 0 0 0 0-1H9v1Zm3-2.5h1.5a2 2 0 0 1 0 4H13v1h-1v-5Zm1 3h.5a1 1 0 0 0 0-2H13v2Zm3-3h2v1h-1v1h1v1h-1v2h-1v-5Z"
    />
  </svg>
);

const INTEGRATIONS = [
  { label: "Google Calendar", Icon: GCal },
  { label: "Calendly", Icon: Calendly },
  { label: "WhatsApp", Icon: WhatsApp },
  { label: "Airbnb", Icon: Airbnb },
  { label: "Microsoft Excel", Icon: Excel },
  { label: "PDF", Icon: PDF },
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
