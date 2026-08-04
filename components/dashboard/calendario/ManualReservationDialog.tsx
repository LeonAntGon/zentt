"use client";

import { useState } from "react";
import { Loader2, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Cabana, Reserva } from "@/types/cabin";
import { toISODate } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";

type ManualReservationDialogProps = {
  cabanas: Cabana[];
  preselectedCabanaId: number | "all";
  preselectedDay: string | null;
  open: boolean;
  onClose: () => void;
  onCreated: (reserva: Reserva) => void;
};

export function ManualReservationDialog({
  cabanas,
  preselectedCabanaId,
  preselectedDay,
  open,
  onClose,
  onCreated,
}: ManualReservationDialogProps) {
  const [cabanaId, setCabanaId] = useState<number | null>(
    preselectedCabanaId !== "all" ? preselectedCabanaId : cabanas[0]?.id ?? null
  );
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [checkIn, setCheckIn] = useState(preselectedDay || "");
  const [checkOut, setCheckOut] = useState(
    preselectedDay ? toISODate(addDays(new Date(preselectedDay + "T00:00:00"), 1)) : ""
  );
  const [estado, setEstado] = useState<"pendiente" | "confirmada">("confirmada");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const valid =
    cabanaId &&
    nombre.trim().length > 0 &&
    checkIn &&
    checkOut &&
    checkIn < checkOut;

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const { data } = await api.post<Reserva>("/booking/gestion-reservas/", {
        cabana: cabanaId,
        nombre_turista: nombre.trim(),
        email_turista: email.trim() || null,
        telefono_turista: telefono.trim() || null,
        check_in: checkIn,
        check_out: checkOut,
        estado,
      });
      onCreated(data);
      toast.success("Reserva creada con éxito.");
      onClose();
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: unknown } }).response?.data;
      if (detail && typeof detail === "object") {
        const d = detail as Record<string, unknown>;
        if (d.detail && typeof d.detail === "string") {
          toast.error(d.detail);
          return;
        }
        const errors = Object.values(d).flat().join(" ");
        toast.error(errors || "No se pudo crear la reserva.");
      } else {
        toast.error("No se pudo crear la reserva. Revisá las fechas.");
      }
    } finally {
      setSaving(false);
    }
  };

  const minimalDate = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Nueva reserva
            </h2>
            <p className="text-xs text-slate-500">
              Agregá una reserva manual a tu calendario.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alojamiento
            </label>
            <select
              value={cabanaId ?? ""}
              onChange={(e) => setCabanaId(Number(e.target.value) || null)}
              className="field-auth"
            >
              {cabanas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Nombre del huésped
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="María García"
              className="field-auth"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="huésped@mail.com"
                className="field-auth"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 381 555-1234"
                className="field-auth"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={minimalDate}
                onChange={(e) => setCheckIn(e.target.value)}
                className="field-auth"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || minimalDate}
                onChange={(e) => setCheckOut(e.target.value)}
                className="field-auth"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Estado inicial
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEstado("confirmada")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  estado === "confirmada"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                Confirmada
              </button>
              <button
                type="button"
                onClick={() => setEstado("pendiente")}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  estado === "pendiente"
                    ? "border-amber-600 bg-amber-50 text-amber-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                Pendiente
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!valid || saving}
            onClick={() => void handleSubmit()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlusCircle size={16} />
            )}
            Crear reserva
          </button>
        </div>
      </div>
    </div>
  );
}
