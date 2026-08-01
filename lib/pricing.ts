import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";
import type { PrecioEspecial, PrecioPorFecha } from "@/types/cabin";

function djangoWeekday(date: Date): number {
  // JS getDay(): 0=Sun … 6=Sat; Django weekday: 0=Mon … 6=Sun
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function formatMoneyARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Nights for exclusive checkout [from, to). */
export function nightsCount(from: Date, to: Date) {
  return Math.max(0, differenceInCalendarDays(to, from));
}

/** Nights when UI range is inclusive (selected days 1–3 = 3 nights). */
export function nightsCountInclusive(from: Date, to: Date) {
  return Math.max(0, differenceInCalendarDays(to, from) + 1);
}

/** Last night of stay → exclusive checkout date (ISO). */
export function toExclusiveCheckout(lastNight: Date) {
  return toISODate(addDays(lastNight, 1));
}

/** Exclusive checkout → last night date. */
export function lastNightFromExclusive(checkOut: Date) {
  return subDays(checkOut, 1);
}

export type PriceSource = "fecha" | "semana" | "base";

/** Effective price for one night + which layer won. */
export function effectiveNightPrice(
  date: Date,
  precioBase: string | number,
  preciosEspeciales: PrecioEspecial[] | undefined,
  preciosPorFecha: PrecioPorFecha[] | undefined
): { precio: number; source: PriceSource } {
  const iso = toISODate(date);
  const dateMap = new Map(
    (preciosPorFecha || []).map((p) => [
      String(p.fecha).slice(0, 10),
      Number(p.precio),
    ])
  );
  if (dateMap.has(iso)) {
    return { precio: dateMap.get(iso)!, source: "fecha" };
  }

  const weekdayMap = new Map(
    (preciosEspeciales || []).map((p) => [p.dia_semana, Number(p.precio)])
  );
  const wd = djangoWeekday(date);
  if (weekdayMap.has(wd)) {
    return { precio: weekdayMap.get(wd)!, source: "semana" };
  }

  return { precio: Number(precioBase) || 0, source: "base" };
}

/**
 * Estimate total for nights [from, toExclusive).
 * Priority: date override → weekday special → base.
 */
export function estimateStayTotal(
  precioBase: string | number,
  preciosEspeciales: PrecioEspecial[] | undefined,
  from: Date,
  toExclusive: Date,
  preciosPorFecha?: PrecioPorFecha[] | undefined
): number {
  if (!from || !toExclusive || toExclusive <= from) return 0;

  const nights = eachDayOfInterval({
    start: from,
    end: subDays(toExclusive, 1),
  });

  return nights.reduce((sum, day) => {
    return (
      sum +
      effectiveNightPrice(day, precioBase, preciosEspeciales, preciosPorFecha)
        .precio
    );
  }, 0);
}

/** Estimate when picker range is inclusive (last selected day = last night). */
export function estimateStayTotalInclusive(
  precioBase: string | number,
  preciosEspeciales: PrecioEspecial[] | undefined,
  from: Date,
  lastNight: Date,
  preciosPorFecha?: PrecioPorFecha[] | undefined
): number {
  return estimateStayTotal(
    precioBase,
    preciosEspeciales,
    from,
    addDays(lastNight, 1),
    preciosPorFecha
  );
}
