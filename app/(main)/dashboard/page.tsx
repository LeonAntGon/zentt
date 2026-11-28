"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useDashboardData } from "@/contexts/DashboardDataContext";
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
} from "lucide-react";
import { Skeleton, SkeletonKpi, SkeletonRow } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/dashboard/PageContainer";
import { toast } from "sonner";
import {
  OnboardingStepper,
} from "@/components/dashboard/OnboardingStepper";
import { AccountSecurityChecklist } from "@/components/dashboard/AccountSecurityChecklist";
import { HeroSiteCard } from "@/components/dashboard/HeroSiteCard";
import { InquiryPreviewCard } from "@/components/dashboard/InquiryPreviewCard";
import type { MessageOrigen } from "@/types/cabin";
import { formatCurrencyCompact, getMaxCabanas } from "@/lib/planLimits";
import { getPublicDisplayUrl, getPublicSiteUrl } from "@/lib/publicSite";

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
  adultos?: number | null;
  ninos?: number | null;
  mascotas?: boolean | null;
  mascotas_detalle?: string | null;
  motivo_viaje?: string | null;
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
  email_turista?: string | null;
  telefono_turista?: string | null;
  adultos?: number | null;
  ninos?: number | null;
  mascotas?: boolean | null;
  mascotas_detalle?: string | null;
  motivo_viaje?: string | null;
  notas?: string | null;
  created_at: string;
}

type AttentionItem =
  | { kind: "mensaje"; data: Mensaje; sortKey: string }
  | { kind: "reserva"; data: Reserva; sortKey: string };

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

