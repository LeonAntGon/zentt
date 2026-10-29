"use client";

import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatPlanPrice,
  formatPlanPriceUSD,
  normalizePlan,
  PLAN_LIMITS,
  PLAN_PRICE_PERIOD,
  POLAR_PRICES_USD,
} from "@/lib/planLimits";
import { ZenttMarkIcon } from "@/components/icons/ZenttMarkIcon";
import {
  PlanQuotaChip,
  UpgradeProButton,
} from "@/components/billing/PlanConversionUi";
import {
  PaymentProviderSelector,
  usePaymentProvider,
} from "@/components/billing/PaymentProviderSelector";
import {
  usePlanCheckout,
  type PaidPlan,
} from "@/components/billing/usePlanCheckout";
import { INTERNATIONAL_WHATSAPP_DISPLAY } from "@/lib/internationalPayments";

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
    price: PLAN_LIMITS.pro.priceArs,
    highlight: "Hasta 5 alojamientos",
    features: [
      "Todo lo de Gratis",
      "Precios dinámicos: cobrá más en temporada alta, feriados y findes largos",
      "Sin marca de agua",
      "Métricas de visitas: descubrí cuántos ven tu web y cuántos reservan",
      "Soporte prioritario por email",
    ],
  },
  {
    id: "complejo",
    name: "Complejo",
    price: PLAN_LIMITS.complejo.priceArs,
    highlight: "Hasta 15 alojamientos",
    features: ["Todo lo de Pro", "Soporte directo por WhatsApp"],
  },
];

export function UpgradePricingModal({
  open,
  onClose,
  title = "Escalá tus reservas con Zentt Pro",
  body = `Agregá más alojamientos, quitá la marca de agua y sincronizá precios dinámicos. Acceso por 30 días, sin renovación automática.`,
}: UpgradePricingModalProps) {
  const { user } = useAuth();
  const { provider, setProvider, internationalEnabled, ready } = usePaymentProvider();
  const { loadingPlan, startCheckout } = usePlanCheckout();
  const currentPlan = normalizePlan(user?.profile?.plan);
  const selectedProvider = internationalEnabled ? provider : "mercadopago";

  if (!open) return null;

  const proPlan = PAID_PLANS.find((p) => p.id === "pro")!;
  const complejoPlan = PAID_PLANS.find((p) => p.id === "complejo")!;

  const renderPrice = (plan: PaidPlan) => (
    <>
      {selectedProvider === "polar"
        ? formatPlanPriceUSD(POLAR_PRICES_USD[plan])
        : formatPlanPrice(PLAN_LIMITS[plan].priceArs)}
      <span className="ml-1 text-[10px] font-semibold text-slate-400">
        {selectedProvider === "polar" ? "USD / mes" : PLAN_PRICE_PERIOD}
      </span>
    </>
  );

  const renderPaymentNote = () => (
    <p className="mt-2 text-center text-xs text-gray-500">
      {selectedProvider === "polar"
        ? `Pago internacional por WhatsApp (${INTERNATIONAL_WHATSAPP_DISPLAY})`
        : "Pago en ARS vía Mercado Pago"}{" "}
      · 30 días, sin renovación automática.
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pricing-title"
      onClick={loadingPlan ? undefined : onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loadingPlan !== null}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ZenttMarkIcon size={20} />
        </div>
        <h2
          id="upgrade-pricing-title"
          className="pr-8 text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>

        {internationalEnabled ? (
          <PaymentProviderSelector
            className="mt-5"
            provider={provider}
            onChange={setProvider}
            disabled={!ready}
            note="Elegí cómo pagar. Podés cambiarlo antes de continuar."
          />
        ) : null}

        <div className="mt-5 space-y-3">
          {/* Pro — CTA principal */}
          {(() => {
            const plan = proPlan;
            const isCurrent = currentPlan === plan.id;
            const isBusy = loadingPlan === plan.id;
            return (
              <div className="rounded-2xl border border-slate-900/15 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                    <PlanQuotaChip className="mt-1.5 text-xs" emphasized>
                      {plan.highlight}
                    </PlanQuotaChip>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {renderPrice(plan.id)}
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
                <UpgradeProButton
                  className="mt-3 h-11 w-full"
                  showPulse={!isCurrent}
                  loading={isBusy}
                  disabled={loadingPlan !== null}
                  onClick={() =>
                    startCheckout(plan.id, selectedProvider, {
                      priceUsd: POLAR_PRICES_USD[plan.id],
                    })
                  }
                >
                  {isBusy ? "Procesando..." : isCurrent ? "Renovar 1 mes" : "Pagar Pro"}
                </UpgradeProButton>
                {renderPaymentNote()}
              </div>
            );
          })()}

          {/* Complejo — secundario / outline */}
          {(() => {
            const plan = complejoPlan;
            const isCurrent = currentPlan === plan.id;
            const isBusy = loadingPlan === plan.id;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                    <PlanQuotaChip className="mt-1.5 text-xs">
                      {plan.highlight}
                    </PlanQuotaChip>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {renderPrice(plan.id)}
                  </p>
                </div>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <Check size={12} className="shrink-0 text-slate-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={() =>
                    startCheckout(plan.id, selectedProvider, {
                      priceUsd: POLAR_PRICES_USD[plan.id],
                    })
                  }
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-transparent text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  {isBusy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isCurrent ? (
                    "Renovar Complejo"
                  ) : currentPlan === "pro" ? (
                    "Pasar a Complejo"
                  ) : (
                    "Pagar Complejo"
                  )}
                </button>
                {renderPaymentNote()}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
