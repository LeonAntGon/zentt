"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  ChevronDown,
  Eye,
  Globe,
  Home,
  Loader2,
  RefreshCw,
  CircleHelp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Cabana } from "@/types/cabin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Granularity = "day" | "month" | "year";

type AnalyticsPoint = {
  period: string;
  sessions: number;
  active_users: number;
  page_views: number;
};

type AnalyticsCabana = {
  id: number;
  nombre: string;
  slug: string;
  sessions: number;
  active_users: number;
  page_views: number;
};

type AnalyticsReport = {
  status: "connected";
  summary: {
    sessions: number;
    active_users: number;
    page_views: number;
  };
  series: AnalyticsPoint[];
  by_cabana: AnalyticsCabana[];
  range: {
    from: string;
    to: string;
    granularity: Granularity;
  };
  updated_at: string;
};

type SeriesKey = "sessions" | "active_users";

const numberFormatter = new Intl.NumberFormat("es-AR");

function formatNumber(value: number | undefined) {
  return value === undefined ? "—" : numberFormatter.format(value);
}

function parsePeriodParts(period: string): number[] | null {
  const parts = period.split("-").map(Number);
  return parts.every((part) => Number.isFinite(part)) ? parts : null;
}

/** Eje X: días con su número, meses abreviados, años con su número. */
function formatAxisLabel(period: string, granularity: Granularity) {
  if (granularity === "year") return period;
  const parts = parsePeriodParts(period);
  if (!parts) return period;
  const [year, month, day] = parts;
  if (granularity === "day") {
    if (!year || !month || !day) return period;
    return String(day);
  }
  if (!year || !month) return period;
  return new Intl.DateTimeFormat("es-AR", { month: "short" }).format(
    new Date(year, month - 1, 1)
  );
}

