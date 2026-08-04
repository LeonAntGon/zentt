"use client";

import React, { useEffect, useMemo, useState } from "react";
import { type DayButtonProps } from "react-day-picker";
import api from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  effectiveNightPrice,
  formatMoneyARS,
  toISODate,
  type PriceSource,
} from "@/lib/pricing";
import type { Cabana, FechaOcupada, PrecioPorFecha, PrecioEspecial } from "@/types/cabin";
import {
  eachDayOfInterval,
  endOfMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { CalendarDays, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SOURCE_LABEL: Record<PriceSource, string> = {
  base: "precio base",
  semana: "precio del día de semana",
  fecha: "precio especial de esta fecha",
};

function compactMoneyARS(value: number) {
  if (!Number.isFinite(value)) return "—";
  const formatCompact = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 1,
    }).format(amount);

  if (value >= 1_000_000) return `$${formatCompact(value / 1_000_000)}M`;
  if (value >= 1_000) return `$${formatCompact(value / 1_000)}k`;
  return `$${value}`;
}

type PriceBadgeDayButtonProps = DayButtonProps & {
  getPrice?: (date: Date) => { precio: number; source: PriceSource } | null;
};

function PriceBadgeDayButton({
  day,
  modifiers,
  getPrice,
  ...buttonProps
}: PriceBadgeDayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const priceInfo = getPrice?.(day.date);

  return (
    <button
      ref={ref}
      {...buttonProps}
      className={cn(buttonProps.className, "relative")}
    >
      <span className="relative flex h-full w-full flex-col items-center justify-center leading-none">
        <span>{buttonProps.children}</span>
        {priceInfo && priceInfo.source !== "base" && (
          <span className="mt-0.5 max-w-full truncate rounded bg-amber-400 px-1 text-[9px] font-black text-slate-900">
            {compactMoneyARS(priceInfo.precio)}
          </span>
        )}
      </span>
    </button>
  );
}

type Props = {
  /** Required in api mode. */
  slug?: string;
  /** Partial cabana data for pricing context. */
  cabana?: Pick<Cabana, "precios_especiales" | "precios_por_fecha"> | null;
  precioBase: string;
  preciosEspeciales?: PrecioEspecial[];
  mode?: "api" | "local";
  initialOverrides?: PrecioPorFecha[];
  onOverridesChange?: (overrides: PrecioPorFecha[]) => void;
  onLocalChange?: (overrides: PrecioPorFecha[]) => void;
};

