import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Gratis",
    desc: "Ideal para empezar a recibir reservas directas sin inversión.",
    price: 0,
    priceLabel: "Gratis",
    highlight: "1 alojamiento",
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
    desc: "Para anfitriones que quieren crecer y profesionalizarse.",
    price: 9900,
    priceLabel: "$9.900",
    highlight: "Hasta 5 alojamientos",
    features: [
      "Sincronización con Airbnb y Booking",
      "Precios dinámicos por temporada",
      "Analytics detalladas de tu web",
      "Soporte prioritario por email",
    ],
    cta: "Empezar con Pro",
    popular: true,
  },
  {
    name: "Complejo",
    desc: "Para complejos con varios alojamientos en un solo panel.",
    price: 19900,
    priceLabel: "$19.900",
    highlight: "Hasta 15 alojamientos",
    features: [
      "Todo lo de Pro",
      "Hasta 15 alojamientos",
      "Soporte prioritario 24/7",
      "Multi-usuario (próximamente)",
    ],
    cta: "Elegir Complejo",
    popular: false,
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
            Empezá gratis con 1 alojamiento. Escalá cuando cargues el segundo.
            Lo que cobres a tus huéspedes es 100% tuyo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
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
                      cada 30 días
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
          Empezá gratis con 1 alojamiento. Sin tarjeta. Escalá cuando cargues el
          segundo. Los planes pagos son un cobro único por 30 días; se renuevan
          desde Configuración.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
