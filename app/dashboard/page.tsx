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
  LayoutDashboard,
  CalendarDays,
  Clock,
  Percent,
  Reply,
} from "lucide-react";
import { Skeleton, SkeletonKpi, SkeletonRow } from "@/components/ui/skeleton";
import { Cabana } from "@/types/cabin";
import { toast } from "sonner";
import {
  OnboardingStepper,
} from "@/components/dashboard/OnboardingStepper";
import { HeroSiteCard } from "@/components/dashboard/HeroSiteCard";
import {
  MessageChannelBadge,
  MessageInitialAvatar,
} from "@/components/dashboard/MessageChannelBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { MessageOrigen } from "@/types/cabin";
import { formatCurrencyCompact, getMaxCabanas } from "@/lib/planLimits";

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
  const [visitsLabel, setVisitsLabel] = useState("—");

  const slug = user?.profile?.slug;

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return slug ? `${window.location.origin}/${slug}` : "";
  }, [slug]);

  const businessProfile = useMemo(
    () => (user?.profile ? { ...user.profile } : null),
    [user]
  );

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

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const { data } = await api.get<{
          summary?: { sessions?: number };
        }>("/analytics/web-performance/");
        const sessions = data?.summary?.sessions;
        setVisitsLabel(
          typeof sessions === "number" ? String(sessions) : "—"
        );
      } catch {
        setVisitsLabel("—");
      }
    };
    void loadVisits();
  }, []);

  const copyToClipboard = () => {
    if (!publicUrl) {
      toast.error("Primero definí el nombre de tu negocio en Negocio");
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
      <div className="animate-in fade-in mx-auto max-w-7xl space-y-8 p-6 md:p-10">
        <div>
          <Skeleton className="mb-3 h-3 w-32" />
          <Skeleton className="mb-3 h-8 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Ingresos del mes",
      hint: "Confirmadas",
      value: formatCurrencyCompact(stats.ingresosDelMes),
      icon: DollarSign,
      href: "/dashboard/calendario",
    },
    {
      label: "Pendientes",
      hint: "Por confirmar",
      value: formatCurrencyCompact(stats.ingresosPendientes),
      icon: Clock,
      href: "/dashboard/calendario",
    },
    {
      label: "Sin leer",
      hint: "Requieren respuesta",
      value: String(stats.consultasSinLeer),
      icon: Mail,
      href: "/dashboard/buzon",
    },
    {
      label: "Ocupación",
      hint: `${stats.proximosCheckIns} check-ins · 7 días`,
      value: `${stats.ocupacionPct}%`,
      icon: Percent,
      href: "/dashboard/calendario",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl animate-in bg-slate-50 p-6 fade-in duration-700 md:p-10">
      <header className="mb-6">
        <h1 className="page-title-sm flex items-center gap-2 !text-slate-900">
          <LayoutDashboard className="text-primary" size={22} />
          Panel de Control
        </h1>
      </header>

      <OnboardingStepper
        cabanas={cabanas}
        profile={businessProfile}
        accountEmail={user?.email}
        publicUrl={publicUrl}
        hasSlug={Boolean(slug)}
      />

      <HeroSiteCard
        slug={slug}
        publicUrl={publicUrl}
        displayUrl={
          slug
            ? `${typeof window !== "undefined" ? window.location.host : "zentt.agency"}/${slug}`
            : ""
        }
        cabanasCount={stats.totalCabanas}
        cabanasMax={getMaxCabanas(user?.profile?.plan)}
        visitsLabel={visitsLabel}
        copied={copied}
        onCopy={copyToClipboard}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {metricCards.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <item.icon size={14} className="shrink-0 text-slate-400" />
            </div>
            <p className="mt-2 truncate text-2xl font-bold leading-tight text-slate-900">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{item.hint}</p>
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
              href="/dashboard/buzon"
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
                    className="group flex flex-col gap-3 px-3 py-3 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-start sm:justify-between sm:px-4"
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
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                          {alojamientoLabel}
                          {msg.fecha_desde && msg.fecha_hasta
                            ? ` · ${formatShortRange(msg.fecha_desde, msg.fecha_hasta)}`
                            : ""}
                        </p>
                        {preview && (
                          <p className="mt-0.5 truncate text-sm text-slate-500">
                            {preview}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                      {waHref && (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contactar por WhatsApp"
                          aria-label="Contactar por WhatsApp"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-sm transition-transform hover:bg-whatsapp/90 hover:scale-105"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href="/dashboard/buzon"
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto sm:flex-none"
                      >
                        <Reply size={14} />
                        Responder
                      </Link>
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
        </div>
      </div>
    </div>
  );
}
