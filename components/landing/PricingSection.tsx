"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlanQuotaChip,
  UpgradeProButton,
} from "@/components/billing/PlanConversionUi";
import {
  PaymentProviderSelector,
  usePaymentProvider,
} from "@/components/billing/PaymentProviderSelector";
import { usePlanCheckout } from "@/components/billing/usePlanCheckout";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  formatPlanPrice,
  formatPlanPriceUSD,
  PLAN_LIMITS,
  PLAN_PRICE_PERIOD,
  POLAR_PRICES_USD,
} from "@/lib/planLimits";

type PlanId = "gratis" | "pro" | "complejo";

const plans: {
  id: PlanId;
  name: string;
  desc: string;
  price: number;
  priceLabel: string;
  highlight: string;
  features: string[];
  cta: string;
  popular: boolean;
}[] = [
  {
    id: "gratis",
    name: "Gratis",
    desc: "Para empezar con tu primer alojamiento.",
    price: 0,
    priceLabel: "Gratis",
    highlight: "1 alojamiento",
    features: [
      "Página pública profesional",
      "Calendario de disponibilidad",
      "WhatsApp directo",
      "Sincronización con Airbnb y Booking",
      "Soporte por email",
      "Powered by Zentt",
    ],
    cta: "Empezar Gratis",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    desc: "Para hacer crecer tu alojamiento y cobrar mejor en cada temporada.",
    price: PLAN_LIMITS.pro.priceArs,
    priceLabel: formatPlanPrice(PLAN_LIMITS.pro.priceArs),
    highlight: "Hasta 5 alojamientos",
    features: [
      "Todo lo de Gratis",
      "Precios dinámicos: cobrá más en temporada alta, feriados y findes largos",
      "Métricas de visitas: descubrí cuántos ven tu web y cuántos reservan",
      "Soporte prioritario por email",
    ],
    cta: "Pagar Pro",
    popular: true,
  },
  {
    id: "complejo",
    name: "Complejo",
    desc: "Para complejos que necesitan más capacidad y atención directa.",
    price: PLAN_LIMITS.complejo.priceArs,
    priceLabel: formatPlanPrice(PLAN_LIMITS.complejo.priceArs),
    highlight: "Hasta 15 alojamientos",
    features: ["Todo lo de Pro", "Soporte directo por WhatsApp"],
    cta: "Pagar Complejo",
    popular: false,
  },
];

