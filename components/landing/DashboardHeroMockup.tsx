"use client";

import {
  LayoutDashboard,
  Mail,
  CalendarDays,
  Globe,
  User,
  DollarSign,
  Clock,
  Percent,
  Reply,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";
import { ZenttLogo } from "@/components/landing/ZenttLogo";

const navItems = [
  { icon: LayoutDashboard, label: "Inicio", active: true },
  { icon: CalendarDays, label: "Agenda" },
  { icon: Globe, label: "Sitio" },
  { icon: Mail, label: "Buzón", badge: "3" },
  { icon: User, label: "Cuenta" },
];

const kpis = [
  { label: "Ingresos del mes", value: "$ 486.500", icon: DollarSign },
  { label: "Pendientes", value: "$ 128.000", icon: Clock },
  { label: "Ocupación", value: "72%", icon: Percent },
];

const messages: {
  name: string;
  origin: "wa" | "airbnb" | "web";
  cabin: string;
  when: string;
  preview: string;
}[] = [
  {
    name: "Camila R.",
    origin: "wa",
    cabin: "Alojamiento del Bosque",
    when: "hace 5 min",
    preview: "Hola, ¿tenés disponibilidad para el 12 al 15 de octubre?",
  },
  {
    name: "Julián M.",
    origin: "airbnb",
    cabin: "Suite Los Álamos",
    when: "hace 1 h",
    preview: "Confirmo la reserva para 4 personas. Gracias.",
  },
  {
    name: "Sofía P.",
    origin: "web",
    cabin: "Cabaña Río Claro",
    when: "hace 3 h",
    preview: "¿Aceptan mascotas? Somos dos personas y un perro chico.",
  },
];

function ChannelBadge({ origin }: { origin: "wa" | "airbnb" | "web" }) {
  if (origin === "wa") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp/10"
        aria-hidden
      >
        <WhatsAppIcon className="h-3 w-3 text-whatsapp" />
      </span>
    );
  }
  if (origin === "airbnb") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-airbnb/10"
        aria-hidden
      >
        <AirbnbIcon className="h-3 w-3 text-airbnb" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-5 items-center rounded-md bg-primary/10 px-1.5 text-[9px] font-bold uppercase tracking-wider text-primary"
      aria-hidden
    >
      Web
    </span>
  );
}

export function DashboardHeroMockup() {
  return (
    <div
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-primary/5"
      aria-hidden
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="mx-auto flex max-w-sm flex-1 items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-400 shadow-inner">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          panel.zentt.app / dashboard
        </div>
      </div>

      {/* App layout */}
      <div className="grid grid-cols-[140px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden flex-col gap-3 border-r border-slate-100 bg-white p-3 sm:flex">
          <div className="flex items-center gap-2 px-2 py-1">
            <ZenttLogo className="h-4 w-auto aspect-[290/130]" />
          </div>
          <p className="mt-2 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Principal
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-slate-600"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <item.icon size={12} />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex flex-col gap-4 bg-slate-50 p-4 sm:p-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary">
              Inicio
            </p>
            <h3 className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
              ¡Buen día, María!
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm"
              >
                <div className="mb-1 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                  <k.icon size={9} /> {k.label}
                </div>
                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                  {k.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="flex items-center gap-1 text-[10px] font-bold text-slate-900">
                <Mail size={10} className="text-primary" /> Consultas por responder
              </h4>
              <span className="text-[9px] font-semibold text-primary">
                Ver todas
              </span>
            </div>
            <ul className="space-y-2">
              {messages.map((m) => (
                <li
                  key={m.name}
                  className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {m.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[10px] font-bold text-slate-900">
                        {m.name}
                      </p>
                      <ChannelBadge origin={m.origin} />
                      <span className="truncate text-[9px] text-slate-400">
                        · {m.cabin}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                      {m.preview}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                    <Reply size={9} /> Responder
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
