"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeBannerProps {
  feature?: string;
  planRequired?: string;
  title?: string;
  description?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  complejo: "Complejo",
};

export function UpgradeBanner({
  feature,
  planRequired = "pro",
  title,
  description,
  variant = "default",
  className = "",
}: UpgradeBannerProps) {
  const planLabel = PLAN_LABELS[planRequired] || "Pro";

  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-800 ${className}`}
      >
        <Lock size={14} className="shrink-0" />
        <span>
          Disponible en plan <span className="font-semibold">{planLabel}</span>
        </span>
        <Link
          href="/dashboard/configuracion#planes"
          className="ml-1 font-semibold text-amber-900 underline hover:no-underline"
        >
          Actualizar
        </Link>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles size={16} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            {feature ? (
              <>
                <span className="font-semibold">{feature}</span> disponible en
                plan {planLabel}
              </>
            ) : (
              <>Actualiza a {planLabel} para desbloquear esta función</>
            )}
          </p>
        </div>
        <Button variant="default" size="sm" asChild>
          <Link href="/dashboard/configuracion#planes">
            Ver planes <ArrowRight size={14} className="ml-1" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            {title || `Actualiza a ${planLabel}`}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {description ||
              (feature
                ? `Desbloquea ${feature} y otras funciones avanzadas con el plan ${planLabel}.`
                : `Accede a funciones avanzadas actualizando tu plan a ${planLabel}.`)}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="default" asChild>
              <Link href="/dashboard/configuracion#planes">
                Ver planes <ArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
