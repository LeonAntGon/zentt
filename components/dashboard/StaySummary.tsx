"use client";

import {
  formatMoneyARS,
  lastNightFromExclusive,
  nightsCount,
  toISODate,
} from "@/lib/pricing";
import { parseISO } from "date-fns";

type StaySummaryProps = {
  /** Exclusive checkout range as stored in DB. */
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  totalEstimado?: string | number | null;
  className?: string;
  compact?: boolean;
};

function formatDay(iso: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return parseISO(iso).toLocaleDateString("es-AR", opts);
}

export function StaySummary({
  fechaDesde,
  fechaHasta,
  totalEstimado,
  className = "",
  compact = false,
}: StaySummaryProps) {
  if (!fechaDesde || !fechaHasta) return null;

  const from = parseISO(fechaDesde);
  const toExclusive = parseISO(fechaHasta);
  const noches = nightsCount(from, toExclusive);
  if (noches < 1) return null;

  const lastNight = lastNightFromExclusive(toExclusive);
  const range = `${formatDay(fechaDesde)} – ${formatDay(toISODate(lastNight))}`;
  const estimado = Number(totalEstimado || 0);
  const nightsLabel = `${noches} ${noches === 1 ? "noche" : "noches"}`;

  if (compact) {
    return (
      <div className={`text-right ${className}`}>
        <p className="text-[11px] font-medium text-slate-500">
          {range} · {nightsLabel}
        </p>
        {estimado > 0 && (
          <p className="text-sm font-bold text-emerald-700">
            {formatMoneyARS(estimado)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 ${className}`}
    >
      <p className="text-xs font-medium text-slate-600">
        {range} · {nightsLabel}
      </p>
      {estimado > 0 && (
        <p className="mt-0.5 text-sm font-bold text-emerald-700">
          Estimado · {formatMoneyARS(estimado)}
        </p>
      )}
    </div>
  );
}
