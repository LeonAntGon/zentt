"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] Error boundary:", error);
    toast.error("Ocurrió un error en esta sección.");
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle size={28} />
      </div>
      <div>
        <h2 className="page-title text-xl sm:text-2xl">Algo salió mal</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Esta sección no se pudo cargar. Podés reintentar o volver al inicio
          del panel.
        </p>
        {error?.digest && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-300">
            id: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-95"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
