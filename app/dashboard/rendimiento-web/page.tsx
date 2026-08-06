"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  Eye,
  Globe,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Cabana } from "@/types/cabin";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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

const chartConfig = {
  sessions: { label: "Sesiones", color: "#0A2342" },
  page_views: { label: "Vistas de página", color: "#4D8FBA" },
} satisfies ChartConfig;

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
  } else {
    start.setFullYear(start.getFullYear() - 4, 0, 1);
  }

  return { from: start.toISOString().slice(0, 10), to };
}

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

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={granularity}
              onChange={(event) => setGranularity(event.target.value as Granularity)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary"
              aria-label="Agrupar estadísticas por"
            >
              <option value="day">Por día · últimos 30 días</option>
              <option value="month">Por mes · últimos 12 meses</option>
              <option value="year">Por año · últimos 5 años</option>
            </select>
            <select
              value={selectedCabana}
              onChange={(event) => setSelectedCabana(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary"
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
              <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
                <LineChart data={chartData} margin={{ left: 0, right: 8, top: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={24}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="sessions"
                    type="monotone"
                    stroke="var(--color-sessions)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    dataKey="page_views"
                    type="monotone"
                    stroke="var(--color-page_views)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
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
                      <th className="px-5 py-3 font-semibold">Usuarios activos</th>
                      <th className="px-5 py-3 text-right font-semibold">Sesiones</th>
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
