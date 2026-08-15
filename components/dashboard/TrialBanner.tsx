"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function TrialBanner({ plan }: { dateJoined?: string; plan?: string }) {
  if (plan !== "gratis") return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-slate-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 shrink-0 text-primary" size={18} />
        <div>
          <p className="text-sm font-semibold">Plan gratis: 1 alojamiento.</p>
          <p className="text-xs text-slate-600">
            Pasate a Pro para agregar más alojamientos y ver analytics detalladas.
          </p>
        </div>
      </div>
      <Link
        href="/#precios"
        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        Ver planes <ArrowRight size={14} />
      </Link>
    </div>
  );
}
