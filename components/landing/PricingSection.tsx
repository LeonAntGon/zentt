import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Básico",
    desc: "Ideal para empezar a recibir reservas directas sin inversión.",
    price: 0,
    highlight: "Hasta 2 alojamientos",
    features: [
      "Web pública profesional",
      "Calendario de disponibilidad",
      "Botón directo a WhatsApp",
      "Soporte por email",
    ],
    cta: "Empezar Gratis",
    popular: false,
  },
  {
    name: "Pro",
    desc: "Para anfitriones que quieren escalar su negocio sin límites.",
    price: 29,
    highlight: "Alojamientos ilimitados",
    features: [
      "Sincronización bidireccional con Airbnb",
      "Precios dinámicos por temporada",
      "Cobros con tarjeta integrados",
      "Automatizaciones avanzadas",
      "Reportes y analíticas",
      "Soporte 24/7 prioritario",
    ],
    cta: "Probar Plan Pro",
    popular: true,
  },
];

const PricingSection = () => {
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
            Empieza gratis. Escala cuando estés listo. Lo que cobres a tus
            huéspedes es 100% tuyo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-10 rounded-2xl border-2 transition-all duration-300 ${
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

              <h3 className="text-2xl font-heading font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                {plan.desc}
              </p>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-5xl font-heading font-bold text-foreground">
                    Gratis
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-heading font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">/mes</span>
                  </>
                )}
              </div>

              <div
                className={`mb-6 px-4 py-2.5 rounded-lg text-sm font-semibold text-center ${
                  plan.popular
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground"
                }`}
              >
                {plan.highlight}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-foreground/80"
                  >
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "hero-outline"}
                className="w-full"
                size="lg"
                asChild
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sin tarjeta de crédito. Sin compromiso. Cancela cuando quieras.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
