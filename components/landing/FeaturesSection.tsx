import {
  Globe, CreditCard, CalendarCheck, User, Phone,
  MousePointerClick, BarChart3, TrendingUp, Check
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

/* ── Card visuals ── */

const LeadCardVisual = () => (
  <div className="mt-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/60 p-4 shadow-inner">
    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">
      Panel de leads
    </div>
    <div className="bg-card rounded-lg border border-border/60 shadow-sm p-3">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <User size={16} className="text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-bold text-foreground">Juan Pérez</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold">
              Nuevo lead
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Interesado en Servicio Premium
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Phone size={10} className="text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">+34 612 345 678</span>
          </div>
        </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b358] transition-colors text-primary-foreground rounded-lg py-2 text-xs font-heading font-semibold shadow-sm">
        <WhatsAppIcon className="w-3.5 h-3.5" />
        Contactar por WhatsApp
      </button>
    </div>
  </div>
);

const BookingsVisual = () => (
  <div className="mt-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/60 p-5 shadow-inner">
    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">
      Próxima reserva
    </div>
    <div className="bg-card rounded-xl border border-border/60 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground mb-1">Cliente VIP</div>
          <div className="text-sm font-heading font-bold text-foreground truncate">
            Alejandro Márquez
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold shrink-0">
          <Check size={10} strokeWidth={3} />
          Confirmado
        </span>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border/60">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex flex-col items-center justify-center">
          <span className="text-[7px] font-heading font-bold text-primary leading-none">AGO</span>
          <span className="text-sm font-heading font-bold text-primary leading-none mt-0.5">15</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Viernes · 14:00 h
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 text-[9px] text-muted-foreground">
      <span>3 reservas esta semana</span>
      <span className="text-primary font-semibold">Ver agenda →</span>
    </div>
  </div>
);

const WebsiteVisual = () => (
  <div className="mt-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/60 p-3 shadow-inner">
    {/* Browser chrome */}
    <div className="flex items-center gap-1.5 mb-2 px-1">
      <span className="w-2 h-2 rounded-full bg-destructive/40" />
      <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
      <span className="w-2 h-2 rounded-full bg-green-400/60" />
      <div className="flex-1 h-3 rounded bg-muted mx-2" />
    </div>
    {/* Website preview */}
    <div className="rounded-lg overflow-hidden bg-card border border-border/60">
      <div className="bg-gradient-to-br from-primary via-navy to-accent p-3 relative">
        <div className="text-[8px] text-primary-foreground/70 mb-1">tunegocio.zentt.com</div>
        <div className="text-xs font-heading font-bold text-primary-foreground">
          Servicios Premium
        </div>
        <div className="text-[9px] text-primary-foreground/80 mt-1">
          Experiencia de clase mundial
        </div>
        <div className="mt-2 inline-block bg-primary-foreground text-primary text-[9px] font-heading font-bold px-2 py-1 rounded">
          Reservar ahora
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1.5">
        <div className="aspect-square rounded bg-muted" />
        <div className="aspect-square rounded bg-muted" />
        <div className="aspect-square rounded bg-muted" />
      </div>
    </div>
  </div>
);

const PaymentVisual = () => (
  <div className="mt-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/60 p-4 shadow-inner">
    <div className="rounded-xl bg-gradient-to-br from-navy via-primary to-accent p-4 shadow-lg relative overflow-hidden">
      <div className="absolute top-3 right-3 opacity-30">
        <CreditCard size={40} className="text-primary-foreground" />
      </div>
      <div className="text-[9px] text-primary-foreground/60 uppercase tracking-widest">Link de pago</div>
      <div className="text-xl font-heading font-bold text-primary-foreground mt-1">
        $2,450<span className="text-xs text-primary-foreground/70 ml-1">USD</span>
      </div>
      <div className="text-[9px] text-primary-foreground/60 mt-2">Cliente: Acme Consulting</div>
      <button className="mt-3 w-full bg-primary-foreground text-primary text-[10px] font-heading font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5">
        <MousePointerClick size={10} />
        Copiar link de pago
      </button>
    </div>
    <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
      <span>0% comisiones</span>
      <span className="text-green-600 font-semibold">✓ Cobrado en 2 min</span>
    </div>
  </div>
);

const ReportsVisual = () => {
  const bars = [42, 58, 50, 72, 65, 84, 95];
  return (
    <div className="mt-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/60 p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Ingresos</div>
          <div className="text-sm font-heading font-bold text-foreground">$12,480 <span className="text-[10px] text-green-600 font-semibold ml-1">+24%</span></div>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
          <TrendingUp size={10} /> Este mes
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-md bg-gradient-to-t from-primary to-accent/70"
              style={{ height: `${h}%` }}
            />
            <span className="text-[8px] text-muted-foreground">{["L","M","X","J","V","S","D"][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Card definitions ── */

const cards = [
  {
    span: "lg:col-span-2",
    icons: (
      <div className="flex -space-x-2">
        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
          <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
      </div>
    ),
    title: "Tus clientes a un clic",
    text: "Recibe los datos exactos de tus interesados en tu panel y contáctalos por WhatsApp directamente para cerrar la venta.",
    visual: <LeadCardVisual />,
  },
  {
    span: "lg:col-span-1",
    icons: (
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <CalendarCheck size={20} className="text-primary" />
      </div>
    ),
    title: "Agenda Centralizada",
    text: "Todas tus reservas en un solo lugar. Gestiona tu disponibilidad de forma intuitiva, organiza a tus clientes y opera tu negocio sin depender de plataformas externas.",
    visual: <BookingsVisual />,
  },
  {
    span: "lg:col-span-1",
    icons: (
      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Globe size={20} className="text-accent" />
      </div>
    ),
    title: "Tu propio sitio profesional",
    text: "Un portal web autoadministrable incluido para que tus clientes vean tus servicios y soliciten disponibilidad directamente.",
    visual: <WebsiteVisual />,
  },
  {
    span: "lg:col-span-1",
    icons: (
      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <CreditCard size={20} className="text-green-600" />
      </div>
    ),
    title: "Finanzas claras",
    text: "Genera links de pago rápidos o cobra por transferencia directa. Mantén el 100% de tus ganancias sin comisiones de la plataforma.",
    visual: <PaymentVisual />,
  },
  {
    span: "lg:col-span-1",
    icons: (
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <BarChart3 size={20} className="text-primary" />
      </div>
    ),
    title: "Decisiones con datos",
    text: "Visualiza tus ingresos mensuales, los servicios más solicitados y el rendimiento general de tu negocio en tiempo real.",
    visual: <ReportsVisual />,
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-20 lg:py-28 bg-card relative">
      {/* Ambient */}
      <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold font-heading tracking-wide mb-4">
            EL SISTEMA
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Un ecosistema. <span className="text-primary">Cero fricción.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Herramientas premium pensadas para operar tu negocio como una gran empresa,
            sin la complejidad de un enterprise.
          </p>
        </div>

        {/* Bento asymmetric grid: 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((c, i) => (
            <article
              key={i}
              className={`group relative p-8 rounded-2xl bg-background border border-border/60 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${c.span}`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative">
                <div className="mb-5">{c.icons}</div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                  {c.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {c.text}
                </p>
                {c.visual}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
