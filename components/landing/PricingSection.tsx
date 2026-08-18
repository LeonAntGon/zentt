"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { formatPlanPrice, PLAN_LIMITS, PLAN_PRICE_PERIOD } from "@/lib/planLimits";

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
    desc: "Para administrar y hacer crecer varios alojamientos.",
    price: PLAN_LIMITS.pro.priceArs,
    priceLabel: formatPlanPrice(PLAN_LIMITS.pro.priceArs),
    highlight: "Hasta 5 alojamientos",
    features: [
      "Todo lo de Gratis",
      "Tarifas por fecha y temporada",
      "Analytics avanzadas",
      "Soporte prioritario",
    ],
    cta: "Suscribirme a Pro",
    popular: true,
  },
  {
    id: "complejo",
    name: "Complejo",
    desc: "Para complejos con varios alojamientos en un solo panel.",
    price: PLAN_LIMITS.complejo.priceArs,
    priceLabel: formatPlanPrice(PLAN_LIMITS.complejo.priceArs),
    highlight: "Hasta 15 alojamientos",
    features: ["Todo lo de Pro", "Soporte prioritario"],
    cta: "Suscribirme a Complejo",
    popular: false,
  },
];

const PricingSection = () => {
  const { isAuthenticated, user, loading, checkCurrentUser } = useAuth();
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);

  const currentPlan = user?.profile?.plan || "gratis";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;
    if (payment === "success") {
      toast.success("Pago recibido. Actualizamos tu plan en unos segundos.");
      void checkCurrentUser();
    } else if (payment === "failure") {
      toast.error("El pago no se completó. Podés intentar de nuevo.");
    } else if (payment === "pending") {
      toast.message("El pago quedó pendiente. Te avisamos cuando se acredite.");
    }
    window.history.replaceState({}, "", `${window.location.pathname}#precios`);
    document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" });
  }, [checkCurrentUser]);

  const startCheckout = async (plan: "pro" | "complejo") => {
    if (!user?.email_verified) {
      toast.error(
        "Verificá tu email desde el panel antes de suscribirte."
      );
      router.push("/dashboard");
      return;
    }
    setCheckoutLoading(plan);
    try {
      const { data } = await api.post<{
        checkout_url?: string;
        init_point?: string;
        sandbox_init_point?: string;
      }>("/payments/create-subscription/", { plan });
      const url =
        data.checkout_url || data.init_point || data.sandbox_init_point;
      if (!url) {
        toast.error("No pudimos iniciar el pago.");
        return;
      }
      window.location.href = url;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        toast.error(
          String(
            err.response.data?.detail ||
              "Verificá tu email desde el panel antes de suscribirte."
          )
        );
        router.push("/dashboard");
      } else if (axios.isAxiosError(err) && err.response?.status === 503) {
        toast.error("MercadoPago todavía no está configurado.");
      } else {
        toast.error("No pudimos iniciar el pago. Probá de nuevo.");
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePlanClick = (planId: PlanId) => {
    if (planId === "gratis") {
      router.push(isAuthenticated ? "/dashboard" : "/register");
      return;
    }
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    void startCheckout(planId);
  };

  return (
    <section id="precios" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold font-heading tracking-wide mb-4">
            PRECIOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planes simples y transparentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Zentt no cobra comisión por tus reservas. Empezá gratis con 1
            alojamiento. Escalá cuando cargues el segundo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrent =
              isAuthenticated && !loading && currentPlan === plan.id;
            const isBusy = checkoutLoading === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular
                    ? "border-primary bg-background shadow-2xl scale-[1.02]"
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
                <p className="text-muted-foreground text-sm mb-5 min-h-[40px]">
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
                        {plan.priceLabel}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        {PLAN_PRICE_PERIOD}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`mb-5 px-3 py-2 rounded-lg text-sm font-semibold text-center ${
                    plan.popular
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {plan.highlight}
                </div>

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

                {isCurrent ? (
                  <Button
                    variant={plan.popular ? "hero" : "hero-outline"}
                    className="w-full"
                    size="lg"
                    disabled
                  >
                    Tu plan actual
                  </Button>
                ) : plan.id === "gratis" && !isAuthenticated && !loading ? (
                  <Button
                    variant={plan.popular ? "hero" : "hero-outline"}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "hero" : "hero-outline"}
                    className="w-full"
                    size="lg"
                    disabled={loading || checkoutLoading !== null}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {isBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                )}
                {plan.price > 0 && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Pago seguro y automático vía Mercado Pago
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Se renueva cada mes con Mercado Pago. Podés cancelar la renovación
          cuando quieras desde tu cuenta.
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
        body="Para contratar un plan pago necesitás una cuenta. Iniciá sesión y volvé a elegir el plan."
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
