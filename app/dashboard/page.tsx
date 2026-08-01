"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Mail,
  DollarSign,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  Sparkles,
  CalendarDays,
  Clock,
  Percent,
  Reply,
} from "lucide-react";
import { Cabana } from "@/types/cabin";
import { toast } from "sonner";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import {
  OnboardingStepper,
  evaluateOnboarding,
} from "@/components/dashboard/OnboardingStepper";
import { StaySummary } from "@/components/dashboard/StaySummary";
import {
  MessageChannelBadge,
  MessageInitialAvatar,
} from "@/components/dashboard/MessageChannelBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { MessageOrigen } from "@/types/cabin";

interface Mensaje {
  id: number;
  nombre_turista?: string;
  nombre?: string;
  cabana_nombre?: string;
  contenido?: string;
  mensaje?: string;
  telefono_turista?: string | null;
  telefono?: string | null;
  origen?: MessageOrigen;
  fecha_envio: string;
  leido: boolean;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
  total_estimado?: string | number | null;
  _tipo: "cabanas" | "general";
}

interface Reserva {
  id: number;
  estado: string;
  total_reserva: string | number;
  check_in: string;
  check_out: string;
  cabana?: number;
  cabana_nombre?: string;
  nombre_turista?: string;
  created_at: string;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortRange(desde?: string | null, hasta?: string | null) {
  if (!desde || !hasta) return null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const a = new Date(desde + "T12:00:00").toLocaleDateString("es-AR", opts);
  const b = new Date(hasta + "T12:00:00").toLocaleDateString("es-AR", opts);
  return `${a} – ${b}`;
}

function buildWhatsAppHref(
  telefono?: string | null,
  nombre?: string | null,
  cabanaNombre?: string | null
) {
  const digits = (telefono || "").replace(/\D/g, "");
  if (!digits) return null;
  const text = cabanaNombre
    ? `Hola ${nombre || ""}, te escribo por tu consulta sobre ${cabanaNombre}.`
    : `Hola ${nombre || ""}, te escribo por tu consulta.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function nightsBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function sumIngresosDelMes(reservas: Reserva[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return reservas.reduce((sum, r) => {
    if (r.estado !== "confirmada") return sum;
    const checkIn = new Date(r.check_in + "T12:00:00");
    if (checkIn.getFullYear() !== year || checkIn.getMonth() !== month) {
      return sum;
    }
    return sum + Number(r.total_reserva || 0);
  }, 0);
}

function sumIngresosPendientes(reservas: Reserva[]) {
  return reservas.reduce((sum, r) => {
    if (r.estado !== "pendiente") return sum;
    return sum + Number(r.total_reserva || 0);
  }, 0);
}

function countProximosCheckIns(reservas: Reserva[]) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const limit = new Date(now);
  limit.setDate(limit.getDate() + 7);

  return reservas.filter((r) => {
    if (r.estado !== "confirmada") return false;
    const checkIn = new Date(r.check_in + "T12:00:00");
    return checkIn >= now && checkIn <= limit;
  }).length;
}

function ocupacionDelMes(reservas: Reserva[], cabanasCount: number) {
  if (cabanasCount === 0) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const daysInMonth = nightsBetween(monthStart, monthEnd);
  const capacityNights = daysInMonth * cabanasCount;

  let occupied = 0;
  for (const r of reservas) {
    if (r.estado !== "confirmada") continue;
    const start = new Date(r.check_in + "T12:00:00");
    const end = new Date(r.check_out + "T12:00:00");
    const overlapStart = start > monthStart ? start : monthStart;
    const overlapEnd = end < monthEnd ? end : monthEnd;
    occupied += nightsBetween(overlapStart, overlapEnd);
  }

  return Math.min(100, Math.round((occupied / capacityNights) * 100));
}

export default function OverviewPage() {
  const { user } = useAuth();

  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [stats, setStats] = useState({
    totalCabanas: 0,
    ingresosDelMes: 0,
    consultasSinLeer: 0,
    ingresosPendientes: 0,
    proximosCheckIns: 0,
    ocupacionPct: 0,
  });

  const [mensajesRecientes, setMensajesRecientes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = user?.profile?.slug;
  const nombreNegocio = user?.profile?.nombre_negocio;

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return slug ? `${window.location.origin}/${slug}` : "";
  }, [slug]);

  const businessProfile = useMemo(
    () => (user?.profile ? { ...user.profile } : null),
    [user]
  );

  const onboarding = evaluateOnboarding(
    cabanas,
    businessProfile,
    user?.email
  );
  const onboardingReady =
    onboarding.contacto && onboarding.alojamiento && onboarding.logo;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resCabanas, resMensajes, resGeneral, resReservas] =
          await Promise.all([
            api.get<Cabana[]>("/cabanas/"),
            api.get<Mensaje[]>("/mensajes/"),
            api.get<Mensaje[]>("/contacto/"),
            api.get<Reserva[]>("/booking/gestion-reservas/").catch(() => ({
              data: [] as Reserva[],
            })),
          ]);

        const listaCabanas = resCabanas.data;
        const listaReservas = resReservas.data || [];
        const mensajes = resMensajes.data.map((m) => ({
          ...m,
          _tipo: "cabanas" as const,
        }));
        const generales = resGeneral.data.map((m) => ({
          ...m,
          _tipo: "general" as const,
        }));

        const todosLosMensajes = [...mensajes, ...generales];
        const consultasSinLeer = todosLosMensajes.filter((m) => !m.leido).length;

        const recientes = todosLosMensajes
          .sort(
            (a, b) =>
              new Date(b.fecha_envio).getTime() -
              new Date(a.fecha_envio).getTime()
          )
          .slice(0, 5);

        setCabanas(listaCabanas);
        setReservas(listaReservas);
        setStats({
          totalCabanas: listaCabanas.length,
          ingresosDelMes: sumIngresosDelMes(listaReservas),
          consultasSinLeer,
          ingresosPendientes: sumIngresosPendientes(listaReservas),
          proximosCheckIns: countProximosCheckIns(listaReservas),
          ocupacionPct: ocupacionDelMes(listaReservas, listaCabanas.length),
        });
        setMensajesRecientes(recientes);
      } catch (error) {
        console.error("Error cargando dashboard", error);
        toast.error("Error al sincronizar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const copyToClipboard = () => {
    if (!publicUrl) {
      toast.error("Primero define el nombre de tu negocio en Configuración");
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Enlace copiado correctamente");
    setTimeout(() => setCopied(false), 2000);
  };

  const proximasReservas = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return reservas
      .filter(
        (r) =>
          (r.estado === "confirmada" || r.estado === "pendiente") &&
          new Date(r.check_in + "T12:00:00") >= now
      )
      .sort(
        (a, b) =>
          new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
      )
      .slice(0, 4);
  }, [reservas]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="flex items-center gap-2 font-medium text-slate-500">
          Sincronizando
          <ZenttLogo className="h-4 w-auto aspect-[290/130]" />
          ...
        </p>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Ingresos del mes",
      hint: "Confirmadas",
      value: formatMoney(stats.ingresosDelMes),
      icon: DollarSign,
      href: "/dashboard/calendario",
    },
    {
      label: "Ingresos pendientes",
      hint: "Por confirmar",
      value: formatMoney(stats.ingresosPendientes),
      icon: Clock,
      href: "/dashboard/calendario",
    },
    {
      label: "Consultas sin leer",
      hint: "Requieren respuesta",
      value: String(stats.consultasSinLeer),
      icon: Mail,
      href: "/dashboard/mensajes",
    },
    {
      label: "Ocupación del mes",
      hint: `${stats.proximosCheckIns} check-ins · 7 días`,
      value: `${stats.ocupacionPct}%`,
      icon: Percent,
      href: "/dashboard/calendario",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl animate-in bg-slate-50 p-6 fade-in duration-700 md:p-10">
      <header className="mb-6">
        <p className="page-eyebrow mb-2 flex items-center gap-2">
          <Sparkles size={14} /> Panel de Control
        </p>
        <h1 className="page-title">
          {nombreNegocio || `¡Hola, ${user?.first_name}!`}
        </h1>
        <p className="page-subtitle mt-1">
          Respondé consultas, mirá ocupación y compartí tu link.
        </p>
      </header>

      <OnboardingStepper
        cabanas={cabanas}
        profile={businessProfile}
        accountEmail={user?.email}
        publicUrl={publicUrl}
        hasSlug={Boolean(slug)}
      />

      {onboardingReady && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                slug
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  slug ? "animate-pulse bg-emerald-500" : "bg-orange-500"
                }`}
              />
              {slug ? "Online" : "Pendiente"}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Tu sitio público
              </p>
              <p className="truncate text-sm font-semibold text-slate-800">
                {slug ? publicUrl : "Configurá el nombre de tu negocio"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {slug ? (
              <>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {copied ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  Copiar
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Ver web <ExternalLink size={14} />
                </a>
              </>
            ) : (
              <Link
                href="/dashboard/configuracion"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
              >
                Configurar
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon size={16} />
            </div>
            <div className="min-w-0 pr-10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 truncate text-2xl font-bold leading-tight text-slate-900">
                {item.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">{item.hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-800">
              <MessageSquare className="text-primary" size={20} />
              Consultas por responder
            </h2>
            <Link
              href="/dashboard/mensajes"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Abrir buzón <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {mensajesRecientes.length > 0 ? (
              mensajesRecientes.map((msg) => {
                const nombre =
                  msg._tipo === "cabanas" ? msg.nombre_turista : msg.nombre;
                const preview =
                  msg._tipo === "cabanas" ? msg.contenido : msg.mensaje;
                const alojamientoLabel =
                  msg._tipo === "cabanas"
                    ? msg.cabana_nombre || "Alojamiento"
                    : "Consulta general";
                const telefono =
                  msg._tipo === "cabanas" ? msg.telefono_turista : msg.telefono;
                const waHref = buildWhatsAppHref(
                  telefono,
                  nombre,
                  msg._tipo === "cabanas" ? msg.cabana_nombre : null
                );

                return (
                  <div
                    key={`${msg._tipo}-${msg.id}`}
                    className="group flex items-start justify-between gap-3 px-3 py-3 transition-colors hover:bg-slate-50/80 sm:px-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <MessageInitialAvatar
                        name={nombre}
                        leido={msg.leido}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold capitalize text-slate-800">
                            {nombre?.toLowerCase()}
                          </span>
                          <MessageChannelBadge origen={msg.origen} />
                          <span className="truncate text-[11px] font-medium text-slate-400">
                            {alojamientoLabel}
                          </span>
                        </div>
                        {preview && (
                          <p className="mt-0.5 truncate text-sm text-slate-500">
                            {preview}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(msg.fecha_envio).toLocaleDateString(
                            "es-AR",
                            { day: "numeric", month: "short" }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StaySummary
                        compact
                        fechaDesde={msg.fecha_desde}
                        fechaHasta={msg.fecha_hasta}
                        totalEstimado={msg.total_estimado}
                      />
                      <div className="flex items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                        {waHref && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Contactar por WhatsApp"
                            aria-label="Contactar por WhatsApp"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform hover:bg-[#1ebe57] hover:scale-105"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href="/dashboard/mensajes"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                          <Reply size={14} />
                          Responder
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Todavía no hay consultas.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Compartí tu link para empezar a recibir mensajes.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-slate-800">
                <CalendarDays size={16} className="text-primary" />
                Próximas reservas
              </h3>
              <Link
                href="/dashboard/calendario"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver calendario
              </Link>
            </div>

            {proximasReservas.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {proximasReservas.map((r) => {
                  const rango = formatShortRange(r.check_in, r.check_out);
                  return (
                    <li key={r.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-bold text-slate-900">
                          {r.nombre_turista || "Huésped"}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            r.estado === "confirmada"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.estado === "confirmada"
                            ? "Confirmada"
                            : "Pendiente"}
                        </span>
                      </div>
                      <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
                        <Home size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">
                          {r.cabana_nombre || "Alojamiento"}
                          {rango ? ` - ${rango}` : ""}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-8 text-sm text-slate-400">
                Sin check-ins próximos. Las reservas aparecerán acá.
              </p>
            )}
          </div>

          <Link
            href="/dashboard/cabanas"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Home size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {stats.totalCabanas}{" "}
                {stats.totalCabanas === 1 ? "alojamiento" : "alojamientos"}
              </p>
              <p className="text-xs text-slate-400">
                Fotos, precios y disponibilidad
              </p>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
