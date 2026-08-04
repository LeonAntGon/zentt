import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";
import { Globe } from "lucide-react";

export type MessageOrigen = "WEB" | "WA" | "AIRBNB";

export function normalizeOrigen(value?: string | null): MessageOrigen {
  if (value === "WA" || value === "AIRBNB" || value === "WEB") return value;
  return "WEB";
}

/** Badge / icono de canal: WEB (texto), WhatsApp o Airbnb. */
export function MessageChannelBadge({
  origen,
  variant = "icon",
}: {
  origen?: string | null;
  variant?: "icon" | "pill";
}) {
  const channel = normalizeOrigen(origen);

  if (variant === "pill") {
    if (channel === "WA") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#25D366]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#128C4B]">
          <WhatsAppIcon className="h-3 w-3" title="WhatsApp" /> WhatsApp
        </span>
      );
    }

    if (channel === "AIRBNB") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FF385C]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D92D4B]">
          <AirbnbIcon className="h-3 w-3" title="Airbnb" /> Airbnb
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
        <Globe size={11} /> Web
      </span>
    );
  }

  if (channel === "WA") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center"
        title="WhatsApp"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
      </span>
    );
  }

  if (channel === "AIRBNB") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center"
        title="Airbnb"
        aria-label="Airbnb"
      >
        <AirbnbIcon className="h-4 w-4 text-[#FF385C]" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      WEB
    </span>
  );
}

/** Pelotita con inicial: azul oscuro si no leído, azul claro si leído. */
export function MessageInitialAvatar({
  name,
  leido,
  size = "md",
}: {
  name?: string | null;
  leido: boolean;
  size?: "sm" | "md";
}) {
  const initial = (name?.trim().charAt(0) || "?").toUpperCase();
  const sizeClass =
    size === "sm" ? "h-9 w-9 text-sm" : "h-11 w-11 text-base";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold uppercase ${sizeClass} ${
        leido
          ? "bg-primary/15 text-primary"
          : "bg-primary text-primary-foreground"
      }`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
