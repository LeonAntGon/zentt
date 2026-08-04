"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <AlertTriangle size={28} />
      </div>
      <div>
        <h2 className="page-title text-xl sm:text-2xl">Algo salió mal</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Ocurrió un error inesperado en esta sección. Recargá para seguir
          trabajando.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95"
      >
        <RefreshCw size={16} />
        Recargar página
      </button>
    </div>
  );
}
