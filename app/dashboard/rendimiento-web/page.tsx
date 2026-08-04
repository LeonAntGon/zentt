"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Cabana } from "@/types/cabin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Globe,
  MousePointerClick,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function RendimientoWebPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCabanas = async () => {
      try {
        const response = await api.get<Cabana[]>("/cabanas/");
        setCabanas(response.data || []);
      } catch {
        toast.error("No pudimos cargar tus alojamientos");
      } finally {
        setLoading(false);
      }
    };

    loadCabanas();
  }, []);

  const kpis = [
    {
      label: "Visitas totales",
      value: "—",
      icon: Users,
      hint: "Disponible al conectar Google Analytics",
    },
    {
      label: "Consultas recibidas",
      value: "—",
      icon: MousePointerClick,
      hint: "Disponible al conectar Google Analytics",
    },
    {
      label: "Tasa de conversión",
      value: "—",
      icon: TrendingUp,
      hint: "Se calcula con visitas y consultas reales",
    },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <header className="mb-5">
          <p className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Globe size={14} /> Rendimiento web
          </p>
          <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Rendimiento de tu página
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Visitas, consultas y conversión de tu página pública
          </p>
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
                    {kpi.value}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{kpi.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3">
            <h2 className="font-heading text-sm font-bold text-slate-900">
              Evolución anual
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Comparativa mensual de visitas y consultas
            </p>
          </div>

          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="max-w-md">
              <Globe className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">
                Todavía no hay datos de rendimiento
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Conectá Google Analytics para visualizar visitas, consultas y
                evolución mensual.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por alojamiento</CardTitle>
            <CardDescription>
              Visitas y consultas por página pública de cada alojamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-28 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : cabanas.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Todavía no tenés alojamientos cargados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Alojamiento</th>
                    <th className="px-5 py-3 font-semibold">Visitas</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Consultas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cabanas.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-slate-50 text-slate-700"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {c.nombre}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">Sin datos</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-400">
                        Sin datos
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Conectá Google Analytics para ver el rendimiento real de tu
              página. La integración estará disponible próximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
