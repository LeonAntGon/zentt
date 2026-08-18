"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Check, ChevronRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";
import { BookingIcon } from "@/components/icons/BookingIcon";
import { PublicSitePhoneMockup } from "@/components/landing/PublicSitePhoneMockup";
import { formatCurrencyCompact } from "@/lib/planLimits";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkVisual() {
  return (
    <div className="mt-6 flex justify-center">
      <PublicSitePhoneMockup compact showBioChip={false} />
    </div>
  );
}

function InquiryVisual() {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            CR
          </div>
          <p className="truncate text-sm font-bold text-slate-900">Camila R.</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          WEB
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-slate-500">
        Alojamiento del Bosque · 12 oct – 14 oct · 3 noches
      </p>
      <p className="mt-1 truncate text-sm text-slate-600">
        Hola, ¿tenés disponibilidad para esas fechas?
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-lg font-bold text-emerald-600">
          {formatCurrencyCompact(252000)}
        </p>
        <p className="text-[11px] text-slate-400">hace 8 h</p>
      </div>
      <div className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp text-sm font-bold text-whatsapp-foreground">
        <WhatsAppIcon className="h-5 w-5" />
        Responder por WhatsApp
      </div>
    </div>
  );
}

function CalendarVisual() {
  const days = [
    { n: 10, blocked: false },
    { n: 11, blocked: false },
    { n: 12, blocked: true },
    { n: 13, blocked: true },
    { n: 14, blocked: true },
    { n: 15, blocked: false },
    { n: 16, blocked: false },
  ];

  return (
    <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Octubre
        </p>
        <div className="flex items-center gap-1.5">
          <AirbnbIcon className="h-3.5 w-3.5 text-airbnb" title="" />
          <BookingIcon className="h-3.5 w-3.5 text-[#003580]" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <span
            key={d}
            className="text-center text-[8px] font-bold uppercase text-slate-400"
          >
            {d}
          </span>
        ))}
        {days.map((d) => (
          <span
            key={d.n}
            className={`flex h-8 items-center justify-center rounded-md text-[11px] font-semibold ${
              d.blocked
                ? "bg-[repeating-linear-gradient(-45deg,theme(colors.slate.200),theme(colors.slate.200)_2px,theme(colors.slate.100)_2px,theme(colors.slate.100)_6px)] text-slate-400"
                : "bg-white text-slate-700"
            }`}
          >
            {d.n}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        Fechas ocupadas en Airbnb y Booking, reflejadas en Zentt.
      </p>
    </div>
  );
}

const flowSteps: { label: string; icon: ReactNode }[] = [
  {
    label: "Instagram",
    icon: <InstagramGlyph className="h-3.5 w-3.5 text-primary" />,
  },
  {
    label: "Página",
    icon: <Link2 size={14} className="text-primary" />,
  },
  {
    label: "Fechas",
    icon: <CalendarDays size={14} className="text-primary" />,
  },
  {
    label: "WhatsApp",
    icon: <WhatsAppIcon className="h-3.5 w-3.5 text-whatsapp" />,
  },
  {
    label: "Consulta para cerrar",
    icon: <Check size={14} className="text-primary" />,
  },
];

const cards = [
  {
    icons: (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <Link2 size={20} className="text-primary" />
      </div>
    ),
    title: "Tu página en todas partes",
    emphasizeFirst: false,
    points: [
      "El link de tu Instagram, convertido en página de reservas",
      "Mostrá alojamientos, disponibilidad y tarifas",
      "El huésped te escribe por WhatsApp",
    ],
    visual: <LinkVisual />,
  },
  {
    icons: (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <CalendarDays size={20} className="text-primary" />
      </div>
    ),
    title: "Calendarios sincronizados",
    emphasizeFirst: false,
    points: [
      "Conectá Airbnb y Booking y mantené la disponibilidad actualizada",
      "Las fechas ocupadas en Airbnb y Booking se reflejan en tu calendario de Zentt",
      "Reducí el riesgo de reservas dobles sin actualizar calendarios a mano",
    ],
    visual: <CalendarVisual />,
  },
  {
    icons: (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10">
        <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
      </div>
    ),
    title: "Mensajes listos para cerrar",
    emphasizeFirst: true,
    points: [
      "Basta de responder solo por el precio",
      "El huésped elige fechas y alojamiento en tu web",
      "Recibís una consulta estructurada directo en WhatsApp",
    ],
    visual: <InquiryVisual />,
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="relative bg-card py-20 lg:py-28">
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-primary/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-96 w-96 rounded-full bg-accent/[0.03] blur-3xl" />

      <div className="relative container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary">
            CÓMO FUNCIONA
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Basta de responder solo por el precio.
          </h2>
        </div>

        <ol className="mx-auto mb-16 flex max-w-4xl flex-wrap items-center justify-center gap-y-3">
          {flowSteps.map((step, index) => (
            <li key={step.label} className="flex items-center">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5">
                {step.icon}
                <span className="text-xs font-semibold text-foreground sm:text-sm">
                  {step.label}
                </span>
              </div>
              {index < flowSteps.length - 1 ? (
                <ChevronRight
                  size={16}
                  className="mx-1.5 shrink-0 text-muted-foreground/50 sm:mx-2"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5">{c.icons}</div>
                <h3 className="mb-2 font-heading text-xl font-bold text-foreground">
                  {c.title}
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {c.points.map((point, index) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span
                        className={
                          c.emphasizeFirst && index === 0
                            ? "font-medium text-foreground"
                            : undefined
                        }
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
                {c.visual}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="hero" className="rounded-xl" size="lg" asChild>
            <Link href="/register">Creá tu página gratis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
