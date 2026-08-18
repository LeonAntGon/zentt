"use client";

import { useState } from "react";
import axios from "axios";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrencyCompact, normalizePlan } from "@/lib/planLimits";

type PaidPlan = "pro" | "complejo";

type UpgradePricingModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
};

const PAID_PLANS: {
  id: PaidPlan;
  name: string;
  price: number;
  highlight: string;
  features: string[];
}[] = [
  {
    id: "pro",
    name: "Pro",
    price: 9900,
    highlight: "Hasta 5 alojamientos",
    features: [
      "Todo lo de Gratis",
      "Tarifas por fecha y temporada",
      "Analytics avanzadas",
      "Soporte prioritario",
    ],
  },
  {
    id: "complejo",
    name: "Complejo",
    price: 19900,
    highlight: "Hasta 15 alojamientos",
    features: ["Todo lo de Pro", "Soporte prioritario"],
  },
];

export function UpgradePricingModal({
  open,
  onClose,
  title = "Pasate a Pro",
  body = "Cada pago cubre 30 días de servicio. Podés renovar cuando quieras desde tu cuenta. No hay débito automático.",
}: UpgradePricingModalProps) {
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<PaidPlan | null>(null);
  const currentPlan = normalizePlan(user?.profile?.plan);

  const startCheckout = async (plan: PaidPlan) => {
    setCheckoutLoading(plan);
    try {
      const { data } = await api.post<{
        checkout_url?: string;
        init_point?: string;
        sandbox_init_point?: string;
      }>("/payments/create-preference/", { plan });
      const url =
        data.checkout_url || data.init_point || data.sandbox_init_point;
      if (!url) {
        toast.error("No pudimos iniciar el pago.");
        return;
      }
      window.location.href = url;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        toast.error("MercadoPago todavía no está configurado.");
      } else {
        toast.error("No pudimos iniciar el pago. Probá de nuevo.");
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pricing-title"
      onClick={checkoutLoading ? undefined : onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={checkoutLoading !== null}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles size={18} />
        </div>
        <h2
          id="upgrade-pricing-title"
          className="pr-8 text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>

        <div className="mt-5 space-y-3">
          {PAID_PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isBusy = checkoutLoading === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 ${
                  plan.id === "pro"
                    ? "border-primary/30 bg-primary/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.highlight}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrencyCompact(plan.price)}
                    <span className="ml-1 text-[10px] font-semibold text-slate-400">
                      / 30 días
                    </span>
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <Check size={12} className="shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={checkoutLoading !== null || isCurrent}
                  onClick={() => void startCheckout(plan.id)}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isBusy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isCurrent ? (
                    "Tu plan actual"
                  ) : currentPlan === "pro" && plan.id === "complejo" ? (
                    "Pasar a Complejo"
                  ) : (
                    `Elegir ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
