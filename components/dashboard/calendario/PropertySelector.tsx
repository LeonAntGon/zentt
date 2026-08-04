"use client";

import { Cabana } from "@/types/cabin";
import { getMediaUrl } from "@/lib/media";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertySelectorProps = {
  cabanas: Cabana[];
  selectedId: number | "all";
  onSelect: (id: number | "all") => void;
};

export function PropertySelector({
  cabanas,
  selectedId,
  onSelect,
}: PropertySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={cn(
          "inline-flex shrink-0 items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all",
          selectedId === "all"
            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            selectedId === "all" ? "bg-white/15" : "bg-slate-100"
          )}
        >
          <Building2
            size={14}
            className={selectedId === "all" ? "text-white" : "text-slate-500"}
          />
        </span>
        Todos los alojamientos
      </button>

      {cabanas.map((c) => {
        const active = selectedId === c.id;
        const photo = getMediaUrl(c.imagen_portada);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all",
              active
                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {photo ? (
              <img
                src={photo}
                alt=""
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                  active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {c.nombre.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="max-w-[140px] truncate">{c.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
