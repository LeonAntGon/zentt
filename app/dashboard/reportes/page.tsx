"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Cabana, Mensaje, Reserva } from "@/types/cabin";
import { formatMoneyARS, nightsCount } from "@/lib/pricing";
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
  getDaysInMonth,
  getDate,
} from "date-fns";
import {
  BarChart3,
  Download,
  DollarSign,
  Moon,
  Percent,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton, SkeletonKpi } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "sept",
  "oct",
  "nov",
  "dic",
] as const;

function monthInputValue(d: Date) {
  return format(d, "yyyy-MM");
}

function MonthYearDropdown({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setViewYear(value.getFullYear());
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedMonth = value.getMonth();
  const selectedYear = value.getFullYear();
  const triggerLabel = `${MONTH_LABELS[selectedMonth]} ${selectedYear}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold normal-case text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 sm:min-w-[168px]"
      >
        <CalendarDays size={15} className="shrink-0 text-slate-400" />
        <span className="flex-1 text-left normal-case">{triggerLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
          <div className="mb-3 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              aria-label="Año anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold normal-case text-slate-900">
              {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              aria-label="Año siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS.map((label, index) => {
              const active =
                index === selectedMonth && viewYear === selectedYear;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(startOfMonth(new Date(viewYear, index, 1)));
                    setOpen(false);
                  }}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold normal-case transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function overlapsMonth(checkIn: string, checkOut: string, month: Date) {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const monthStart = startOfMonth(month);
  const monthEndExclusive = new Date(endOfMonth(month));
  monthEndExclusive.setDate(monthEndExclusive.getDate() + 1);
  return start < monthEndExclusive && end > monthStart;
}

function nightsInMonth(checkIn: string, checkOut: string, month: Date) {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const monthStart = startOfMonth(month);
  const monthEndExclusive = new Date(endOfMonth(month));
  monthEndExclusive.setDate(monthEndExclusive.getDate() + 1);
  const overlapStart = start > monthStart ? start : monthStart;
  const overlapEnd = end < monthEndExclusive ? end : monthEndExclusive;
  return Math.max(0, nightsCount(overlapStart, overlapEnd));
}

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => {
    if (/[",\n;]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
    return cell;
  };
  const content = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function incomeForMonth(
  reservas: Reserva[],
  month: Date,
  cabanaId: number | "all"
) {
  return reservas.reduce((sum, r) => {
    if (r.estado !== "confirmada") return sum;
    if (cabanaId !== "all" && r.cabana !== cabanaId) return sum;
    if (!overlapsMonth(r.check_in, r.check_out, month)) return sum;
    return sum + Number(r.total_reserva || 0);
  }, 0);
}

const CHART_BLUE = "hsl(209 68% 28%)";

function IncomeAreaChart({
  data,
}: {
  data: { label: string; day: number; value: number }[];
}) {
  const days = data.length;
  // Show ~6–8 ticks so the axis stays readable
  const tickInterval = days <= 14 ? 1 : days <= 21 ? 2 : 4;

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="ingresosGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_BLUE} stopOpacity={0.35} />
              <stop offset="85%" stopColor={CHART_BLUE} stopOpacity={0.04} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
            }
          />
          <Tooltip
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
              fontSize: 12,
            }}
            labelFormatter={(label) => `Día ${label}`}
            formatter={(value) => [
              formatMoneyARS(Number(value ?? 0)),
              "Ingresos",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_BLUE}
            strokeWidth={2.5}
            fill="url(#ingresosGradient)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ReportesPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [cabanaId, setCabanaId] = useState<number | "all">("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [resCabanas, resReservas, resMensajes] = await Promise.all([
          api.get<Cabana[]>("/cabanas/"),
          api.get<Reserva[]>("/booking/gestion-reservas/").catch(() => ({
            data: [] as Reserva[],
          })),
          api.get<Mensaje[]>("/mensajes/").catch(() => ({
            data: [] as Mensaje[],
          })),
        ]);
        setCabanas(resCabanas.data || []);
        setReservas(resReservas.data || []);
        setMensajes(resMensajes.data || []);
        if ((resCabanas.data || []).length === 1) {
          setCabanaId(resCabanas.data[0].id);
        }
      } catch {
        toast.error("No pudimos cargar los reportes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredReservas = useMemo(() => {
    return reservas.filter((r) => {
      if (cabanaId !== "all" && r.cabana !== cabanaId) return false;
      return overlapsMonth(r.check_in, r.check_out, month);
    });
  }, [reservas, cabanaId, month]);

  const confirmadas = useMemo(
    () => filteredReservas.filter((r) => r.estado === "confirmada"),
    [filteredReservas]
  );

  const prevMonth = useMemo(() => subMonths(month, 1), [month]);

  const stats = useMemo(() => {
    const ingresos = confirmadas.reduce(
      (sum, r) => sum + Number(r.total_reserva || 0),
      0
    );
    const noches = confirmadas.reduce(
      (sum, r) => sum + nightsInMonth(r.check_in, r.check_out, month),
      0
    );
    const cabanasCount =
      cabanaId === "all" ? Math.max(1, cabanas.length) : 1;
    const daysInMonth = endOfMonth(month).getDate();
    const capacity = daysInMonth * cabanasCount;
    const ocupacionPct =
      capacity > 0 ? Math.min(100, Math.round((noches / capacity) * 100)) : 0;

    const consultas = mensajes.filter((m) => {
      if (cabanaId !== "all" && m.cabana !== cabanaId) return false;
      if (!m.fecha_desde || !m.fecha_hasta) {
        const sent = parseISO(m.fecha_envio.slice(0, 10));
        return (
          sent.getFullYear() === month.getFullYear() &&
          sent.getMonth() === month.getMonth()
        );
      }
      return overlapsMonth(m.fecha_desde, m.fecha_hasta, month);
    }).length;

    const prevIngresos = incomeForMonth(reservas, prevMonth, cabanaId);
    let growthPct: number | null = null;
    if (prevIngresos > 0) {
      growthPct = Math.round(
        ((ingresos - prevIngresos) / prevIngresos) * 100
      );
    } else if (ingresos > 0) {
      growthPct = 100;
    }

    return {
      ingresos,
      noches,
      ocupacionPct,
      consultas,
      growthPct,
    };
  }, [
    confirmadas,
    cabanas.length,
    cabanaId,
    month,
    mensajes,
    reservas,
    prevMonth,
  ]);

  const dailyChart = useMemo(() => {
    const daysInMonth = getDaysInMonth(month);
    const byDay = new Map<number, number>();

    for (const r of confirmadas) {
      const checkIn = parseISO(r.check_in);
      if (
        checkIn.getFullYear() !== month.getFullYear() ||
        checkIn.getMonth() !== month.getMonth()
      ) {
        continue;
      }
      const day = getDate(checkIn);
      byDay.set(day, (byDay.get(day) || 0) + Number(r.total_reserva || 0));
    }

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        label: String(day),
        value: byDay.get(day) || 0,
      };
    });
  }, [month, confirmadas]);

  const byProperty = useMemo(() => {
    const map = new Map<
      number,
      { nombre: string; noches: number; total: number }
    >();

    for (const c of cabanas) {
      if (cabanaId !== "all" && c.id !== cabanaId) continue;
      map.set(c.id, { nombre: c.nombre, noches: 0, total: 0 });
    }

    for (const r of confirmadas) {
      const row = map.get(r.cabana);
      if (!row) {
        map.set(r.cabana, {
          nombre: r.cabana_nombre || `Alojamiento #${r.cabana}`,
          noches: nightsInMonth(r.check_in, r.check_out, month),
          total: Number(r.total_reserva || 0),
        });
        continue;
      }
      row.noches += nightsInMonth(r.check_in, r.check_out, month);
      row.total += Number(r.total_reserva || 0);
    }

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [cabanas, confirmadas, cabanaId, month]);

  const recentConfirmed = useMemo(() => {
    return [...confirmadas]
      .sort(
        (a, b) =>
          parseISO(b.check_in).getTime() - parseISO(a.check_in).getTime()
      )
      .slice(0, 8);
  }, [confirmadas]);

  const exportRows = useMemo(() => {
    return [...filteredReservas].sort(
      (a, b) =>
        parseISO(a.check_in).getTime() - parseISO(b.check_in).getTime()
    );
  }, [filteredReservas]);

  const handleExport = () => {
    const header = [
      "ID",
      "Huésped",
      "Alojamiento",
      "Entrada",
      "Salida",
      "Noches",
      "Total",
      "Estado",
    ];
    const rows = exportRows.map((r) => [
      String(r.id),
      r.nombre_turista || "",
      r.cabana_nombre || "",
      r.check_in,
      r.check_out,
      String(nightsCount(parseISO(r.check_in), parseISO(r.check_out))),
      String(r.total_reserva ?? ""),
      r.estado,
    ]);
    downloadCsv(`reportes-${monthInputValue(month)}.csv`, [header, ...rows]);
    toast.success("CSV descargado");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <div>
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const GrowthIcon =
    stats.growthPct === null
      ? Minus
      : stats.growthPct >= 0
        ? TrendingUp
        : TrendingDown;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <BarChart3 size={14} /> Reportes
            </p>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Panel financiero
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exportRows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white hover:shadow-sm disabled:opacity-50"
            >
              <Download size={14} />
              Descargar CSV
            </button>
          </div>
        </header>

        {/* KPI cards — alta densidad horizontal */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-row items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <DollarSign size={14} className="shrink-0" />
                Ingresos
              </span>
              <div className="text-right">
                <p className="font-heading text-2xl font-bold tracking-tight text-emerald-600">
                  {formatMoneyARS(stats.ingresos)}
                </p>
                {stats.growthPct !== null && (
                  <span
                    className={`mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      stats.growthPct >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <GrowthIcon size={10} />
                    {stats.growthPct >= 0 ? "+" : ""}
                    {stats.growthPct}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-row items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Moon size={14} className="shrink-0" />
                Noches
              </span>
              <p className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                {stats.noches}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-row items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Percent size={14} className="shrink-0" />
                Ocupación
              </span>
              <p className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                {stats.ocupacionPct}%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-row items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <MessageSquare size={14} className="shrink-0" />
                Consultas
              </span>
              <p className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                {stats.consultas}
              </p>
            </div>
          </div>
        </div>

        {/* Income chart */}
        <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Evolución de ingresos
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Por día del mes (según check-in de reservas confirmadas)
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-[180px]">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                  <Home size={15} />
                </span>
                <select
                  value={cabanaId === "all" ? "all" : String(cabanaId)}
                  onChange={(e) =>
                    setCabanaId(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  aria-label="Alojamiento"
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 hover:bg-white focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                >
                  <option value="all">Todos los alojamientos</option>
                  {cabanas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="min-w-0 flex-1 sm:min-w-[180px]">
                <MonthYearDropdown value={month} onChange={setMonth} />
              </div>
            </div>
          </div>
          {dailyChart.every((d) => d.value === 0) ? (
            <div className="flex h-56 items-center justify-center text-sm text-slate-400 sm:h-64">
              Sin ingresos confirmados en este período
            </div>
          ) : (
            <IncomeAreaChart data={dailyChart} />
          )}
        </div>

        {/* Bottom: property performance + recent income */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Rendimiento por alojamiento
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Noches y total generado en el mes
              </p>
            </div>
            {byProperty.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">
                Sin datos de alojamientos
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Alojamiento</th>
                      <th className="px-5 py-3 font-semibold">Noches</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {byProperty.map((row) => (
                      <tr
                        key={row.nombre}
                        className="border-t border-slate-50 text-slate-700"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {row.nombre}
                        </td>
                        <td className="px-5 py-3.5 text-slate-900">
                          {row.noches}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                          {formatMoneyARS(row.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Últimos Ingresos
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Reservas confirmadas recientes
              </p>
            </div>
            {recentConfirmed.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">
                No hay reservas confirmadas en este filtro
              </p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {recentConfirmed.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {r.nombre_turista}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {r.check_in}
                        {r.cabana_nombre ? ` · ${r.cabana_nombre}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-emerald-600">
                      {formatMoneyARS(Number(r.total_reserva || 0))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
