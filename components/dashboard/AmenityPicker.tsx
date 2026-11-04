"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  AMENITY_CATEGORIES,
  AMENITY_OPTIONS,
  filterAmenities,
  type AmenityId,
} from "@/lib/amenities";
import { cabanaLabelClass } from "@/components/dashboard/cabana-form-styles";

type AmenityPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function AmenityPicker({ value, onChange }: AmenityPickerProps) {
  const [query, setQuery] = useState("");
  const selected = new Set(value);

  const toggle = (id: AmenityId) => {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const filtered = useMemo(() => filterAmenities(query), [query]);
  const selectedOptions = AMENITY_OPTIONS.filter((option) =>
    selected.has(option.id)
  );

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={cabanaLabelClass}>Comodidades</p>
          <p className="text-xs text-slate-400">
            Marcá lo que ofrece este alojamiento. Se muestra en tu sitio público.
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          {value.length} seleccionada{value.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="relative mt-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar comodidad (ej. muelle, parrilla, aire)"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Buscar comodidad"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {selectedOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
              title={`Quitar ${option.label}`}
            >
              {option.label}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-5">
        {AMENITY_CATEGORIES.map((cat) => {
          const options = filtered.filter((o) => o.category === cat.id);
          if (options.length === 0) return null;
          return (
            <div key={cat.id}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {cat.label}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((opt) => {
                  const checked = selected.has(opt.id);
                  const Icon = opt.icon;
                  return (
                    <label
                      key={opt.id}
                      className={`relative flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        checked
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {/*
                        No usar sr-only: al recibir focus el browser hace
                        scroll-into-view hacia el input clippeado y salta la página.
                        El input cubre el label (opacity 0) para mantener el focus en caja.
                      */}
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(opt.id)}
                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                        aria-label={opt.label}
                      />
                      <Icon
                        size={16}
                        className={`pointer-events-none shrink-0 ${
                          checked ? "text-primary" : "text-slate-400"
                        }`}
                      />
                      <span className="pointer-events-none font-medium leading-tight">
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No encontramos comodidades con “{query}”.
          </div>
        )}
      </div>
    </div>
  );
}
