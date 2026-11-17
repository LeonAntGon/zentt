import { Check, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WA_MESSAGES, waHref } from "@/components/landing/whatsapp";

const included = [
  "Página de reservas personalizada para tu alojamiento",
  "Sistema de calendario conectado a WhatsApp",
  "Dominio y puesta en producción",
];

const bfWhatsAppUrl = waHref(WA_MESSAGES.cupo);
const customWhatsAppUrl = waHref(WA_MESSAGES.presupuesto);

const ServicePricingSection = () => {
  return (
    <section id="precios" className="scroll-mt-20 bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary">
            PRECIOS
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Un pago. Tu web lista para la temporada.
          </h2>
          <p className="text-lg text-muted-foreground">
            Sin mensualidades y sin comisiones por reserva. El cobro se coordina
            por fuera, en pesos y con Mercado Pago.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Plan destacado */}
          <article className="relative rounded-2xl border-2 border-primary bg-background p-6 shadow-2xl lg:p-8">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-5 py-1 font-heading text-xs font-semibold text-primary-foreground shadow-md">
              BLACK FRIDAY · HASTA EL 27/11
            </span>

            <h3 className="font-heading text-xl font-bold text-foreground">
              Temporada – Pago único
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Para dueños que quieren dejar de pagar comisiones esta temporada.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
                $290.000
              </span>
              <span className="pb-1 text-lg font-medium text-muted-foreground line-through">
                $390.000
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-primary">
              Precio Black Friday, válido hasta el 27/11
            </p>

            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foreground/80"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border/70 bg-slate-50 p-4">
              <Landmark size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-foreground">
                  Forma de pago:
                </span>{" "}
                Mercado Pago en pesos, 50% de seña y 50% contra entrega.
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="lg"
              className="mt-6 h-12 w-full font-heading font-semibold"
              asChild
            >
              <a href={bfWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-5 w-5" title="" />
                Reservá tu cupo por WhatsApp
              </a>
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Renovación anual opcional (hosting y dominio): $180.000.
            </p>
          </article>

          {/* A medida */}
          <article className="flex flex-col rounded-2xl border border-border/60 bg-background p-6 lg:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </div>
            <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
              A medida
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Complejos o varias unidades
            </p>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              Si tenés un complejo o varias unidades, armamos una propuesta
              según tu caso: lo charlamos por WhatsApp y te paso el presupuesto
              sin compromiso.
            </p>

            <div className="mt-auto pt-6">
              <Button
                variant="hero-outline"
                size="lg"
                className="h-12 w-full"
                asChild
              >
                <a
                  href={customWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="h-5 w-5 text-whatsapp" title="" />
                  Pedí tu presupuesto por WhatsApp
                </a>
              </Button>
            </div>
          </article>
        </div>

        {/* Cierre */}
        <div className="mx-auto mt-16 max-w-4xl rounded-3xl bg-primary px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
            ¿Arrancamos con tu alojamiento?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Te muestro la demo, definimos los detalles y me encargo de dejarla
            andando: dominio, calendario y WhatsApp.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 rounded-xl bg-white font-heading font-semibold text-primary hover:bg-white/90"
            asChild
          >
            <a
              href={waHref(WA_MESSAGES.demo)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5 text-whatsapp" title="" />
              Pedí tu demo por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicePricingSection;
