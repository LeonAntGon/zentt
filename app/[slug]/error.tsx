"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { CloudOff } from "lucide-react";

/**
 * Se muestra si el backend no responde en la PRIMERA carga de una página
 * pública. En revalidaciones posteriores, si el backend falla, Next sigue
 * sirviendo la última versión buena en caché.
 */
export default function PublicSiteError({ reset }: { reset: () => void }) {
  const router = useRouter();
  // router.refresh() vuelve a pedir el render al servidor; reset() limpia el error.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 text-center">
      <div className="max-w-md">
        <CloudOff size={56} className="mx-auto mb-6 text-slate-200" />
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Sitio público
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          No pudimos cargar el sitio
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-500">
          Estamos teniendo problemas para contactar al servidor. Esto suele durar unos segundos.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            Volver a Zentt
          </Link>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
