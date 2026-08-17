"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatCurrencyCompact } from "@/lib/planLimits";
import {
  lastNightFromExclusive,
  nightsCount,
  toISODate,
} from "@/lib/pricing";
import { normalizeOrigen } from "@/components/dashboard/MessageChannelBadge";

type InquiryPreviewCardProps = {
  name?: string | null;
  origen?: string | null;
  leido: boolean;
  propertyLabel: string;
  preview?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  totalEstimado?: string | number | null;
  fechaEnvio: string;
  whatsappHref?: string | null;
};

const CHANNEL_LABEL: Record<string, string> = {
  WEB: "WEB",
  WA: "WHATSAPP",
  AIRBNB: "AIRBNB",
};

function twoInitials(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  const single = parts[0] || "?";
  return single.slice(0, 2).toUpperCase();
}

function formatShortDate(value: string) {
  return format(parseISO(value), "d MMM", { locale: es }).replace(".", "");
}

function stayMeta(fechaDesde?: string | null, fechaHasta?: string | null) {
  if (!fechaDesde || !fechaHasta) return null;
  const from = parseISO(fechaDesde);
  const toExclusive = parseISO(fechaHasta);
  const noches = nightsCount(from, toExclusive);
  if (noches < 1) return null;
  const lastNight = lastNightFromExclusive(toExclusive);
  const range = `${formatShortDate(fechaDesde)} – ${formatShortDate(toISODate(lastNight))}`;
  return `${range} · ${noches} ${noches === 1 ? "noche" : "noches"}`;
}

function relativeShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

export function InquiryPreviewCard({
  name,
  origen,
  leido,
  propertyLabel,
  preview,
  fechaDesde,
  fechaHasta,
  totalEstimado,
  fechaEnvio,
  whatsappHref,
}: InquiryPreviewCardProps) {
  const channel = CHANNEL_LABEL[normalizeOrigen(origen)] || "WEB";
  const stay = stayMeta(fechaDesde, fechaHasta);
  const estimado = Number(totalEstimado || 0);
  const meta = [propertyLabel, stay].filter(Boolean).join(" · ");

  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              leido
                ? "bg-primary/15 text-primary"
                : "bg-primary text-primary-foreground"
            }`}
            aria-hidden
          >
            {twoInitials(name)}
          </div>
          <p className="truncate text-sm font-bold text-slate-900">
            {name || "Huésped"}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {channel}
        </span>
      </div>

      <p className="mt-2 truncate text-xs text-slate-500">{meta}</p>

      {preview ? (
        <p className="mt-1 truncate text-sm text-slate-600">{preview}</p>
      ) : null}

      <div className="mt-3 flex items-end justify-between gap-3">
        {estimado > 0 ? (
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrencyCompact(estimado)}
          </p>
        ) : (
          <span />
        )}
        <p className="text-[11px] text-slate-400">{relativeShort(fechaEnvio)}</p>
      </div>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp text-sm font-bold text-whatsapp-foreground transition-colors hover:bg-whatsapp/90"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Responder por WhatsApp
        </a>
      ) : (
        <Link
          href="/dashboard/buzon"
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Abrir en buzón
        </Link>
      )}
    </article>
  );
}
