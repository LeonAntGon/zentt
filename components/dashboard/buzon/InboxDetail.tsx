"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MailOpen,
  Phone,
  Trash2,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MessageChannelBadge } from "@/components/dashboard/MessageChannelBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatFullDateTime } from "@/lib/relative-time";
import {
  InboxMessage,
  messageEmail,
  messageName,
  messagePhone,
  messageText,
} from "@/components/dashboard/buzon/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0]?.slice(0, 2) || "?").toUpperCase();
}

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/[^\d+]/g, "");
}

type InboxDetailProps = {
  message: InboxMessage;
  onBack: () => void;
  onToggleRead: () => Promise<void>;
  onConfirm: () => Promise<void>;
  onReject: () => Promise<void>;
  onDelete: () => Promise<void>;
  busyAction: "read" | "confirm" | "reject" | "delete" | null;
};

export function InboxDetail({
  message,
  onBack,
  onToggleRead,
  onConfirm,
  onReject,
  onDelete,
  busyAction,
}: InboxDetailProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const name = messageName(message);
  const email = messageEmail(message);
  const phone = messagePhone(message);
  const phoneHref = normalizePhone(phone);
  const waDigits = phoneHref.replace(/\D/g, "");
  const isCabana = message._tipo === "cabanas";
  const hasDates = isCabana && !!message.fecha_desde && !!message.fecha_hasta;
  const reserved = isCabana && message.reserva_estado === "confirmada";
  const cabinName = isCabana ? message.cabana_nombre || "Alojamiento" : "Consulta general";
  const mailSubject = `Consulta por ${cabinName}`;
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hola ${name}, te escribo por tu consulta sobre ${cabinName}.`
      )}`
    : null;

  const stayLabel =
    isCabana && message.fecha_desde && message.fecha_hasta
      ? `${format(parseISO(message.fecha_desde), "d MMM", { locale: es })} – ${format(
          parseISO(message.fecha_hasta),
          "d MMM yyyy",
          { locale: es }
        )}`
      : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary lg:hidden"
        >
          <ArrowLeft size={15} /> Volver al buzón
        </button>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white sm:h-12 sm:w-12">
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-black text-slate-900 sm:text-lg">{name}</h2>
              <MessageChannelBadge origen={message.origen} variant="pill" />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500">
              <span>{cabinName}</span>
              <span className="text-slate-300">·</span>
              <span>{formatFullDateTime(message.fecha_envio)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Mail size={13} /> <span className="truncate">{email}</span>
              </a>
              {phone && (
                <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Phone size={13} /> {phone}
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={busyAction === "read"}
            onClick={() => void onToggleRead()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary disabled:opacity-50"
          >
            {message.leido ? <MailOpen size={13} /> : <Mail size={13} />}
            <span className="hidden sm:inline">{message.leido ? "Marcar no leído" : "Marcar leído"}</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Mensaje del huésped
        </p>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-700">
          {messageText(message)}
        </div>

        {stayLabel && (
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
            <CalendarDays size={14} />
            {stayLabel}
            <span className="font-medium text-primary/60">· fechas de estadía</span>
          </div>
        )}

        <p className="mb-2 mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Contactar
        </p>
        <div className="flex flex-wrap gap-2">
          {email && (
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(mailSubject)}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <Mail size={14} /> Responder mail
            </a>
          )}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold shadow-sm"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {phoneHref && (
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Phone size={14} /> Llamar
            </a>
          )}
        </div>

        <button
          type="button"
          disabled={busyAction === "delete"}
          onClick={() => setShowDeleteModal(true)}
          className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 size={13} /> Eliminar consulta
        </button>
      </div>

      {hasDates && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
          {reserved ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={15} /> Reserva confirmada y vinculada a esta consulta
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void onConfirm()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {busyAction === "confirm" ? <Clock3 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirmar reserva
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void onReject()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {busyAction === "reject" ? <Clock3 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h3 className="text-center text-lg font-black text-slate-900">Eliminar consulta</h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
              Esta acción no se puede deshacer. ¿Querés eliminar la consulta de {name}?
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={busyAction === "delete"}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busyAction === "delete"}
                onClick={async () => {
                  await onDelete();
                  setShowDeleteModal(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyAction === "delete" ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
