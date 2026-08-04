"use client";

import { CheckCheck, ChevronDown, Search } from "lucide-react";

export type InboxTab = "todas" | "sin_leer" | "con_fechas";
export type InboxChannel = "all" | "WEB" | "WA" | "AIRBNB";

type CabinOption = { id: number; nombre: string };

type InboxFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  channel: InboxChannel;
  onChannelChange: (channel: InboxChannel) => void;
  cabanaId: string;
  onCabanaChange: (id: string) => void;
  cabanas: CabinOption[];
  unreadCount: number;
  onMarkAllRead: () => void;
  markingAllRead: boolean;
};

export function InboxFilters({
  search,
  onSearchChange,
  tab,
  onTabChange,
  channel,
  onChannelChange,
  cabanaId,
  onCabanaChange,
  cabanas,
  unreadCount,
  onMarkAllRead,
  markingAllRead,
}: InboxFiltersProps) {
  return (
    <div className="border-b border-slate-100 bg-white p-3 sm:p-4">
      <label className="relative block">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, mail, teléfono o mensaje"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </label>

      <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
        {(
          [
            ["todas", "Todas"],
            ["sin_leer", "Sin leer"],
            ["con_fechas", "Con fechas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
              tab === id
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {label}
            {id === "sin_leer" && unreadCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  tab === id ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          disabled={unreadCount === 0 || markingAllRead}
          onClick={onMarkAllRead}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={13} />
          <span className="hidden xl:inline">Marcar todo leído</span>
          <span className="xl:hidden">Leer todo</span>
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="relative block">
          <select
            value={channel}
            onChange={(event) => onChannelChange(event.target.value as InboxChannel)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[11px] font-semibold text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">Todos los canales</option>
            <option value="WEB">Web</option>
            <option value="WA">WhatsApp</option>
            <option value="AIRBNB">Airbnb</option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>
        <label className="relative block">
          <select
            value={cabanaId}
            onChange={(event) => onCabanaChange(event.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[11px] font-semibold text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">Todos los alojamientos</option>
            {cabanas.map((cabana) => (
              <option key={cabana.id} value={cabana.id}>
                {cabana.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>
      </div>
    </div>
  );
}
