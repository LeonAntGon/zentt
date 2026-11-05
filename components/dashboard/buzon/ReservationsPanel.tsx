"use client";

import { useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Loader2,
  Mail,
  Phone,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Reserva } from "@/types/cabin";
import { formatMoneyARS } from "@/lib/pricing";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";

type ReservationFilter = "pendientes" | "confirmadas" | "todas";

function formatRange(from: string, to: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const a = parseISO(from).toLocaleDateString("es-AR", opts);
  const b = parseISO(to).toLocaleDateString("es-AR", opts);
  return `${a} – ${b}`;
}

function nightsBetween(from: string, to: string) {
  return Math.max(
    0,
    Math.round(
      (parseISO(to).getTime() - parseISO(from).getTime()) / 86400000
    )
  );
}

function statusLabel(estado: string) {
  if (estado === "pendiente") return "Pendiente";
  if (estado === "confirmada") return "Confirmada";
  if (estado === "cancelada") return "Cancelada";
  if (estado === "finalizada") return "Finalizada";
  return estado;
}

function guestSummary(reserva: Reserva) {
  const parts: string[] = [];
  if (reserva.adultos) {
    parts.push(
      `${reserva.adultos} adulto${reserva.adultos === 1 ? "" : "s"}`
    );
  }
  if (reserva.ninos) {
    parts.push(`${reserva.ninos} niño${reserva.ninos === 1 ? "" : "s"}`);
  }
  return parts.join(" · ") || "Huéspedes a confirmar";
}

function errorDetail(error: unknown, fallback: string): string {
  const detail =
    error && typeof error === "object" && "response" in error
      ? (error as { response?: { data?: { detail?: unknown } } }).response
          ?.data?.detail
      : undefined;

  return typeof detail === "string" && detail.trim() ? detail : fallback;
}

export function ReservationsPanel() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReservationFilter>("pendientes");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reserva | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Reserva[]>(
        "/booking/gestion-reservas/"
      );
      setReservas(data || []);
    } catch {
      setError("No pudimos cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reservas
      .filter((reserva) => {
        if (filter === "pendientes") return reserva.estado === "pendiente";
        if (filter === "confirmadas") return reserva.estado === "confirmada";
        return true;
      })
      .filter((reserva) => {
        if (!term) return true;
        return [
          reserva.nombre_turista,
          reserva.cabana_nombre,
          reserva.email_turista,
          reserva.telefono_turista,
          reserva.notas,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => {
        const pending =
          Number(b.estado === "pendiente") -
          Number(a.estado === "pendiente");
        if (pending !== 0) return pending;
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });
  }, [reservas, filter, search]);

  const counts = useMemo(
    () => ({
      pendientes: reservas.filter((r) => r.estado === "pendiente").length,
      confirmadas: reservas.filter((r) => r.estado === "confirmada").length,
      todas: reservas.length,
    }),
    [reservas]
  );

  const updateReserva = (updated: Reserva) => {
    setReservas((current) =>
      current.map((reserva) =>
        reserva.id === updated.id ? { ...reserva, ...updated } : reserva
      )
    );
  };

  const changeEstado = async (
    reserva: Reserva,
    estado: "confirmada" | "cancelada"
  ) => {
    setBusyId(reserva.id);
    try {
      const { data } = await api.patch<Reserva>(
        `/booking/gestion-reservas/${reserva.id}/`,
        { estado }
      );
      updateReserva(data);
      toast.success(
        estado === "confirmada"
          ? "Reserva confirmada. Fechas bloqueadas."
          : "Reserva rechazada."
      );
    } catch (err) {
      toast.error(errorDetail(err, "No se pudo actualizar la reserva."));
    } finally {
      setBusyId(null);
    }
  };

  const cancelReserva = async () => {
    if (!cancelTarget) return;
    const reserva = cancelTarget;
    setBusyId(reserva.id);
    try {
      const { data } = await api.post<Reserva>(
        `/booking/gestion-reservas/${reserva.id}/cancelar/`
      );
      updateReserva(data);
      setCancelTarget(null);
      toast.success("Reserva cancelada. Fechas liberadas.");
    } catch (err) {
      toast.error(errorDetail(err, "No se pudo cancelar la reserva."));
    } finally {
      setBusyId(null);
    }
  };

  const filterTabs: Array<{ id: ReservationFilter; label: string }> = [
    { id: "pendientes", label: "Pendientes" },
    { id: "confirmadas", label: "Confirmadas" },
    { id: "todas", label: "Todas" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por huésped, cabaña, email o notas"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  filter === tab.id
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(var(--mobile-nav-offset)+1.5rem)]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando reservas...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <CalendarDays size={26} className="mb-3 text-slate-200" />
            <p className="text-sm font-bold text-slate-400">
              No hay reservas en esta vista.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Las reservas hechas desde la web van a aparecer acá.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {filtered.map((reserva) => {
              const busy = busyId === reserva.id;
              const badgeClass =
                reserva.estado === "confirmada"
                  ? "bg-emerald-50 text-emerald-700"
                  : reserva.estado === "pendiente"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600";

              return (
                <article
                  key={reserva.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {reserva.nombre_turista}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Home size={12} className="shrink-0" />
                        <span className="truncate">
                          {reserva.cabana_nombre || "Alojamiento"}
                        </span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays size={12} className="shrink-0" />
                        {formatRange(reserva.check_in, reserva.check_out)} ·{" "}
                        {nightsBetween(reserva.check_in, reserva.check_out)}{" "}
                        {nightsBetween(reserva.check_in, reserva.check_out) === 1
                          ? "noche"
                          : "noches"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
                    >
                      {statusLabel(reserva.estado)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Users size={12} className="shrink-0" />
                      {guestSummary(reserva)}
                    </p>
                    {reserva.email_turista && (
                      <p className="flex items-center gap-1.5">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{reserva.email_turista}</span>
                      </p>
                    )}
                    {reserva.telefono_turista && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={12} className="shrink-0" />
                        {reserva.telefono_turista}
                      </p>
                    )}
                    {reserva.notas && (
                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                        {reserva.notas}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <p className="text-sm font-bold text-slate-900">
                      {formatMoneyARS(Number(reserva.total_reserva || 0))}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {reserva.estado === "pendiente" && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void changeEstado(reserva, "confirmada")
                            }
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            Confirmar
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void changeEstado(reserva, "cancelada")
                            }
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Rechazar
                          </button>
                        </>
                      )}
                      {reserva.estado === "confirmada" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setCancelTarget(reserva)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={Boolean(cancelTarget)}
        title="Cancelar reserva"
        body={
          cancelTarget
            ? `¿Cancelar la reserva de ${cancelTarget.nombre_turista}? Las fechas quedarán liberadas.`
            : ""
        }
        confirmLabel="Sí, cancelar"
        variant="danger"
        loading={Boolean(cancelTarget && busyId === cancelTarget.id)}
        onConfirm={() => void cancelReserva()}
        onClose={() => {
          if (!busyId) setCancelTarget(null);
        }}
      />
    </div>
  );
}
