"use client";

import { CalendarDays, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatMoneyARS, lastNightFromExclusive, nightsCount, toISODate } from "@/lib/pricing";
import { formatRelativeTime } from "@/lib/relative-time";
import { MessageChannelBadge } from "@/components/dashboard/MessageChannelBadge";
import {
  InboxMessage,
  messageName,
  messageText,
} from "@/components/dashboard/buzon/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0]?.slice(0, 2) || "?").toUpperCase();
}

function formatShortDate(value: string) {
  return format(parseISO(value), "d MMM", { locale: es }).replace(".", "");
}

function StayLine({ message }: { message: InboxMessage }) {
  if (
    message._tipo !== "cabanas" ||
    !message.fecha_desde ||
    !message.fecha_hasta
  ) {
    return null;
  }

  const nights = nightsCount(parseISO(message.fecha_desde), parseISO(message.fecha_hasta));
  const lastNight = lastNightFromExclusive(parseISO(message.fecha_hasta));
  if (nights < 1) return null;

  return (
    <div className="mt-2 flex min-w-0 items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
      <CalendarDays size={11} className="shrink-0 text-slate-400" />
      <span className="truncate">
        {formatShortDate(message.fecha_desde)} – {formatShortDate(toISODate(lastNight))} · {nights}{" "}
        {nights === 1 ? "noche" : "noches"}
      </span>
      {Number(message.total_estimado || 0) > 0 && (
        <span className="shrink-0 font-bold text-emerald-700">
          · {formatMoneyARS(Number(message.total_estimado))}
        </span>
      )}
    </div>
  );
}

type InboxListItemProps = {
  message: InboxMessage;
  selected: boolean;
  onSelect: () => void;
};

export function InboxListItem({ message, selected, onSelect }: InboxListItemProps) {
  const name = messageName(message);
  const reserved =
    message._tipo === "cabanas" && message.reserva_estado === "confirmada";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors sm:px-5 ${
        selected
          ? "border-l-2 border-l-primary bg-primary/[0.06] pl-[14px] sm:pl-[18px]"
          : "border-l-2 border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
            message.leido ? "bg-primary/10 text-primary" : "bg-primary text-white"
          }`}
          aria-hidden
        >
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`truncate text-xs ${message.leido ? "font-semibold" : "font-black"} text-slate-900`}>
              {name}
            </p>
            <span className="shrink-0 text-[10px] font-medium text-slate-400">
              {formatRelativeTime(message.fecha_envio)}
            </span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <MessageChannelBadge origen={message.origen} variant="pill" />
            <span className="truncate text-[10px] font-medium text-slate-500">
              {message._tipo === "cabanas"
                ? message.cabana_nombre || "Alojamiento"
                : "Consulta general"}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[11px] leading-relaxed text-slate-500">
            {messageText(message)}
          </p>
          <StayLine message={message} />
          {reserved && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 size={10} /> Reservada
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
