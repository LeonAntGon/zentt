"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type DateRange, type DayButtonProps } from "react-day-picker";
import { isValidPhoneNumber } from "react-phone-number-input";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import {
  estimateStayTotalInclusive,
  formatMoneyARS,
  nightsCountInclusive,
  toExclusiveCheckout,
  toISODate,
  effectiveNightPrice,
} from "@/lib/pricing";
import { Cabana, FechaOcupada } from "@/types/cabin";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Users,
  Loader2,
  Building2,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { CabinGallery } from "@/components/public/CabinGallery";
import { CabinVideoEmbeds } from "@/components/public/CabinVideoEmbeds";
import { PublicSiteFooter } from "@/components/public/PublicSiteFooter";
import { GuestCounter } from "@/components/public/GuestCounter";
import { PhoneField } from "@/components/public/PhoneField";
import { resolveAmenities } from "@/lib/amenities";
import { toast } from "sonner";
import { eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";
import { getDesign } from "@/lib/designs";

const MOTIVO_VIAJE_OPTIONS = [
  { value: "vacaciones", label: "Vacaciones" },
  { value: "trabajo", label: "Trabajo" },
  { value: "escapada", label: "Escapada romántica" },
  { value: "familia", label: "Familia" },
  { value: "otro", label: "Otro" },
];

function occupiedMatchers(ranges: FechaOcupada[]) {
  const blocked = new Set<string>();
  for (const r of ranges) {
    const start = parseISO(r.check_in);
    const endExclusive = parseISO(r.check_out);
    if (endExclusive <= start) continue;
    const days = eachDayOfInterval({
      start,
      end: new Date(endExclusive.getTime() - 86400000),
    });
    for (const d of days) blocked.add(toISODate(d));
  }
  return (date: Date) => blocked.has(toISODate(date));
}

function compactPrice(value: number) {
  if (!Number.isFinite(value)) return "";
  if (value >= 1000000) return `$${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

function PublicPriceDayButton({
  day,
  modifiers,
  getPrice,
  ...buttonProps
}: DayButtonProps & { getPrice: (date: Date) => number }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button ref={ref} {...buttonProps} className={`${buttonProps.className || ""} relative`}>
      <span className="flex h-full w-full flex-col items-center justify-center leading-none">
        <span>{buttonProps.children}</span>
        <span className="mt-0.5 max-w-full truncate text-[9px] font-medium text-slate-400">
          {compactPrice(getPrice(day.date))}
        </span>
      </span>
    </button>
  );
}

export default function CabinDetailPublicPage() {
  const params = useParams<{ slug: string; cabanaSlug: string }>();
  const slug = params.slug;
  const cabanaSlug = params.cabanaSlug;
  const router = useRouter();

  const [cabana, setCabana] = useState<Cabana | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ocupadas, setOcupadas] = useState<FechaOcupada[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();

  const [formData, setFormData] = useState({
    nombre_turista: "",
    email_turista: "",
    telefono_turista: "",
    contenido: "",
    adultos: 2,
    ninos: 0,
    mascotas: false,
    mascotas_detalle: "",
    motivo_viaje: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  useEffect(() => {
    const fetchCabanaDetail = async () => {
      try {
        setLoading(true);
        const [resCabana, resOcupadas] = await Promise.all([
          api.get<Cabana>(`/public/${slug}/cabana/${cabanaSlug}/`),
          api
            .get<FechaOcupada[]>(
              `/public/${slug}/cabana/${cabanaSlug}/fechas_ocupadas/`
            )
            .catch(() => ({ data: [] as FechaOcupada[] })),
        ]);
        setCabana(resCabana.data);
        setOcupadas(resOcupadas.data || []);
        setFormData((prev) => ({
          ...prev,
          adultos: Math.max(
            1,
            Math.min(prev.adultos, resCabana.data.capacidad || 1)
          ),
        }));
      } catch {
        toast.error("No pudimos encontrar este alojamiento.");
      } finally {
        setLoading(false);
      }
    };
    if (slug && cabanaSlug) fetchCabanaDetail();
  }, [slug, cabanaSlug]);

  const isDisabled = useMemo(() => occupiedMatchers(ocupadas), [ocupadas]);

  const getPriceForDay = useMemo(
    () => (date: Date) =>
      effectiveNightPrice(
        date,
        cabana?.precio || "0",
        cabana?.precios_especiales || [],
        cabana?.precios_por_fecha || []
      ).precio,
    [cabana]
  );

  const PriceDayButton = useMemo(
    () => {
      const Button = (props: DayButtonProps) => (
        <PublicPriceDayButton {...props} getPrice={getPriceForDay} />
      );
      Button.displayName = "PublicPriceDayButton";
      return Button;
    },
    [getPriceForDay]
  );

  const lastNight = range?.from ? (range.to ?? range.from) : undefined;

  const estimado = useMemo(() => {
    if (!cabana || !range?.from || !lastNight) return 0;
    return estimateStayTotalInclusive(
      cabana.precio,
      cabana.precios_especiales,
      range.from,
      lastNight,
      cabana.precios_por_fecha
    );
  }, [cabana, range, lastNight]);

  const noches =
    range?.from && lastNight
      ? nightsCountInclusive(range.from, lastNight)
      : 0;

  const rangeHasConflict = useMemo(() => {
    if (!range?.from) return false;
    const to = range.to ?? range.from;
    if (to < range.from) return false;
    const days = eachDayOfInterval({ start: range.from, end: to });
    return days.some((d) => isDisabled(d));
  }, [range, isDisabled]);

  const totalHuespedes = formData.adultos + formData.ninos;
  const capacityError =
    cabana && totalHuespedes > cabana.capacidad
      ? `Este alojamiento admite hasta ${cabana.capacidad} personas en total.`
      : "";
  const petFriendly = cabana?.amenities?.includes("mascotas") ?? false;

  const requireDates = () => {
    if (!range?.from) {
      toast.error("Elegí las noches en el calendario.");
      return false;
    }
    const to = range.to ?? range.from;
    if (nightsCountInclusive(range.from, to) < 1) {
      toast.error("Elegí al menos una noche.");
      return false;
    }
    if (rangeHasConflict) {
      toast.error("Alojamiento no disponible en esas fechas.");
      return false;
    }
    return true;
  };

  const handleSubmitConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabana || !requireDates()) return;

    const nextErrors: Record<string, string> = {};
    if (!formData.nombre_turista.trim()) {
      nextErrors.nombre_turista = "Ingresá tu nombre.";
    }
    if (!formData.telefono_turista.trim()) {
      nextErrors.telefono_turista = "Ingresá tu WhatsApp.";
    } else if (!isValidPhoneNumber(formData.telefono_turista)) {
      nextErrors.telefono_turista =
        "Ingresá un WhatsApp válido con código de país.";
    }
    if (capacityError) {
      nextErrors.adultos = capacityError;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Revisá los datos marcados para continuar.");
      return;
    }

    const from = range!.from!;
    const to = range!.to ?? from;
    const fechaDesde = toISODate(from);
    const fechaHasta = toExclusiveCheckout(to);
    const isWhatsApp = cabana.metodo_contacto === "WA";
    const waNum = cabana.telefono_whatsapp?.replace(/[^0-9]/g, "") || "";

    // Open WhatsApp before the request so mobile browsers don't block it.
    let waWindow: Window | null = null;
    if (isWhatsApp && waNum) {
      waWindow = window.open("", "_blank");
      if (waWindow) waWindow.opener = null;
    }

    try {
      setSending(true);
      const { data } = await api.post<{
        id: number;
        detail: string;
        total_estimado: string;
        noches: number;
      }>(`/public/${slug}/cabana/${cabanaSlug}/mensajes/`, {
        nombre_turista: formData.nombre_turista.trim(),
        email_turista: formData.email_turista.trim(),
        telefono_turista: formData.telefono_turista,
        contenido: formData.contenido.trim(),
        adultos: formData.adultos,
        ninos: formData.ninos,
        mascotas: formData.mascotas,
        mascotas_detalle: formData.mascotas
          ? formData.mascotas_detalle.trim()
          : "",
        motivo_viaje: formData.motivo_viaje,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        origen: "WEB",
      });

      const serverTotal = Number(data.total_estimado || estimado);
      const nights = data.noches || nightsCountInclusive(from, to);
      const dateFrom = format(from, "dd/MM/yyyy");
      const dateTo = format(parseISO(fechaHasta), "dd/MM/yyyy");
      const adultText = `${formData.adultos} adulto${
        formData.adultos === 1 ? "" : "s"
      }`;
      const childText =
        formData.ninos > 0
          ? ` y ${formData.ninos} niño${formData.ninos === 1 ? "" : "s"}`
          : "";
      const petText = formData.mascotas
        ? formData.mascotas_detalle.trim()
          ? `Llevamos ${formData.mascotas_detalle.trim()}.`
          : "Llevamos mascota."
        : "No viajamos con mascotas.";
      const reason = MOTIVO_VIAJE_OPTIONS.find(
        (option) => option.value === formData.motivo_viaje
      );
      const text = [
        `Hola, mi nombre es ${formData.nombre_turista.trim()}.`,
        `Me interesa reservar la "${cabana.nombre}" desde el ${dateFrom} hasta el ${dateTo} (${nights} ${
          nights === 1 ? "noche" : "noches"
        }).`,
        `Somos ${adultText}${childText}.`,
        petText,
        reason ? `Motivo: ${reason.label.toLowerCase()}.` : null,
        serverTotal > 0
          ? `Vi que el total estimado es ${formatMoneyARS(serverTotal)} ARS.`
          : null,
        "¿Tienen disponibilidad y cómo es el método de pago?",
        formData.contenido.trim()
          ? `Consulta: ${formData.contenido.trim()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`;

      if (isWhatsApp && waNum) {
        if (waWindow && !waWindow.closed) {
          waWindow.location.href = waHref;
          toast.success("¡Consulta enviada con éxito!");
        } else {
          toast.success("¡Consulta enviada con éxito!", {
            action: {
              label: "Abrir WhatsApp",
              onClick: () => window.open(waHref, "_blank"),
            },
            duration: 12000,
          });
        }
      } else if (isWhatsApp) {
        toast.message("Consulta enviada. El anfitrión aún no configuró WhatsApp.");
      } else {
        toast.success("¡Consulta enviada con éxito!");
      }

      setFormData({
        nombre_turista: "",
        email_turista: "",
        telefono_turista: "",
        contenido: "",
        adultos: Math.max(1, Math.min(2, cabana.capacidad || 1)),
        ninos: 0,
        mascotas: false,
        mascotas_detalle: "",
        motivo_viaje: "",
      });
      setErrors({});
      setRange(undefined);
    } catch (error) {
      if (waWindow && !waWindow.closed) waWindow.close();
      const detail = (
        error as { response?: { data?: { detail?: string } } }
      ).response?.data?.detail;
      toast.error(detail || "Error al enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!cabana)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-white px-6 text-center">
        <div className="max-w-md">
          <Building2 size={56} className="mx-auto mb-6 text-slate-200" />
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Alojamiento
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            No encontramos este alojamiento
          </h1>
          <p className="mt-4 text-base text-slate-500">
            Puede que se haya movido o que la dirección no sea correcta.
          </p>
          <button
            onClick={() => router.push(`/${slug}`)}
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <ArrowLeft size={17} />
            Volver al sitio
          </button>
        </div>
      </div>
    );

  const isWhatsApp = cabana.metodo_contacto === "WA";
  const portadaUrl = getMediaUrl(cabana.imagen_portada);
  const galeriaUrls =
    cabana.imagenes
      ?.filter((img) => !img.es_portada)
      .map((img) => getMediaUrl(img.imagen))
      .filter((url): url is string => Boolean(url)) || [];

  const carouselImages = [
    ...(portadaUrl ? [{ src: portadaUrl, alt: cabana.nombre }] : []),
    ...galeriaUrls.map((src, i) => ({
      src,
      alt: `${cabana.nombre} · foto ${i + 2}`,
    })),
  ];
  const cabinAmenities = resolveAmenities(cabana.amenities);
  const design = getDesign(cabana.design);

  return (
    <div data-design={design.id} className={`site-theme flex flex-1 flex-col font-public ${design.id === "elegante" ? "font-serif" : ""}`}>
      {/* Simplified Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link
            href={`/${slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-slate-900">
            {cabana.nombre}
          </span>
          <div className="w-9" />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6 md:py-8">
        <CabinGallery images={carouselImages} className="mb-6 md:mb-10" />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left Column - Info */}
          <div className="lg:w-3/5">
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {cabana.nombre}
            </h1>

            <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Users size={16} className="text-slate-400" />
                <span>Hasta {cabana.capacidad} personas</span>
              </div>
            </div>

            <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
              {cabana.descripcion?.trim() ||
                "Hermoso alojamiento equipado para tu descanso."}
            </p>

            {cabinAmenities.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Comodidades
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {cabinAmenities.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                    >
                      <a.icon className="h-4 w-4 shrink-0 text-slate-600" />
                      <span className="text-sm text-slate-700">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CabinVideoEmbeds videos={cabana.videos || []} className="mt-10" />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:w-2/5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-slate-900">
                    $ {Number(cabana.precio).toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm text-slate-400">/ noche</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="mb-2 px-1 text-xs font-medium text-slate-500">
                  Seleccioná las noches
                </p>
                <div className="w-full min-w-0">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={[{ before: startOfDay(new Date()) }, isDisabled]}
                    modifiers={{ occupied: isDisabled }}
                    modifiersClassNames={{
                      occupied: "site-occupied-day line-through opacity-80",
                    }}
                    components={{ DayButton: PriceDayButton }}
                    numberOfMonths={1}
                    className="w-full p-0"
                  />
                </div>
                <div className="mt-2 flex gap-3 px-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-slate-300" /> No disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-primary" /> Tu
                    selección
                  </span>
                </div>
                <p className="mt-2 px-1 text-[10px] text-slate-400">
                  El valor debajo de cada día es la tarifa estimada de esa noche.
                </p>

                {rangeHasConflict && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <span>
                      No disponible en esas fechas. Elegí otras noches.
                    </span>
                  </div>
                )}
              </div>

              {/* Estimate */}
              {noches > 0 && (
                <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">
                    Estimado · {noches} {noches === 1 ? "noche" : "noches"}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatMoneyARS(estimado)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Estimado según tarifa. No incluye cargos extra por
                    huéspedes o mascotas; el anfitrión confirma.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitConsulta} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <GuestCounter
                    label="Adultos"
                    hint="Mayores"
                    value={formData.adultos}
                    min={1}
                    max={Math.max(1, cabana.capacidad - formData.ninos)}
                    onChange={(value) => updateForm({ adultos: value })}
                  />
                  <GuestCounter
                    label="Niños"
                    hint="Menores"
                    value={formData.ninos}
                    min={0}
                    max={Math.max(0, cabana.capacidad - formData.adultos)}
                    onChange={(value) => updateForm({ ninos: value })}
                  />
                </div>
                <p className="px-1 text-[11px] text-slate-400">
                  Máximo {cabana.capacidad} personas en total.
                </p>
                {capacityError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <span>{capacityError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Nombre y apellido"
                    required
                    aria-label="Nombre y apellido"
                    aria-invalid={Boolean(errors.nombre_turista)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.nombre_turista
                        ? "border-red-300 focus:border-red-400 focus:ring-red-300"
                        : "border-slate-200 focus:border-primary focus:ring-primary"
                    }`}
                    value={formData.nombre_turista}
                    onChange={(e) =>
                      updateForm({ nombre_turista: e.target.value })
                    }
                  />
                  {errors.nombre_turista && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.nombre_turista}
                    </p>
                  )}
                </div>

                <PhoneField
                  value={formData.telefono_turista}
                  onChange={(value) => updateForm({ telefono_turista: value })}
                  error={errors.telefono_turista}
                />

                <input
                  type="email"
                  placeholder="Tu email (opcional)"
                  aria-label="Email opcional"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.email_turista}
                  onChange={(e) =>
                    updateForm({ email_turista: e.target.value })
                  }
                />

                <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        ¿Viajás con mascotas?
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Nos ayuda a calificar tu consulta.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.mascotas}
                      aria-label="Viajo con mascotas"
                      onClick={() =>
                        updateForm({
                          mascotas: !formData.mascotas,
                          mascotas_detalle: formData.mascotas
                            ? ""
                            : formData.mascotas_detalle,
                        })
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        formData.mascotas ? "bg-primary" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          formData.mascotas
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {formData.mascotas && (
                    <input
                      type="text"
                      placeholder="¿Qué mascota llevás? (opcional)"
                      aria-label="Detalle de la mascota"
                      maxLength={150}
                      className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={formData.mascotas_detalle}
                      onChange={(e) =>
                        updateForm({ mascotas_detalle: e.target.value })
                      }
                    />
                  )}
                  {!petFriendly && (
                    <p className="mt-2 text-[11px] text-amber-600">
                      Este alojamiento no figura como pet friendly. Igual podés
                      consultar; el anfitrión confirma.
                    </p>
                  )}
                </div>

                <select
                  aria-label="Motivo del viaje"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.motivo_viaje}
                  onChange={(e) =>
                    updateForm({ motivo_viaje: e.target.value })
                  }
                >
                  <option value="">Motivo del viaje (opcional)</option>
                  {MOTIVO_VIAJE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Pedidos especiales o consulta (opcional)"
                  aria-label="Pedidos especiales o consulta"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.contenido}
                  onChange={(e) =>
                    updateForm({ contenido: e.target.value })
                  }
                />

                <button
                  type="submit"
                  disabled={
                    sending || rangeHasConflict || Boolean(capacityError)
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-50 ${
                    isWhatsApp
                      ? "bg-whatsapp text-white hover:bg-whatsapp/90"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isWhatsApp ? (
                    <>
                      <WhatsAppIcon className="h-4 w-4" />
                      Enviar consulta por WhatsApp
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar consulta
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Consulta directa · el anfitrión confirma</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
