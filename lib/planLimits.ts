export type PlanId = "gratis" | "pro" | "complejo";

export const PLAN_LIMITS: Record<
  PlanId,
  { maxCabanas: number; priceArs: number; label: string }
> = {
  gratis: { maxCabanas: 1, priceArs: 0, label: "Gratis" },
  // TEST prod: 10 ARS — restaurar 9900 / 19900 antes de lanzar
  pro: { maxCabanas: 5, priceArs: 10, label: "Pro" },
  complejo: { maxCabanas: 15, priceArs: 10, label: "Complejo" },
};

export function normalizePlan(plan?: string | null): PlanId {
  if (plan === "pro" || plan === "complejo") return plan;
  return "gratis";
}

export function getMaxCabanas(plan?: string | null): number {
  return PLAN_LIMITS[normalizePlan(plan)].maxCabanas;
}

export function canCreateCabana(plan: string | null | undefined, count: number) {
  return count < getMaxCabanas(plan);
}

/** Periodo mostrado junto al precio de planes pagos (UI). */
export const PLAN_PRICE_PERIOD = "/ mes";

/**
 * Precio de plan para CTAs y pricing: "$9.900 ARS".
 * No usar para ingresos del dashboard (usar formatCurrencyCompact).
 */
export function formatPlanPrice(ars: number): string {
  if (!Number.isFinite(ars) || ars === 0) return "$0 ARS";
  const abs = Math.abs(ars);
  const amount = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(abs);
  const label = `$${amount} ARS`;
  return ars < 0 ? `-${label}` : label;
}

export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "$0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const compact =
      millions >= 10
        ? millions.toFixed(0)
        : millions.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${compact}M`;
  }

  if (abs >= 100_000) {
    const thousands = abs / 1_000;
    const compact =
      thousands >= 100
        ? thousands.toFixed(0)
        : thousands.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${compact}k`;
  }

  return `${sign}${new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(abs)}`;
}