export function CabinAvailabilityCalendar({
  slug,
  cabana,
  precioBase,
  preciosEspeciales,
  mode = "api",
  initialOverrides,
  onOverridesChange,
  onLocalChange,
}: Props) {
  const isLocal = mode === "local";
  const weekPrices = useMemo(
    () => preciosEspeciales ?? cabana?.precios_especiales ?? [],
    [preciosEspeciales, cabana?.precios_especiales]
  );

  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [ocupadas, setOcupadas] = useState<FechaOcupada[]>([]);
  const [overrides, setOverrides] = useState<PrecioPorFecha[]>(
    initialOverrides ?? cabana?.precios_por_fecha ?? []
  );
  const [loading, setLoading] = useState(!isLocal);
  const [selected, setSelected] = useState<Date | undefined>();
  const [priceInput, setPriceInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLocal) return;
    setOverrides(cabana?.precios_por_fecha || []);
  }, [cabana?.precios_por_fecha, isLocal]);

  useEffect(() => {
    if (isLocal) {
      setLoading(false);
      return;
    }
    if (!slug) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await api.get<FechaOcupada[]>(
          `/cabanas/${slug}/fechas_ocupadas/`
        );
        setOcupadas(res.data || []);
      } catch {
        setOcupadas([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, isLocal]);

  const occupiedSet = useMemo(() => {
    const set = new Set<string>();
    for (const r of ocupadas) {
      const start = parseISO(r.check_in);
      const end = parseISO(r.check_out);
      if (end <= start) continue;
      for (const d of eachDayOfInterval({
        start,
        end: new Date(end.getTime() - 86400000),
      })) {
        set.add(toISODate(d));
      }
    }
    return set;
  }, [ocupadas]);

  const overrideSet = useMemo(
    () => new Set(overrides.map((o) => String(o.fecha).slice(0, 10))),
    [overrides]
  );

  const ocupacionPct = useMemo(() => {
    if (isLocal) return 0;
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start, end }).length;
    let occupied = 0;
    for (const d of eachDayOfInterval({ start, end })) {
      if (occupiedSet.has(toISODate(d))) occupied += 1;
    }
    return Math.round((occupied / daysInMonth) * 100);
  }, [month, occupiedSet, isLocal]);

  const modifiers = {
    occupied: (date: Date) => occupiedSet.has(toISODate(date)),
    override: (date: Date) =>
      overrideSet.has(toISODate(date)) && !occupiedSet.has(toISODate(date)),
  };

  const modifiersClassNames = {
    occupied:
      "calendar-occupied-day !bg-red-100 !text-red-800 rounded-md font-semibold",
    override:
      "calendar-override-day !bg-emerald-100 !text-emerald-800 rounded-md font-semibold",
  };

  const effective = selected
    ? effectiveNightPrice(selected, precioBase, weekPrices, overrides)
    : null;

  const getPriceForDay = useMemo(() => {
    return (date: Date) =>
      effectiveNightPrice(date, precioBase, weekPrices, overrides);
  }, [precioBase, weekPrices, overrides]);

  const PriceDayButton = useMemo(() => {
    const Inner = (props: DayButtonProps) => (
      <PriceBadgeDayButton {...props} getPrice={getPriceForDay} />
    );
    return Inner;
  }, [getPriceForDay]);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (!date) {
      setPriceInput("");
      return;
    }
    const { precio } = effectiveNightPrice(
      date,
      precioBase,
      weekPrices,
      overrides
    );
    setPriceInput(String(precio || ""));
  };

  const hasOverride = selected && overrideSet.has(toISODate(selected));

  const applyLocalOverride = (fecha: string, precio: string) => {
    let next: PrecioPorFecha[];
    if (!precio.trim()) {
      next = overrides.filter((o) => String(o.fecha).slice(0, 10) !== fecha);
      toast.success("Precio especial quitado de esta fecha.");
    } else {
      next = [
        ...overrides.filter((o) => String(o.fecha).slice(0, 10) !== fecha),
        { fecha, precio: precio.trim() },
      ];
      toast.success("Precio de la noche listo. Se guarda al publicar.");
    }
    setOverrides(next);
    onLocalChange?.(next);
    onOverridesChange?.(next);
  };

  const handleSave = async () => {
    if (!selected) return;
    const fecha = toISODate(selected);

    if (isLocal) {
      applyLocalOverride(fecha, priceInput);
      return;
    }

    if (!slug) return;
    setSaving(true);
    try {
      const res = await api.post<{
        status: string;
        id?: number;
        fecha: string;
        precio?: string;
      }>(`/cabanas/${slug}/actualizar_precio_fecha/`, {
        fecha,
        precio: priceInput,
      });

      let next: PrecioPorFecha[];
      if (res.data.status === "override eliminado" || !priceInput) {
        next = overrides.filter((o) => String(o.fecha).slice(0, 10) !== fecha);
        toast.success("Override eliminado. Vuelve al precio base/semana.");
      } else {
        const row: PrecioPorFecha = {
          id: res.data.id,
          fecha,
          precio: res.data.precio || priceInput,
        };
        next = [
          ...overrides.filter((o) => String(o.fecha).slice(0, 10) !== fecha),
          row,
        ];
        toast.success("Precio de la noche guardado");
      }
      setOverrides(next);
      onOverridesChange?.(next);
    } catch {
      toast.error("No se pudo guardar el precio");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selected) return;
    const fecha = toISODate(selected);

    if (isLocal) {
      applyLocalOverride(fecha, "");
      const { precio } = effectiveNightPrice(
        selected,
        precioBase,
        weekPrices,
        overrides.filter((o) => String(o.fecha).slice(0, 10) !== fecha)
      );
      setPriceInput(String(precio || ""));
      return;
    }

    if (!slug) return;
    setSaving(true);
    try {
      await api.post(`/cabanas/${slug}/actualizar_precio_fecha/`, {
        fecha,
        precio: "",
      });
      const next = overrides.filter(
        (o) => String(o.fecha).slice(0, 10) !== fecha
      );
      setOverrides(next);
      onOverridesChange?.(next);
      const { precio } = effectiveNightPrice(
        selected,
        precioBase,
        weekPrices,
        next
      );
      setPriceInput(String(precio || ""));
      toast.success("Override eliminado");
    } catch {
      toast.error("No se pudo quitar el override");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 font-black text-slate-900">
          <CalendarDays size={20} className="text-primary" />
          {isLocal ? "Precio por fecha" : "Disponibilidad y precios"}
        </h3>
        {!isLocal && (
          <p className="text-xs font-medium text-slate-500">
            Ocupación del mes:{" "}
            <span className="font-bold text-slate-800">{ocupacionPct}%</span>
          </p>
        )}
        {isLocal && (
          <p className="text-xs font-medium text-slate-500">
            Elegí un día y fijá un precio especial (opcional)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={handleSelect}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            components={{ DayButton: PriceDayButton }}
          />
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
            {!isLocal && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-200" />{" "}
                Ocupado
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" />{" "}
              Precio especial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-400" /> Tarifa distinta
              al base
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Noche seleccionada
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {selected.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              {!isLocal && occupiedSet.has(toISODate(selected)) && (
                <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
                  Día ocupado por una reserva. Podés igual fijar tarifa para
                  futuras consultas.
                </p>
              )}

              {effective && (
                <p className="mt-3 text-xs text-slate-500">
                  Precio actual:{" "}
                  <span className="font-bold text-slate-800">
                    {formatMoneyARS(effective.precio)}
                  </span>{" "}
                  · {SOURCE_LABEL[effective.source]}
                </p>
              )}

              <label className="mt-4 block text-xs font-semibold text-slate-700">
                Precio para esta noche
              </label>
              <input
                type="number"
                min={0}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={precioBase}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {isLocal
                  ? "Se guarda al publicar el alojamiento."
                  : "Se prellena con el precio vigente. Guardar crea un override de fecha."}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={saving || !priceInput}
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {isLocal ? "Agregar precio" : "Guardar precio"}
                </button>
                {hasOverride && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                  >
                    <Trash2 size={14} /> Quitar precio especial
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400">
              Elegí un día en el calendario para ver u asignar el precio de esa
              noche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
