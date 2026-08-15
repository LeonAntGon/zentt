"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import {
  estimateStayTotalInclusive,
  formatMoneyARS,
  nightsCountInclusive,
  toExclusiveCheckout,
  toISODate,
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
import { resolveAmenities } from "@/lib/amenities";
import { toast } from "sonner";
import { eachDayOfInterval, parseISO, startOfDay } from "date-fns";

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
  });

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
      } catch {
        toast.error("No pudimos encontrar este alojamiento.");
      } finally {
        setLoading(false);
      }
    };
    if (slug && cabanaSlug) fetchCabanaDetail();
  }, [slug, cabanaSlug]);

  const isDisabled = useMemo(() => occupiedMatchers(ocupadas), [ocupadas]);

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

    const from = range!.from!;
    const to = range!.to ?? from;
    const fechaDesde = toISODate(from);
    const fechaHasta = toExclusiveCheckout(to);
    const nights = nightsCountInclusive(from, to);

    try {
      setSending(true);
      await api.post(`/public/${slug}/cabana/${cabanaSlug}/mensajes/`, {
        nombre_turista: formData.nombre_turista,
        email_turista: formData.email_turista,
        telefono_turista: formData.telefono_turista,
        contenido: `Consulta por ${cabana.nombre}: ${formData.contenido}`,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        origen: "WEB",
      });

      toast.success("¡Consulta enviada con éxito!");

      if (cabana.metodo_contacto === "WA") {
        const waNum = cabana.telefono_whatsapp?.replace(/[^0-9]/g, "") || "";
        if (waNum) {
          const text = `Hola! Vi el alojamiento ${cabana.nombre}. Soy ${formData.nombre_turista}. Noches: ${fechaDesde} a ${toISODate(to)} (${nights} noches). ${formData.contenido}`;
          window.open(
            `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`,
            "_blank"
          );
        } else {
          toast.message(
            "Consulta enviada. El anfitrión aún no configuró WhatsApp."
          );
        }
      }

      setFormData({
        nombre_turista: "",
        email_turista: "",
        telefono_turista: "",
        contenido: "",
      });
      setRange(undefined);
    } catch {
      toast.error("Error al enviar. Inténtalo de nuevo.");
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <Building2 size={48} className="text-slate-200" />
        <p className="text-sm font-medium text-slate-500">
          No pudimos encontrar este alojamiento.
        </p>
        <button
          onClick={() => router.push(`/${slug}`)}
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
        >
          Volver
        </button>
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

  return (
    <div className="min-h-screen bg-white font-public text-slate-900">
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

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:py-8">
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
                    numberOfMonths={1}
                    className="w-full p-0"
                  />
                </div>
                <div className="mt-2 flex gap-3 px-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-slate-300" /> Ocupado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-primary" /> Tu
                    selección
                  </span>
                </div>

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
                    Estimado según tarifa. El anfitrión confirma.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitConsulta} className="space-y-3">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.nombre_turista}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_turista: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.email_turista}
                  onChange={(e) =>
                    setFormData({ ...formData, email_turista: e.target.value })
                  }
                />
                <input
                  type="tel"
                  placeholder={isWhatsApp ? "Tu WhatsApp" : "Tu teléfono"}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.telefono_turista}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono_turista: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Mensaje o consulta adicional"
                  rows={2}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.contenido}
                  onChange={(e) =>
                    setFormData({ ...formData, contenido: e.target.value })
                  }
                />

                <button
                  type="submit"
                  disabled={sending || rangeHasConflict}
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
                      Consultar por WhatsApp
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
    </div>
  );
}
