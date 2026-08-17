"use client";

import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink, Eye, Home } from "lucide-react";

type HeroSiteCardProps = {
  slug?: string | null;
  publicUrl: string;
  displayUrl: string;
  cabanasCount: number;
  cabanasMax: number;
  visitsLabel: string;
  copied: boolean;
  onCopy: () => void;
};

export function HeroSiteCard({
  slug,
  publicUrl,
  displayUrl,
  cabanasCount,
  cabanasMax,
  visitsLabel,
  copied,
  onCopy,
}: HeroSiteCardProps) {
  const online = Boolean(slug);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            online
              ? "bg-emerald-50 text-emerald-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              online ? "animate-pulse bg-emerald-500" : "bg-orange-500"
            }`}
          />
          {online ? "Online" : "Pendiente"}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {online ? (
            <>
              <button
                type="button"
                onClick={onCopy}
                aria-label="Copiar enlace"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir sitio"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90"
              >
                <ExternalLink size={16} />
              </a>
            </>
          ) : (
            <Link
              href="/dashboard/configuracion"
              className="inline-flex h-9 items-center rounded-xl bg-primary px-3 text-xs font-semibold text-white"
            >
              Configurar
            </Link>
          )}
        </div>
      </div>

      <p className="truncate px-4 pb-4 text-sm font-semibold text-slate-800">
        {online ? displayUrl : "Configurá el nombre de tu negocio"}
      </p>

      <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-3 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Home size={14} className="text-slate-400" />
          {cabanasCount} / {cabanasMax}{" "}
          {cabanasMax === 1 ? "Alojamiento" : "Alojamientos"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye size={14} className="text-slate-400" />
          {visitsLabel} Visitas
        </span>
      </div>
    </div>
  );
}
