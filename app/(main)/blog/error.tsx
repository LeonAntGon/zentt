"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function BlogError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={28} aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary">Contenido temporalmente no disponible</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No pudimos cargar el blog en este momento. El contenido sigue publicado; probá de nuevo en unos segundos.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <RefreshCw size={16} aria-hidden /> Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50"
          >
            Volver a Zentt
          </Link>
        </div>
      </div>
    </main>
  );
}
