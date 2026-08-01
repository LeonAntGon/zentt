"use client";

import { useMemo, useState } from "react";
import { Mensaje, Reserva } from "@/types/cabin";
import { formatMoneyARS, nightsCount } from "@/lib/pricing";
import { parseISO, isWithinInterval, startOfDay } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  XCircle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PanelFilter = "pendientes" | "confirmadas" | "todas";

type ActionPanelProps = {
  selectedDay: Date | undefined;
  reservas: Reserva[];
  mensajes: Mensaje[];
  busyId: number | null;
  onConfirmReserva: (id: number) => void;
  onRejectReserva: (id: number) => void;
  onConfirmConsulta: (msg: Mensaje) => void;
  onRejectConsulta: (id: number) => void;
};

type PanelItem =
  | { kind: "reserva"; data: Reserva; sortKey: string }
  | { kind: "consulta"; data: Mensaje; sortKey: string };

function dayOverlapsStay(
  day: Date,
  checkIn: string,
  checkOut: string
): boolean {
  try {
    const start = startOfDay(parseISO(checkIn));
    const endExclusive = startOfDay(parseISO(checkOut));
    if (endExclusive <= start) return false;
    const endInclusive = new Date(endExclusive);
    endInclusive.setDate(endInclusive.getDate() - 1);
    return isWithinInterval(startOfDay(day), {
      start,
      end: endInclusive,
    });
  } catch {
    return false;
  }
}

function formatRange(from: string, to: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const a = parseISO(from).toLocaleDateString("es-AR", opts);
  const b = parseISO(to).toLocaleDateString("es-AR", opts);
  return `${a} → ${b}`;
}

export function ActionPanel({
  selectedDay,
  reservas,
  mensajes,
  busyId,
  onConfirmReserva,
  onRejectReserva,
  onConfirmConsulta,
  onRejectConsulta,
}: ActionPanelProps) {
  const [filter, setFilter] = useState<PanelFilter>("todas");

  const items = useMemo((): PanelItem[] => {
    const now = startOfDay(new Date());
    const list: PanelItem[] = [];

    for (const r of reservas) {
      if (r.estado === "cancelada") continue;
      if (selectedDay) {
        if (!dayOverlapsStay(selectedDay, r.check_in, r.check_out)) continue;
      } else if (parseISO(r.check_out) <= now) {
        continue;
      }
      list.push({ kind: "reserva", data: r, sortKey: r.check_in });
    }

    for (const m of mensajes) {
      if (!m.fecha_desde || !m.fecha_hasta) continue;
      if (selectedDay) {
        if (!dayOverlapsStay(selectedDay, m.fecha_desde, m.fecha_hasta))
          continue;
      } else if (parseISO(m.fecha_hasta) <= now) {
        continue;
      }
      list.push({ kind: "consulta", data: m, sortKey: m.fecha_desde });
    }

    return list.sort(
      (a, b) =>
        parseISO(a.sortKey).getTime() - parseISO(b.sortKey).getTime()
    );
  }, [reservas, mensajes, selectedDay]);

  const filtered = useMemo(() => {
    if (filter === "todas") return items;
    if (filter === "confirmadas") {
      return items.filter(
        (i) => i.kind === "reserva" && i.data.estado === "confirmada"
      );
    }
    // pendientes: reservas pendientes + consultas
    return items.filter(
      (i) =>
        i.kind === "consulta" ||
        (i.kind === "reserva" && i.data.estado === "pendiente")
    );
  }, [items, filter]);

  const title = selectedDay
    ? `Actividad del ${selectedDay.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
      })}`
    : "Consultas y Reservas Recientes";

  const tabs: { id: PanelFilter; label: string }[] = [
    { id: "pendientes", label: "Pendientes" },
    { id: "confirmadas", label: "Confirmadas" },
    { id: "todas", label: "Todas" },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 pt-5 pb-3">
        <h2 className="font-heading text-sm font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {filtered.length}{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
        </p>

        <div className="mt-4 flex gap-1 rounded-xl bg-slate-50 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all",
                filter === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Inbox size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              Sin actividad en este filtro
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            if (item.kind === "consulta") {
              const m = item.data;
              const busy = busyId === m.id;
              return (
                <article
                  key={`consulta-${m.id}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:border-slate-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {m.nombre_turista}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {m.cabana_nombre || "Alojamiento"} ·{" "}
                        {formatRange(m.fecha_desde!, m.fecha_hasta!)}
                      </p>
                      {Number(m.total_estimado || 0) > 0 && (
                        <p className="mt-1.5 text-sm font-bold text-slate-800">
                          {formatMoneyARS(Number(m.total_estimado))}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
                      <MessageSquare size={10} />
                      consulta
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onConfirmConsulta(m)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRejectConsulta(m.id)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Rechazar
                    </button>
                  </div>
                </article>
              );
            }

            const r = item.data;
            const busy = busyId === r.id;
            const n = nightsCount(parseISO(r.check_in), parseISO(r.check_out));
            const isPending = r.estado === "pendiente";
            const isConfirmed = r.estado === "confirmada";

            return (
              <article
                key={`reserva-${r.id}`}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:border-slate-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {r.nombre_turista}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {r.cabana_nombre} · {formatRange(r.check_in, r.check_out)}
                      {" · "}
                      {n} {n === 1 ? "noche" : "noches"}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-slate-800">
                      {formatMoneyARS(Number(r.total_reserva))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1",
                      isConfirmed
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : isPending
                          ? "bg-amber-50 text-amber-700 ring-amber-100"
                          : "bg-slate-100 text-slate-600 ring-slate-200"
                    )}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <Clock size={10} />
                    )}
                    {r.estado}
                  </span>
                </div>

                {isPending && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onConfirmReserva(r.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRejectReserva(r.id)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