export default function OverviewPage() {
  const { user } = useAuth();

  // Todo sale de /dashboard/bootstrap/ (un request, compartido con el shell).
  const { data, loading: bootstrapLoading, error: bootstrapError, unread } =
    useDashboardData();
  const loading = bootstrapLoading && !data;
  const stats = {
    totalCabanas: data?.stats.total_cabanas ?? 0,
    ingresosDelMes: Number(data?.stats.ingresos_del_mes ?? 0),
    consultasSinLeer: unread.total,
    ingresosPendientes: Number(data?.stats.ingresos_pendientes ?? 0),
    proximosCheckIns: data?.stats.proximos_check_ins ?? 0,
    ocupacionPct: data?.stats.ocupacion_pct ?? 0,
  };
  const mensajesRecientes: Mensaje[] = useMemo(
    () => data?.ultimos_mensajes ?? [],
    [data]
  );

  useEffect(() => {
    if (bootstrapError) toast.error("Error al sincronizar con el servidor");
  }, [bootstrapError]);

  const [copied, setCopied] = useState(false);
  const [visitsLabel, setVisitsLabel] = useState("—");

  const slug = user?.profile?.slug;
  const customDomain = user?.profile?.custom_domain?.display_domain;
  const hideBilling = Boolean(user?.profile?.hide_billing);

  const publicUrl = useMemo(() => {
    return getPublicSiteUrl(slug, customDomain);
  }, [slug, customDomain]);

  const displayUrl = useMemo(() => {
    return getPublicDisplayUrl(slug, customDomain);
  }, [slug, customDomain]);

  const businessProfile = useMemo(
    () => (user?.profile ? { ...user.profile } : null),
    [user]
  );


  useEffect(() => {
    let cancelled = false;
    const loadVisits = async () => {
      try {
        const { data } = await api.get<{
          summary?: { sessions?: number };
        }>("/analytics/web-performance/");
        if (cancelled) return;
        const sessions = data?.summary?.sessions;
        setVisitsLabel(
          typeof sessions === "number" ? String(sessions) : "—"
        );
      } catch {
        if (!cancelled) setVisitsLabel("—");
      }
    };

    const schedule =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback(() => void loadVisits(), { timeout: 2500 })
        : setTimeout(() => void loadVisits(), 1200);

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(schedule as number);
      } else {
        clearTimeout(schedule as ReturnType<typeof setTimeout>);
      }
    };
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

  const proximasReservas: Reserva[] = useMemo(
    () => (data?.proximas_reservas ?? []).slice(0, 4),
    [data]
  );

  const reservasPendientes: Reserva[] = useMemo(
    () => data?.reservas_pendientes ?? [],
    [data]
  );

  const atencionReciente = useMemo<AttentionItem[]>(() => {
    const mensajes: AttentionItem[] = mensajesRecientes.map((m) => ({
      kind: "mensaje",
      data: m,
      sortKey: m.fecha_envio,
    }));
    const pendientes: AttentionItem[] = reservasPendientes.map((r) => ({
      kind: "reserva",
      data: r,
      sortKey: r.created_at,
    }));

    return [...mensajes, ...pendientes]
      .sort(
        (a, b) =>
          new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime()
      )
      .slice(0, 6);
  }, [mensajesRecientes, reservasPendientes]);

  if (loading) {
    return (
      <PageContainer className="animate-in fade-in space-y-6">
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
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
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
    <PageContainer className="animate-in fade-in duration-700">
      <header className="mb-6">
        <h1 className="page-title-sm flex items-center gap-2 !text-slate-900">
          <LayoutDashboard className="text-primary" size={22} />
          Panel de Control
        </h1>
      </header>

      <AccountSecurityChecklist />

      <OnboardingStepper
        cabanasCount={stats.totalCabanas}
        profile={businessProfile}
        accountEmail={user?.email}
        publicUrl={publicUrl}
        hasSlug={Boolean(slug)}
      />

      <HeroSiteCard
        slug={slug}
        publicUrl={publicUrl}
        displayUrl={displayUrl}
        cabanasCount={stats.totalCabanas}
        cabanasMax={hideBilling ? null : getMaxCabanas(user?.profile?.plan)}
        visitsLabel={visitsLabel}
        copied={copied}
        onCopy={copyToClipboard}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {metricCards.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <item.icon size={14} className="shrink-0 text-slate-500" />
            </div>
            <p className="mt-2 truncate text-2xl font-bold leading-tight text-slate-900">
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2 md:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-800">
              <MessageSquare className="text-primary" size={20} />
              Consultas y reservas por responder
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/buzon"
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Abrir buzón <ArrowRight size={14} />
              </Link>
              <Link
                href="/dashboard/calendario"
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver calendario <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {atencionReciente.length > 0 ? (
              atencionReciente.map((item) => {
                if (item.kind === "reserva") {
                  const r = item.data;
                  const rango = formatShortRange(r.check_in, r.check_out);

                  return (
                    <Link
                      key={`reserva-${r.id}`}
                      href="/dashboard/calendario"
                      className="block rounded-2xl border border-amber-200 bg-amber-50/60 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {r.nombre_turista || "Huésped"}
                          </p>
                          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                            <Home size={12} className="shrink-0" />
                            <span className="truncate">
                              {r.cabana_nombre || "Alojamiento"}
                              {rango ? ` · ${rango}` : ""}
                            </span>
                          </p>
                          {r.notas ? (
                            <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                              {r.notas}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          Reserva pendiente
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrencyCompact(
                            Number(r.total_reserva || 0)
                          )}
                        </p>
                        <span className="text-[11px] font-semibold text-primary">
                          Ver en calendario →
                        </span>
                      </div>
                    </Link>
                  );
                }

                const msg = item.data;
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

                return (
                  <InquiryPreviewCard
                    key={`${msg._tipo}-${msg.id}`}
                    name={nombre}
                    origen={msg.origen}
                    leido={msg.leido}
                    propertyLabel={alojamientoLabel}
                    preview={preview}
                    fechaDesde={msg.fecha_desde}
                    fechaHasta={msg.fecha_hasta}
                    totalEstimado={msg.total_estimado}
                    adultos={msg._tipo === "cabanas" ? msg.adultos : null}
                    ninos={msg._tipo === "cabanas" ? msg.ninos : null}
                    mascotas={msg._tipo === "cabanas" ? msg.mascotas : null}
                    motivoViaje={
                      msg._tipo === "cabanas" ? msg.motivo_viaje : null
                    }
                    fechaEnvio={msg.fecha_envio}
                    whatsappHref={buildWhatsAppHref(
                      telefono,
                      nombre,
                      msg._tipo === "cabanas" ? msg.cabana_nombre : null
                    )}
                  />
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Todavía no hay consultas ni reservas pendientes.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Compartí tu link para empezar a recibir mensajes y reservas.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
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
                      <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                        <Home size={12} className="shrink-0 text-slate-500" />
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
              <p className="px-4 py-8 text-sm text-slate-500">
                Sin check-ins próximos. Las reservas aparecerán acá.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
