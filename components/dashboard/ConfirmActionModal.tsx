"use client";

import { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";

type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  closeOnConfirm?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmActionModal({
  open,
  title,
  body,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  loading = false,
  closeOnConfirm = true,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => {
      confirmRef.current?.focus();
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 focus-visible:ring-red-500/50"
      : "bg-primary hover:bg-primary/90 focus-visible:ring-primary/40";

  const handleConfirm = async () => {
    await onConfirm();
    if (closeOnConfirm) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-modal-title"
      aria-describedby="confirm-action-modal-body"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <h2
          id="confirm-action-modal-title"
          className="pr-8 text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p
          id="confirm-action-modal-body"
          className="mt-2 text-sm leading-relaxed text-slate-500"
        >
          {body}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${confirmClass}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
