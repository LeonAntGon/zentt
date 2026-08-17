"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type FormStickySaveBarProps = {
  /** Cantidad de campos requeridos faltantes; 0 = todo listo. */
  missingCount?: number;
  /** Texto de estado en curso (opcional; se muestra a la izquierda). */
  statusText?: string;
  /** Label del botón primario. */
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  form?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  /** Contenido extra (chips, warnings, links). */
  children?: ReactNode;
};

export function FormStickySaveBar({
  missingCount = 0,
  statusText,
  submitLabel = "Guardar cambios",
  loadingLabel = "Guardando...",
  loading = false,
  disabled = false,
  form,
  onCancel,
  cancelLabel = "Cancelar",
  children,
}: FormStickySaveBarProps) {
  const hasMissing = missingCount > 0;

  return (
    <div
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md md:bottom-0 md:left-52"
      role="region"
      aria-label="Barra de guardado"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-xs">
          {loading ? (
            <span className="inline-flex items-center gap-2 font-semibold text-primary">
              <Loader2 size={14} className="animate-spin" />
              {statusText || loadingLabel}
            </span>
          ) : hasMissing ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600">
              {missingCount} {missingCount === 1 ? "campo requerido" : "campos requeridos"} sin completar
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600">
              Todo listo para guardar
            </span>
          )}
          {children}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            form={form}
            disabled={disabled || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? loadingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
