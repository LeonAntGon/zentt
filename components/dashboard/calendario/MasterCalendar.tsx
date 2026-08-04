"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { formatMoneyARS, toISODate } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Percent,
  DollarSign,
  Moon,
} from "lucide-react";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";

export type MonthSummary = {
  occupancyPct: number;
  projectedIncome: number;
  freeNights: number;
};

type MasterCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDay: Date | undefined;
  onSelectDay: (day: Date | undefined) => void;
  confirmedDates: Set<string>;
  pendingDates: Set<string>;
  blockedDates: Set<string>;
  aggregateView?: boolean;
  monthSummary: MonthSummary;
  showSyncIcal?: boolean;
  syncingIcal?: boolean;
  onSyncIcal?: () => void;
};

function useDualMonth() {
  const [dual, setDual] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setDual(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return dual;
}

export function MasterCalendar({
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  confirmedDates,
  pendingDates,
  blockedDates,
  aggregateView = false,
  monthSummary,
  showSyncIcal = false,
  syncingIcal = false,
  onSyncIcal,
}: MasterCalendarProps) {
  const dualMonth = useDualMonth();

  const modifiers = {
    confirmed: (date: Date) => confirmedDates.has(toISODate(date)),
    pending: (date: Date) =>
      pendingDates.has(toISODate(date)) &&
      !confirmedDates.has(toISODate(date)),
    blocked: (date: Date) =>
      blockedDates.has(toISODate(date)) &&
      !confirmedDates.has(toISODate(date)) &&
      !pendingDates.has(toISODate(date)),
  };

  const modifiersClassNames = {
    confirmed:
      "!bg-emerald-100 !text-emerald-900 font-semibold rounded-lg hover:!bg-emerald-200",
    pending:
      "!bg-amber-100 !text-amber-900 font-semibold rounded-lg hover:!bg-amber-200",
    blocked:
      "bg-[repeating-linear-gradient(-45deg,#f1f5f9,#f1f5f9_3px,#e2e8f0_3px,#e2e8f0_6px)] !text-slate-500 rounded-lg",
  };

  const monthLabel = month.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const metrics = [
    {
      label: "Ocupación",
      value: `${monthSummary.occupancyPct}%`,
      icon: Percent,
      hint: "Noches confirmadas / capacidad",
    },
    {
      label: "Ingresos proyectados",
      value: formatMoneyARS(monthSummary.projectedIncome),
      icon: DollarSign,
      hint: "Confirmadas + pendientes",
    },
    {
      label: "Noches libres",
      value: String(monthSummary.freeNights),
      icon: Moon,
      hint: "Sin confirmada ni bloqueo",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-heading text-sm font-bold text-slate-900">
            Calendario maestro
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {aggregateView
              ? "Seleccioná un alojamiento para ver sus fechas exactas"
              : "Seleccioná un día para ver la actividad"}
            {dualMonth ? " · Vista dual" : ""}
          </p>
        </div>
        {showSyncIcal && onSyncIcal && (
          <button
            type="button"
            disabled={syncingIcal}
            onClick={onSyncIcal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
          >
            {syncingIcal ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <AirbnbIcon className="h-3.5 w-3.5 text-[#FF385C]" />
            )}
            Sync iCal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Calendar */}
        <div className="p-4 sm:p-5 lg:col-span-8 lg:p-6">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={onMonthChange}
            numberOfMonths={dualMonth ? 2 : 1}
            selected={selectedDay}
            onSelect={onSelectDay}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className={cn(
              "w-full",
              dualMonth
                ? "[--rdp-cell-size:2.4rem] xl:[--rdp-cell-size:2.65rem]"
                : "[--rdp-cell-size:2.85rem] sm:[--rdp-cell-size:3.15rem]",
              "[&_.rdp-months]:flex [&_.rdp-months]:flex-col [&_.rdp-months]:gap-6 xl:[&_.rdp-months]:flex-row xl:[&_.rdp-months]:gap-8",
              "[&_.rdp-month]:flex-1",
              "[&_.rdp-weekday]:text-center [&_.rdp-weekday]:text-[10px] [&_.rdp-weekday]:font-semibold [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-wider [&_.rdp-weekday]:text-slate-400",
              "[&_.rdp-day]:text-center",
              "[&_.rdp-day_button]:mx-auto [&_.rdp-day_button]:flex [&_.rdp-day_button]:cursor-pointer [&_.rdp-day_button]:items-center [&_.rdp-day_button]:justify-center [&_.rdp-day_button]:rounded-lg [&_.rdp-day_button]:transition-colors",
              "[&_.rdp-day_button:hover]:bg-slate-100",
              "[&_.rdp-selected_.rdp-day_button]:ring-2 [&_.rdp-selected_.rdp-day_button]:ring-slate-900 [&_.rdp-selected_.rdp-day_button]:ring-offset-1"
            )}
          />

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" />
            Confirmada
          </span>
          {!aggregateView && (
            <>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-100 ring-1 ring-amber-200" />
            Pendiente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[repeating-linear-gradient(-45deg,#f1f5f9,#f1f5f9_2px,#e2e8f0_2px,#e2e8f0_4px)] ring-1 ring-slate-200" />
            Bloqueada / iCal
          </span>
            </>
          )}
          </div>
        </div>

        {/* Month summary */}
        <aside className="border-t border-slate-100 bg-slate-50/80 p-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-6">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500">
            Resumen de{" "}
            <span className="text-slate-800 capitalize">{monthLabel}</span>
          </h3>

          <ul className="mt-5 space-y-4">
            {metrics.map((m) => (
              <li
                key={m.label}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <m.icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {m.label}
                    </p>
                    <p className="mt-0.5 font-heading text-xl font-bold tracking-tight text-slate-900">
                      {m.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{m.hint}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