const PricingSection = () => {
  const { isAuthenticated, user, loading, checkCurrentUser, waitForPlan } = useAuth();
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [polarPrices, setPolarPrices] = useState(POLAR_PRICES_USD);
  const { provider, setProvider, polarEnabled, ready } = usePaymentProvider();
  const { loadingPlan, startCheckout } = usePlanCheckout();
  const selectedProvider = polarEnabled ? provider : "mercadopago";

  const currentPlan = user?.profile?.plan || "gratis";

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ plans?: Array<{ id: string; price_usd?: string | number }> }>(
        "/payments/plans/"
      )
      .then(({ data }) => {
        if (cancelled) return;
        const next = { ...POLAR_PRICES_USD };
        for (const plan of data.plans || []) {
          if (plan.id === "pro" || plan.id === "complejo") {
            const price = Number(plan.price_usd);
            if (Number.isFinite(price) && price > 0) next[plan.id] = price;
          }
        }
        setPolarPrices(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;

    const planParam = params.get("plan");
    const expectedPlan =
      planParam === "pro" || planParam === "complejo" ? planParam : null;
    const provider = params.get("provider");
    let cancelled = false;

    if (payment === "success") {
      toast.success(
        provider === "polar"
          ? "Pago internacional recibido. Confirmando la activación del plan..."
          : "Pago recibido. Confirmando la activación del plan...",
      );
      if (expectedPlan) {
        void waitForPlan(expectedPlan).then((activated) => {
          if (cancelled) return;
          if (activated) {
            toast.success(
              `${expectedPlan === "pro" ? "Plan Pro" : "Plan Complejo"} activado.`
            );
          } else {
            toast.message(
              "El pago fue recibido. La acreditación puede tardar unos segundos; actualizá esta página si todavía ves el plan Gratis."
            );
          }
        });
      } else {
        void checkCurrentUser();
      }
    } else if (payment === "failure") {
      toast.error("El pago no se completó. Podés intentar de nuevo.");
    } else if (payment === "pending") {
      toast.message("El pago quedó pendiente. Te avisamos cuando se acredite.");
    }
    window.history.replaceState({}, "", `${window.location.pathname}#precios`);
    document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" });

    return () => {
      cancelled = true;
    };
  }, [checkCurrentUser, waitForPlan]);

  const handlePlanClick = (planId: PlanId) => {
    if (planId === "gratis") {
      router.push(isAuthenticated ? "/dashboard" : "/register");
      return;
    }
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!user?.email_verified) {
      toast.error("Verificá tu email desde el panel antes de pagar.");
      router.push("/dashboard");
      return;
    }
    startCheckout(planId, selectedProvider);
  };

  return (
    <section id="precios" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold font-heading tracking-wide mb-4">
            PRECIOS
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Planes simples y transparentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Zentt no cobra comisión por tus reservas. Empezá gratis con 1
            alojamiento. Escalá cuando cargues el segundo.
          </p>
        </div>

        {polarEnabled ? (
          <div className="mx-auto mb-8 max-w-xl">
            <PaymentProviderSelector
              provider={provider}
              onChange={setProvider}
              disabled={!ready}
              note="Elegí cómo pagar. Podés cambiarlo antes de continuar."
            />
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrent =
              isAuthenticated && !loading && currentPlan === plan.id;
            const isBusy = loadingPlan === plan.id;
            const isPaidPlan = plan.id === "pro" || plan.id === "complejo";
            const isPolarPrice = isPaidPlan && selectedProvider === "polar";
            const polarPrice =
              plan.id === "pro" || plan.id === "complejo"
                ? polarPrices[plan.id]
                : 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 lg:p-8 ${
                  plan.popular
                    ? "border-primary bg-background shadow-2xl md:scale-[1.02]"
                    : "border-border/50 bg-background hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-primary text-primary-foreground text-xs font-heading font-semibold rounded-full whitespace-nowrap shadow-md">
                    Más popular
                  </span>
                )}

                <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="mb-5 min-h-10 text-sm text-muted-foreground">
                  {plan.desc}
                </p>

                <div className="mb-5">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-heading font-bold text-foreground">
                      Gratis
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-heading font-bold text-foreground">
                        {isPolarPrice
                          ? formatPlanPriceUSD(polarPrice)
                          : plan.priceLabel}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        {isPolarPrice ? "USD / mes" : PLAN_PRICE_PERIOD}
                      </span>
                    </>
                  )}
                </div>

                <PlanQuotaChip className="mb-5" emphasized={plan.popular}>
                  {plan.highlight}
                </PlanQuotaChip>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <Check size={16} className="text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent && plan.id === "gratis" ? (
                  <Button
                    variant="hero-outline"
                    className="w-full"
                    size="lg"
                    disabled
                  >
                    Tu plan actual
                  </Button>
                ) : plan.id === "gratis" && !isAuthenticated && !loading ? (
                  <Button
                    variant="hero-outline"
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                ) : plan.id === "gratis" ? (
                  <Button
                    variant="hero-outline"
                    className="w-full"
                    size="lg"
                    disabled
                  >
                    Plan base
                  </Button>
                ) : plan.popular ? (
                  <UpgradeProButton
                    className="h-12 w-full"
                    showPulse
                    loading={isBusy}
                    disabled={loading || loadingPlan !== null}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {isBusy
                      ? "Procesando..."
                      : isCurrent
                        ? "Renovar 1 mes"
                        : plan.cta}
                  </UpgradeProButton>
                ) : (
                  <Button
                    variant="hero-outline"
                    className="w-full"
                    size="lg"
                    disabled={loading || loadingPlan !== null}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {isBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCurrent ? (
                      "Renovar 1 mes"
                    ) : (
                      plan.cta
                    )}
                  </Button>
                )}
                {plan.price > 0 && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    {selectedProvider === "polar"
                      ? "Pago en USD vía Polar"
                      : "Pago en ARS vía Mercado Pago"}{" "}
                    · 30 días, sin renovación automática.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {polarEnabled
            ? "Elegí Mercado Pago en ARS o Polar en USD. Acceso por 30 días, sin renovación automática: renovás solo si querés."
            : "Acceso por 30 días, sin renovación automática: renovás solo si querés."}
        </p>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            ¿Listo para recibir reservas directas?
          </h2>
          <Button variant="hero" className="mt-6 rounded-xl" size="lg" asChild>
            <Link href="/register">Creá tu página gratis</Link>
          </Button>
        </div>
      </div>

      <ConfirmActionModal
        open={loginModalOpen}
        title="Primero, iniciemos sesión"
        body="Para contratar un plan pago necesitás una cuenta. Iniciá sesión y continuá con el pago que elegiste."
        confirmLabel="Iniciar sesión"
        cancelLabel="Cancelar"
        onConfirm={() => {
          router.push(`/login?next=${encodeURIComponent("/#precios")}`);
        }}
        onClose={() => setLoginModalOpen(false)}
      />
    </section>
  );
};

export default PricingSection;
