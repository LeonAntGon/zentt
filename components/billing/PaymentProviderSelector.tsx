"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentProvider = "mercadopago" | "polar";

export const isPolarCheckoutEnabled =
  process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ENABLED === "true";

const STORAGE_KEY = "zentt.paymentProvider";
const PROVIDER_EVENT = "zentt:payment-provider";

const OPTIONS = [
  {
    id: "mercadopago" as const,
    label: "Mercado Pago",
    detail: "Pesos argentinos (ARS)",
    icon: CreditCard,
  },
  {
    id: "polar" as const,
    label: "Internacional",
    detail: "Dólares (USD) · Polar",
    icon: Globe2,
  },
];

function isArgentinaTimeZone(timeZone: string): boolean {
  return (
    timeZone.startsWith("America/Argentina/") ||
    timeZone === "America/Buenos_Aires"
  );
}

function getDefaultPaymentProvider(): PaymentProvider {
  if (!isPolarCheckoutEnabled || typeof window === "undefined") {
    return "mercadopago";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "mercadopago" || stored === "polar") return stored;
  } catch {
    // localStorage can be unavailable in private browsing or embedded webviews.
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      return isArgentinaTimeZone(timeZone) ? "mercadopago" : "polar";
    }
  } catch {
    // Fall through to the browser language heuristic.
  }

  return window.navigator.language?.toLowerCase() === "es-ar"
    ? "mercadopago"
    : "polar";
}

export function usePaymentProvider() {
  const [provider, setProviderState] = useState<PaymentProvider>("mercadopago");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProviderState(getDefaultPaymentProvider());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!isPolarCheckoutEnabled) return;

    const sync = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        (event.detail === "mercadopago" || event.detail === "polar")
      ) {
        setProviderState(event.detail);
        return;
      }
      setProviderState(getDefaultPaymentProvider());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(PROVIDER_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROVIDER_EVENT, sync);
    };
  }, []);

  const setProvider = useCallback((next: PaymentProvider) => {
    setProviderState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the in-memory choice even if persistence is unavailable.
    }
    window.dispatchEvent(
      new CustomEvent<PaymentProvider>(PROVIDER_EVENT, { detail: next })
    );
  }, []);

  return {
    provider: isPolarCheckoutEnabled ? provider : "mercadopago",
    setProvider,
    polarEnabled: isPolarCheckoutEnabled,
    ready,
  };
}

type PaymentProviderSelectorProps = {
  provider: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
  disabled?: boolean;
  className?: string;
  note?: string;
};

export function PaymentProviderSelector({
  provider,
  onChange,
  disabled = false,
  className,
  note,
}: PaymentProviderSelectorProps) {
  if (!isPolarCheckoutEnabled) return null;

  return (
    <div className={cn("w-full", className)}>
      <div
        role="radiogroup"
        aria-label="Medio de pago"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {OPTIONS.map((option) => {
          const active = provider === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left transition-all",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold">
                  {option.label}
                </span>
                <span
                  className={cn(
                    "block truncate text-[10px] font-medium",
                    active ? "text-white/75" : "text-slate-400"
                  )}
                >
                  {option.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {note ? (
        <p className="mt-2 text-center text-xs text-slate-500">{note}</p>
      ) : null}
    </div>
  );
}
