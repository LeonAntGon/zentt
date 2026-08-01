"use client";

import {
  AMENITY_CATEGORIES,
  AMENITY_OPTIONS,
  type AmenityId,
} from "@/lib/amenities";
import { cabanaLabelClass } from "@/components/dashboard/cabana-form-styles";

type AmenityPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function AmenityPicker({ value, onChange }: AmenityPickerProps) {
  const selected = new Set(value);

  const toggle = (id: AmenityId) => {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div>
      <p className={cabanaLabelClass}>Comodidades</p>
      <p className="mb-4 text-xs text-slate-400">
        Marcá lo que ofrece este alojamiento. Se muestra en tu sitio público.
      </p>
      <div className="space-y-5">
        {AMENITY_CATEGORIES.map((cat) => {
          const options = AMENITY_OPTIONS.filter((o) => o.category === cat.id);
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
      </div>
    </div>
  );
}