/** Tooltip: fecha completa para dar contexto al punto del gráfico. */
function formatTooltipLabel(period: string, granularity: Granularity) {
  if (granularity === "year") return `Año ${period}`;
  const parts = parsePeriodParts(period);
  if (!parts) return period;
  const [year, month, day] = parts;
  if (granularity === "day") {
    if (!year || !month || !day) return period;
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }
  if (!year || !month) return period;
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function getDateRange(granularity: Granularity) {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const start = new Date(today);

  if (granularity === "day") {
    start.setDate(start.getDate() - 29);
  } else if (granularity === "month") {
    start.setMonth(start.getMonth() - 11, 1);
  } else {
    start.setFullYear(start.getFullYear() - 2, 0, 1);
  }

  return { from: start.toISOString().slice(0, 10), to };
}

/** Ticks redondos del eje Y: 0 y cuatro benchmarks hasta un máximo "lindo". */
function getBenchmarkTicks(maxValue: number): { ticks: number[]; max: number } {
  if (maxValue <= 0) return { ticks: [0, 1], max: 1 };
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  const stepOption = [1, 2, 2.5, 5, 10].find((step) => normalized <= step) ?? 10;
  const niceMax = stepOption * magnitude;
  const step = Math.max(1, Math.ceil(niceMax / 4));
  const max = step * 4;
  return { ticks: [0, step, step * 2, step * 3, max], max };
}

const CHART_BLUE = "hsl(209 68% 28%)";
const CHART_TEAL = "hsl(199 48% 52%)";

/** Tooltip "?" con estilo propio: tarjeta blanca, texto claro, al hacer hover. */
function InfoTip({ label, text }: { label: string; text: string }) {
  return (
    <span
      className="group relative inline-flex shrink-0 cursor-help text-slate-400 hover:text-slate-600"
      aria-label={label}
    >
      <CircleHelp size={13} />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[11px] font-normal normal-case leading-relaxed tracking-normal text-slate-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export default function RendimientoWebPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [cabanasLoading, setCabanasLoading] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [selectedCabana, setSelectedCabana] = useState("all");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Record<SeriesKey, boolean>>({
    sessions: false,
    active_users: false,
  });

  useEffect(() => {
    const loadCabanas = async () => {
      try {
        const response = await api.get<Cabana[]>("/cabanas/");
        setCabanas(response.data || []);
      } catch {
        toast.error("No pudimos cargar tus alojamientos");
      } finally {
        setCabanasLoading(false);
      }
    };

    loadCabanas();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadReport = async () => {
      setReportLoading(true);
      setReportError(null);
      try {
        const range = getDateRange(granularity);
        const response = await api.get<AnalyticsReport>(
          "/analytics/web-performance/",
          {
            params: {
              ...range,
              granularity,
              cabana_id: selectedCabana,
            },
          }
        );
        if (!cancelled) setReport(response.data);
      } catch (error: unknown) {
        if (cancelled) return;
        const detail = axios.isAxiosError<{ detail?: string }>(error)
          ? error.response?.data?.detail
          : undefined;
        setReport(null);
        setReportError(
          detail || "No pudimos conectar con Google Analytics en este momento."
        );
      } finally {
        if (!cancelled) setReportLoading(false);
      }
    };

    loadReport();
    return () => {
      cancelled = true;
    };
  }, [granularity, selectedCabana]);

  const chartData = useMemo(
    () =>
      report?.series.map((item) => ({
        ...item,
        label: formatAxisLabel(item.period, granularity),
        fullLabel: formatTooltipLabel(item.period, granularity),
      })) || [],
    [granularity, report]
  );

  const yAxisConfig = useMemo(() => {
    const maxValue = chartData.reduce((acc, item) => {
      const visible = [
        hiddenSeries.sessions ? 0 : item.sessions,
        hiddenSeries.active_users ? 0 : item.active_users,
      ];
      return Math.max(acc, ...visible);
    }, 0);
    return getBenchmarkTicks(maxValue);
  }, [chartData, hiddenSeries]);

  const summary = report?.summary;
  const toggleSeries = (series: SeriesKey) => {
    setHiddenSeries((current) => ({
      ...current,
      [series]: !current[series],
    }));
  };

  const kpis = [
    {
      label: "Visitas",
      value: formatNumber(summary?.sessions),
      icon: Users,
      hint: "Total de veces que entraron a tu web en el período",
      tip: "Cada vez que alguien entra a tu web cuenta como una visita. Si la misma persona entra 3 veces en días distintos, son 3 visitas.",
    },
    {
      label: "Usuarios",
      value: formatNumber(summary?.active_users),
      icon: Activity,
      hint: "Personas distintas que visitaron tu web",
      tip: "Cantidad estimada de personas distintas que entraron a tu web. Google las detecta de forma aproximada y anónima; una misma persona puede generar varias visitas.",
    },
    {
      label: "Vistas de página",
      value: formatNumber(summary?.page_views),
      icon: Eye,
      hint: "Páginas abiertas en total",
      tip: "Cuántas páginas se abrieron en total (inicio, cada alojamiento, contacto, etc.). Una sola visita puede incluir varias páginas vistas.",
    },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Globe size={14} /> Rendimiento web
            </p>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Rendimiento de tu página
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Visitas reales de tu sitio y de cada alojamiento
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:min-w-[190px]">
              <Home
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedCabana}
                onChange={(event) => setSelectedCabana(event.target.value)}
                className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 hover:bg-white focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                aria-label="Filtrar por alojamiento"
                disabled={cabanasLoading}
              >
                <option value="all">Todos los alojamientos</option>
                {cabanas.map((cabana) => (
                  <option key={cabana.id} value={cabana.id}>
                    {cabana.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </header>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Icon size={14} className="shrink-0" />
                    {kpi.label}
                    <InfoTip label={`Más información sobre ${kpi.label}`} text={kpi.tip} />
                  </span>
                  <p className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                    {reportLoading ? "—" : kpi.value}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{kpi.hint}</p>
              </div>
            );
          })}
        </div>

        <Card className="mb-4">
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                Cómo evolucionan tus visitas
                <InfoTip
                  label="Diferencia entre visitas y usuarios"
                  text="Visitas: cuántas veces entraron a tu web. Usuarios: cuántas personas distintas entraron. Si 10 personas entran 2 veces cada una, verás 20 visitas y 10 usuarios."
                />
              </CardTitle>
              <CardDescription className="mt-1">
                Tocá la leyenda para mostrar u ocultar cada línea.
              </CardDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={!hiddenSeries.sessions}
                  onClick={() => toggleSeries("sessions")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity ${hiddenSeries.sessions ? "opacity-45" : ""} bg-blue-50 text-blue-700`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Visitas
                </button>
                <button
                  type="button"
                  aria-pressed={!hiddenSeries.active_users}
                  onClick={() => toggleSeries("active_users")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity ${hiddenSeries.active_users ? "opacity-45" : ""} bg-emerald-50 text-emerald-700`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Usuarios
                </button>
              </div>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {([
                  ["day", "Por día"],
                  ["month", "Por mes"],
                  ["year", "Por año"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGranularity(value)}
                    aria-pressed={granularity === value}
                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors sm:px-3 ${granularity === value ? "bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {report?.updated_at && (
                <span className="hidden items-center gap-1.5 pt-2 text-[11px] text-slate-400 xl:flex">
                  <RefreshCw size={12} /> Actualizado
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-slate-50">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : reportError ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="max-w-md">
                  <Globe className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">
                    Analytics todavía no está disponible
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {reportError} Cuando haya datos, aparecerán aquí sin mostrar
                    métricas inventadas.
                  </p>
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <p className="text-sm text-slate-500">
                  No hay visitas registradas en este período.
                </p>
              </div>
            ) : (
              <div className="h-56 w-full sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="rendimientoSessionsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={CHART_BLUE} stopOpacity={0.35} />
                        <stop offset="85%" stopColor={CHART_BLUE} stopOpacity={0.04} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient
                        id="rendimientoUsersGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={CHART_TEAL} stopOpacity={0.2} />
                        <stop offset="85%" stopColor={CHART_TEAL} stopOpacity={0.03} />
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
                      minTickGap={28}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={42}
                      allowDecimals={false}
                      domain={[0, yAxisConfig.max]}
                      ticks={yAxisConfig.ticks}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                        fontSize: 12,
                      }}
                      labelFormatter={(_label, payload) =>
                        String(
                          (payload?.[0]?.payload as { fullLabel?: string } | undefined)
                            ?.fullLabel ?? _label
                        )
                      }
                      formatter={(value, name) => [
                        formatNumber(Number(value ?? 0)),
                        name === "sessions" ? "Visitas" : "Usuarios",
                      ]}
                    />
                    {!hiddenSeries.sessions && (
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        name="sessions"
                        stroke={CHART_BLUE}
                        strokeWidth={2.5}
                        fill="url(#rendimientoSessionsGradient)"
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                      />
                    )}
                    {!hiddenSeries.active_users && (
                      <Area
                        type="monotone"
                        dataKey="active_users"
                        name="active_users"
                        stroke="#159570"
                        strokeWidth={2}
                        fill="url(#rendimientoUsersGradient)"
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              Rendimiento por alojamiento
              <InfoTip
                label="Cómo se miden estos datos"
                text="Contamos cuántas personas abrieron la página pública de cada alojamiento dentro del período elegido (por día, mes o año). Sirve para saber cuál genera más interés."
              />
            </CardTitle>
            <CardDescription>
              Cuántas personas visitaron la página pública de cada alojamiento en
              el período seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex min-h-28 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : cabanas.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Todavía no tenés alojamientos cargados.
              </p>
            ) : reportError ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Sin datos hasta conectar Google Analytics.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Alojamiento</th>
                      <th className="px-5 py-3 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          Vistas
                          <InfoTip
                            label="Qué son las vistas"
                            text="Cuántas veces se abrió la página de este alojamiento. Incluye visitas repetidas de una misma persona."
                          />
                        </span>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          Usuarios
                          <InfoTip
                            label="Qué son los usuarios"
                            text="Personas distintas que vieron la página de este alojamiento, estimadas de forma anónima por Google Analytics."
                          />
                        </span>
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        <span className="inline-flex items-center justify-end gap-1">
                          Visitas
                          <InfoTip
                            label="Qué son las visitas"
                            text="Veces que alguien entró a la página de este alojamiento. Si la misma persona vuelve otro día, cuenta como una nueva visita."
                          />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.by_cabana || []).map((cabana) => (
                      <tr
                        key={cabana.id}
                        className="border-t border-slate-50 text-slate-700"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {cabana.nombre}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {formatNumber(cabana.page_views)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {formatNumber(cabana.active_users)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-700">
                          {formatNumber(cabana.sessions)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report?.by_cabana.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No hay datos para este alojamiento en el período seleccionado.
                  </p>
                )}
              </div>
            )}
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Las métricas son agregadas y no identifican personalmente a quienes visitan tu web.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
