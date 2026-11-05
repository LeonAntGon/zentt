"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsentChoice,
} from "@/lib/cookieConsent";

export function CookieConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [choice, setChoice] = useState<CookieConsentChoice | null | undefined>(
    undefined
  );

  useEffect(() => {
    setChoice(getCookieConsent());
  }, []);

  if (!measurementId) return null;
  if (choice !== null) return null;

  const choose = (value: CookieConsentChoice) => {
    setCookieConsent(value);
    setChoice(value);
  };

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md"
      role="dialog"
      aria-label="Preferencias de cookies"
    >
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              Cookies y analítica
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Usamos cookies propias y de terceros (Google Analytics) para
              analizar cómo se usa el sitio y mejorar la experiencia. Podés
              aceptar o rechazar las cookies no esenciales.
            </p>
            <Link
              href="/privacy"
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Política de privacidad
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
