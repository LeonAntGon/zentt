"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Cabana, Mensaje, Reserva } from "@/types/cabin";
import { nightsCount, toISODate } from "@/lib/pricing";
import {
  eachDayOfInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { CalendarDays, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PropertySelector } from "@/components/dashboard/calendario/PropertySelector";
import { MasterCalendar } from "@/components/dashboard/calendario/MasterCalendar";
import { ActionPanel } from "@/components/dashboard/calendario/ActionPanel";

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

function overlapsMonth(checkIn: string, checkOut: string, month: Date) {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const monthStart = startOfMonth(month);
  const monthEndExclusive = new Date(endOfMonth(month));
  monthEndExclusive.setDate(monthEndExclusive.getDate() + 1);
  return start < monthEndExclusive && end > monthStart;
}

export default function CalendarioPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [selectedCabanaId, setSelectedCabanaId] = useState<number | "all">(
    "all"
  );
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteConsultaId, setDeleteConsultaId] = useState<number | null>(null);
  const [syncingIcal, setSyncingIcal] = useState(false);

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
        setCabanas(resCabanas.data);
        setReservas(resReservas.data || []);
        setMensajes(resMensajes.data || []);
        if (resCabanas.data.length === 1) {
          setSelectedCabanaId(resCabanas.data[0].id);
        }
      } catch {
        toast.error("No pudimos cargar el calendario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredReservas = useMemo(() => {
    if (selectedCabanaId === "all") return reservas;
    return reservas.filter((r) => r.cabana === selectedCabanaId);
  }, [reservas, selectedCabanaId]);

  const filteredMensajes = useMemo(() => {
    const withDates = mensajes.filter((m) => m.fecha_desde && m.fecha_hasta);
    if (selectedCabanaId === "all") return withDates;
    return withDates.filter((m) => m.cabana === selectedCabanaId);
  }, [mensajes, selectedCabanaId]);

  const confirmedDates = useMemo(() => {
    const set = new Set<string>();
    if (selectedCabanaId === "all") return set;
    for (const r of filteredReservas) {
      if (r.estado !== "confirmada") continue;
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
  }, [filteredReservas, selectedCabanaId]);

  const blockedDates = useMemo(() => {
    const set = new Set<string>();
    if (selectedCabanaId === "all") return set;
    const list =
      cabanas.filter((c) => c.id === selectedCabanaId);
    for (const c of list) {
      for (const b of c.bloqueos_externos || []) {
        const start = parseISO(b.inicio);
        const end = parseISO(b.fin);
        if (end <= start) continue;
        for (const d of eachDayOfInterval({
          start,
          end: new Date(end.getTime() - 86400000),
        })) {
          set.add(toISODate(d));
        }
      }
    }
    for (const r of filteredReservas) {
      if (r.estado !== "finalizada") continue;
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
  }, [cabanas, selectedCabanaId, filteredReservas]);

  const pendingDates = useMemo(() => {
    const set = new Set<string>();
    if (selectedCabanaId === "all") return set;
    for (const r of filteredReservas) {
      if (r.estado !== "pendiente") continue;
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
    for (const m of filteredMensajes) {
      if (!m.fecha_desde || !m.fecha_hasta) continue;
      const start = parseISO(m.fecha_desde);
      const end = parseISO(m.fecha_hasta);
      if (end <= start) continue;
      for (const d of eachDayOfInterval({
        start,
        end: new Date(end.getTime() - 86400000),
      })) {
        set.add(toISODate(d));
      }
    }
    return set;
  }, [filteredReservas, filteredMensajes, selectedCabanaId]);

  const cabinCount =
    selectedCabanaId === "all"
      ? Math.max(1, cabanas.length)
      : 1;

  const monthSummary = useMemo(() => {
    const daysInMonth = endOfMonth(month).getDate();
    const capacity = daysInMonth * cabinCount;

    let confirmedNights = 0;
    let projectedIncome = 0;

    for (const r of filteredReservas) {
      if (!overlapsMonth(r.check_in, r.check_out, month)) continue;
      if (r.estado === "confirmada" || r.estado === "pendiente") {
        projectedIncome += Number(r.total_reserva || 0);
      }
      if (r.estado === "confirmada") {
        confirmedNights += nightsInMonth(r.check_in, r.check_out, month);
      }
    }

    let blockedNights = 0;
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const cabinsInScope =
      selectedCabanaId === "all"
        ? cabanas
        : cabanas.filter((c) => c.id === selectedCabanaId);

    // Count blocked nights per cabin. A date occupied in cabin A must not
    // consume the capacity of cabin B.
    for (const cabana of cabinsInScope) {
      const confirmedForCabana = new Set<string>();
      const blockedForCabana = new Set<string>();
      for (const reserva of reservas) {
        if (reserva.cabana !== cabana.id) continue;
        const start = parseISO(reserva.check_in);
        const end = parseISO(reserva.check_out);
        if (end <= start) continue;
        for (const day of eachDayOfInterval({
          start,
          end: new Date(end.getTime() - 86400000),
        })) {
          const key = toISODate(day);
          if (reserva.estado === "confirmada") confirmedForCabana.add(key);
          if (reserva.estado === "finalizada") blockedForCabana.add(key);
        }
      }
      for (const bloqueo of cabana.bloqueos_externos || []) {
        const start = parseISO(bloqueo.inicio);
        const end = parseISO(bloqueo.fin);
        if (end <= start) continue;
        for (const day of eachDayOfInterval({
          start,
          end: new Date(end.getTime() - 86400000),
        })) {
          blockedForCabana.add(toISODate(day));
        }
      }
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const key = toISODate(d);
        if (blockedForCabana.has(key) && !confirmedForCabana.has(key)) {
          blockedNights += 1;
        }
      }
    }

    const occupied = Math.min(capacity, confirmedNights + blockedNights);
    const occupancyPct =
      capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;
    const freeNights = Math.max(0, capacity - occupied);

    return { occupancyPct, projectedIncome, freeNights };
  }, [
    month,
    filteredReservas,
    cabanas,
    reservas,
    selectedCabanaId,
    cabinCount,
  ]);

  const handleConfirm = async (id: number) => {
    setBusyId(id);
    try {
      const { data } = await api.patch<Reserva>(
        `/booking/gestion-reservas/${id}/`,
        { estado: "confirmada" }
      );
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...data, estado: "confirmada" } : r
        )
      );
      toast.success("Reserva confirmada. Fechas bloqueadas.");
    } catch {
      toast.error(
        "No se pudo confirmar. Puede haber solapamiento con otra reserva confirmada."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: number) => {
    setBusyId(id);
    try {
      await api.patch(`/booking/gestion-reservas/${id}/`, {
        estado: "cancelada",
      });
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r))
      );
      toast.success("Reserva rechazada / cancelada.");
    } catch {
      toast.error("No se pudo rechazar");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmConsulta = async (msg: Mensaje) => {
    if (!msg.fecha_desde || !msg.fecha_hasta) {
      toast.error("Esta consulta no tiene fechas.");
      return;
    }
    setBusyId(msg.id);
    try {
      const { data } = await api.post<Reserva>("/booking/gestion-reservas/", {
        cabana: msg.cabana,
        nombre_turista: msg.nombre_turista,
        email_turista: msg.email_turista,
        telefono_turista: msg.telefono_turista || null,
        check_in: msg.fecha_desde,
        check_out: msg.fecha_hasta,
        estado: "confirmada",
      });
      setReservas((prev) => [...prev, data]);
      await api.delete(`/mensajes/${msg.id}/`);
      setMensajes((prev) => prev.filter((m) => m.id !== msg.id));
      toast.success("Reserva confirmada. Fechas bloqueadas.");
    } catch {
      toast.error(
        "No se pudo confirmar. Puede haber solapamiento con otra reserva confirmada."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteConsulta = async (id: number) => {
    setBusyId(id);
    try {
      await api.delete(`/mensajes/${id}/`);
      setMensajes((prev) => prev.filter((m) => m.id !== id));
      setDeleteConsultaId(null);
      toast.success("Consulta eliminada.");
    } catch {
      toast.error("No se pudo eliminar la consulta.");
    } finally {
      setBusyId(null);
    }
  };

  const selectedCabana =
    selectedCabanaId === "all"
      ? null
      : cabanas.find((c) => c.id === selectedCabanaId) || null;

  const handleSyncIcal = async () => {
    if (!selectedCabana?.slug) {
      toast.error("Elegí un alojamiento para sincronizar su iCal.");
      return;
    }
    if (!selectedCabana.ical_url) {
      toast.error(
        "Este alojamiento no tiene URL iCal. Configuralo en Editar alojamiento."
      );
      return;
    }
    setSyncingIcal(true);
    try {
      const { data } = await api.post<{ total: number; created: number }>(
        `/cabanas/${selectedCabana.slug}/sincronizar_ical/`
      );
      const refreshed = await api.get<Cabana>(
        `/cabanas/${selectedCabana.slug}/`
      );
      setCabanas((prev) =>
        prev.map((c) => (c.id === refreshed.data.id ? refreshed.data : c))
      );
      toast.success(
        `iCal sincronizado: ${data.total} bloqueos (${data.created} nuevos).`
      );
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
      toast.error(
        typeof detail === "string" ? detail : "No se pudo sincronizar el iCal."
      );
    } finally {
      setSyncingIcal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="mb-6">
          <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <CalendarDays size={14} /> Disponibilidad
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Calendario
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vista de alta densidad: confirmadas, pendientes y bloqueos iCal.
          </p>
        </header>

        <div className="mb-6">
          <PropertySelector
            cabanas={cabanas}
            selectedId={selectedCabanaId}
            onSelect={(id) => {
              setSelectedCabanaId(id);
              setSelectedDay(undefined);
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MasterCalendar
              month={month}
              onMonthChange={setMonth}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              confirmedDates={confirmedDates}
              pendingDates={pendingDates}
              blockedDates={blockedDates}
              aggregateView={selectedCabanaId === "all"}
              monthSummary={monthSummary}
              showSyncIcal={selectedCabanaId !== "all"}
              syncingIcal={syncingIcal}
              onSyncIcal={handleSyncIcal}
            />
          </div>

          <div className="lg:col-span-1 lg:min-h-[560px]">
            <ActionPanel
              selectedDay={selectedDay}
              reservas={filteredReservas}
              mensajes={filteredMensajes}
              busyId={busyId}
              onConfirmReserva={handleConfirm}
              onRejectReserva={handleReject}
              onConfirmConsulta={handleConfirmConsulta}
              onRejectConsulta={(id) => setDeleteConsultaId(id)}
            />
          </div>
        </div>
      </div>

      {deleteConsultaId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Eliminar consulta
            </h3>
            <p className="mb-6 text-slate-500">
              ¿Seguro que querés eliminar esta consulta? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                disabled={busyId === deleteConsultaId}
                onClick={() => setDeleteConsultaId(null)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busyId === deleteConsultaId}
                onClick={() => handleDeleteConsulta(deleteConsultaId)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {busyId === deleteConsultaId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
