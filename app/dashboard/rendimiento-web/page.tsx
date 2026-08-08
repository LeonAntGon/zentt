"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  CalendarDays,
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

type Granularity = "day" | "week" | "month";

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

const numberFormatter = new Intl.NumberFormat("es-AR");

function formatNumber(value: number | undefined) {
  return value === undefined ? "—" : numberFormatter.format(value);
}

function formatPeriod(period: string, granularity: Granularity) {
  if (granularity === "day") {
    const [year, month, day] = period.split("-").map(Number);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(year, month - 1, day));
  }
  if (granularity === "week") {
    const [year, week] = period.split("-W");
    return `Sem ${week}, ${year}`;
  }
  if (granularity === "month") {
    const [year, month] = period.split("-").map(Number);
    return new Intl.DateTimeFormat("es-AR", {
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  }
  return period;
}

function getDateRange(granularity: Granularity) {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const start = new Date(today);

  if (granularity === "day") {
    start.setDate(start.getDate() - 29);
  } else if (granularity === "month") {
    start.setMonth(start.getMonth() - 11, 1);
  } else if (granularity === "week") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setDate(start.getDate() - 77);
  } else {
    start.setMonth(start.getMonth() - 11, 1);
  }

  return { from: start.toISOString().slice(0, 10), to };
}

const CHART_BLUE = "hsl(209 68% 28%)";
const CHART_TEAL = "hsl(199 48% 52%)";

export default function RendimientoWebPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [cabanasLoading, setCabanasLoading] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [selectedCabana, setSelectedCabana] = useState("all");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

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
        label: formatPeriod(item.period, granularity),
      })) || [],
    [granularity, report]
  );

  const summary = report?.summary;
  const kpis = [
    {
      label: "Sesiones",
      value: formatNumber(summary?.sessions),
      icon: Users,
      hint: "Visitas generales a tu web",
    },
    {
      label: "Usuarios activos",
      value: formatNumber(summary?.active_users),
      icon: Activity,
      hint: "Usuarios únicos aproximados",
    },
    {
      label: "Vistas de página",
      value: formatNumber(summary?.page_views),
      icon: Eye,
      hint: "Páginas públicas visitadas",
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
            <div className="relative w-full sm:min-w-[210px]">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />
              <select
                value={granularity}
                onChange={(event) =>
                  setGranularity(event.target.value as Granularity)
                }
                className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 hover:bg-white focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
                aria-label="Agrupar estadísticas por"
              >
                <option value="day">Por día · últimos 30 días</option>
                <option value="week">Por semana · últimas 12 semanas</option>
                <option value="month">Por mes · últimos 12 meses</option>
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
                    {(kpi.label === "Sesiones" || kpi.label === "Usuarios activos") && (
                      <span
                        title={
                          kpi.label === "Sesiones"
                            ? "Una visita es una sesión. Durante una misma visita se pueden ver varias páginas."
                            : "Un usuario activo es una persona o dispositivo detectado aproximadamente por GA4. Puede generar varias visitas."
                        }
                        aria-label={`Más información sobre ${kpi.label}`}
                        className="inline-flex cursor-help text-slate-400"
                      >
                        <CircleHelp size={13} />
                      </span>
                    )}
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
          <CardHeader className="gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Evolución de visitas</CardTitle>
              <CardDescription>
                Sesiones y vistas de página del período seleccionado
              </CardDescription>
            </div>
            {report?.updated_at && (
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <RefreshCw size={12} /> Datos actualizados
              </span>
            )}
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
                      labelFormatter={(label) => String(label)}
                      formatter={(value, name) => [
                        formatNumber(Number(value ?? 0)),
                        name === "sessions" ? "Visitas" : "Usuarios activos",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      name="sessions"
                      stroke={CHART_BLUE}
                      strokeWidth={2.5}
                      fill="url(#rendimientoSessionsGradient)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="active_users"
                      name="active_users"
                      stroke={CHART_TEAL}
                      strokeWidth={2}
                      fill="url(#rendimientoUsersGradient)"
                      activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por alojamiento</CardTitle>
            <CardDescription>
              Vistas de página y usuarios activos en la página pública de cada alojamiento
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
                      <th className="px-5 py-3 font-semibold">Vistas</th>
                      <th className="px-5 py-3 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          Usuarios activos
                          <span
                            title="Un usuario activo es una persona o dispositivo detectado aproximadamente por GA4. Puede generar varias visitas."
                            aria-label="Más información sobre usuarios activos"
                            className="inline-flex cursor-help text-slate-400"
                          >
                            <CircleHelp size={13} />
                          </span>
                        </span>
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        <span className="inline-flex items-center gap-1">
                          Visitas
                          <span
                            title="Una visita es una sesión. Durante una misma visita se pueden ver varias páginas."
                            aria-label="Más información sobre visitas"
                            className="inline-flex cursor-help text-slate-400"
                          >
                            <CircleHelp size={13} />
                          </span>
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
