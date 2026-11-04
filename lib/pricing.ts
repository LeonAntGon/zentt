import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";
import type {
  PrecioEspecial,
  PrecioPorFecha,
  TarifaOcupacion,
} from "@/types/cabin";

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

export function serializeTarifaOcupacion(tarifa: TarifaOcupacion) {
  return {
    personas_min: tarifa.personas_min,
    personas_max: tarifa.personas_max,
    precio_noche_semana: tarifa.precio_noche_semana ?? null,
    precio_noche_finde: tarifa.precio_noche_finde ?? null,
    precio_paquete_2_noches: tarifa.precio_paquete_2_noches ?? null,
    precio_paquete_2_noches_finde:
      tarifa.precio_paquete_2_noches_finde ?? null,
    orden: tarifa.orden ?? 0,
    activo: tarifa.activo ?? true,
  };
}

const WEEKEND_JS_DAYS = new Set([5, 6]); // Friday, Saturday

export function resolveTarifaForGuests(
  tarifas: TarifaOcupacion[] | undefined,
  guests: number
): TarifaOcupacion | null {
  if (!tarifas?.length) return null;
  const activas = tarifas
    .filter((tarifa) => tarifa.activo !== false)
    .slice()
    .sort((a, b) => a.personas_min - b.personas_min);
  if (activas.length === 0) return null;

  const total = Math.max(1, guests);
  const exact = activas.find(
    (tarifa) =>
      tarifa.personas_min <= total && total <= tarifa.personas_max
  );
  if (exact) return exact;

  if (total > Math.max(...activas.map((t) => t.personas_max))) {
    return activas[activas.length - 1];
  }
  return activas[0];
}

function numberOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Misma lógica que `reservas.pricing.calcular_total` del backend.
 * Las noches de fin de semana son viernes y sábado.
 */
export function estimateStayTotalForGuests({
  cabana,
  from,
  lastNight,
  guests,
}: {
  cabana: {
    precio: string | number;
    precios_especiales?: PrecioEspecial[];
    precios_por_fecha?: PrecioPorFecha[];
    tarifas_ocupacion?: TarifaOcupacion[];
  };
  from: Date;
  lastNight: Date;
  guests: number;
}): number {
  if (!from || !lastNight || lastNight < from) return 0;

  const nights = eachDayOfInterval({ start: from, end: lastNight });
  const dateOverrides = new Map(
    (cabana.precios_por_fecha || []).map((item) => [
      String(item.fecha).slice(0, 10),
      Number(item.precio),
    ])
  );
  const weekdayOverrides = new Map(
    (cabana.precios_especiales || []).map((item) => [
      item.dia_semana,
      Number(item.precio),
    ])
  );
  const tarifa = resolveTarifaForGuests(cabana.tarifas_ocupacion, guests);
  const hasDateOverride = nights.some((night) =>
    dateOverrides.has(toISODate(night))
  );

  if (nights.length === 2 && !hasDateOverride && tarifa) {
    const allWeekday = nights.every((night) => !WEEKEND_JS_DAYS.has(night.getDay()));
    const allWeekend = nights.every((night) => WEEKEND_JS_DAYS.has(night.getDay()));
    const weekdayPromo = numberOrNull(tarifa.precio_paquete_2_noches);
    const weekendPromo = numberOrNull(tarifa.precio_paquete_2_noches_finde);
    if (allWeekday && weekdayPromo !== null) return weekdayPromo;
    if (allWeekend && weekendPromo !== null) return weekendPromo;
  }

  return nights.reduce((total, night) => {
    const iso = toISODate(night);
    if (dateOverrides.has(iso)) {
      return total + (dateOverrides.get(iso) || 0);
    }
    if (tarifa) {
      const isWeekend = WEEKEND_JS_DAYS.has(night.getDay());
      const nightly =
        (isWeekend
          ? numberOrNull(tarifa.precio_noche_finde)
          : numberOrNull(tarifa.precio_noche_semana)) ??
        (isWeekend
          ? numberOrNull(tarifa.precio_noche_semana)
          : numberOrNull(tarifa.precio_noche_finde));
      if (nightly !== null) return total + nightly;
    }
    const weekday = night.getDay() === 0 ? 6 : night.getDay() - 1;
    const legacy = weekdayOverrides.get(weekday);
    if (legacy !== undefined) return total + legacy;
    return total + (Number(cabana.precio) || 0);
  }, 0);
}
