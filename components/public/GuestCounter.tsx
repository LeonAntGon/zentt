"use client";

import { Minus, Plus } from "lucide-react";

type GuestCounterProps = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function GuestCounter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Restar ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-slate-900">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Sumar ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
