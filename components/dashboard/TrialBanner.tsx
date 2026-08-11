"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function TrialBanner({ dateJoined, plan }: { dateJoined?: string; plan?: string }) {
  if (plan !== "gratis" || !dateJoined) return null;

  const expiresAt = new Date(dateJoined).getTime() + 14 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysRemaining <= 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
        <div>
          <p className="text-sm font-semibold">
            Tu prueba gratuita vence en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
          </p>
          <p className="text-xs text-amber-800">Aprovechá estos días para completar tu sitio.</p>
        </div>
      </div>
      <Link href="/dashboard/configuracion" className="inline-flex items-center gap-1 text-sm font-bold text-amber-900 hover:underline">
        Ver configuración <ArrowRight size={14} />
      </Link>
    </div>
  );
}
