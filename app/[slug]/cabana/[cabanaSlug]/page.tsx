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
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { CabinGallery } from "@/components/public/CabinGallery";
import { CabinVideoEmbeds } from "@/components/public/CabinVideoEmbeds";
import { resolveAmenities } from "@/lib/amenities";
import { toast } from "sonner";
import { eachDayOfInterval, parseISO, startOfDay } from "date-fns";

const cabinNavLinks = (slug: string) => [
  { href: `/${slug}#inicio`, label: "Inicio" },
  { href: `/${slug}#cabanas`, label: "Alojamientos" },
  { href: `/${slug}#contacto`, label: "Contacto" },
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  const isDisabled = useMemo(
    () => occupiedMatchers(ocupadas),
    [ocupadas]
  );

  const lastNight = range?.from
    ? range.to ?? range.from
    : undefined;

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
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!cabana)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <Building2 size={48} className="text-slate-300" />
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
    ...(portadaUrl
      ? [{ src: portadaUrl, alt: cabana.nombre }]
      : []),
    ...galeriaUrls.map((src, i) => ({
      src,
      alt: `${cabana.nombre} · foto ${i + 2}`,
    })),
  ];
  const cabinAmenities = resolveAmenities(cabana.amenities);

  const navLinks = cabinNavLinks(slug);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-6">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <span className="min-w-0 flex-1 truncate text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 md:hidden">
            {cabana.nombre}
          </span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
              aria-label="Menú"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/login"
              title="Acceso anfitrión"
              aria-label="Iniciar sesión — acceso anfitrión"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary md:flex"
            >
              <UserIcon className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-slate-100 bg-white/95 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-3 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
              >
                <UserIcon className="h-4 w-4" />
                Acceso anfitrión
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-8">
        <CabinGallery images={carouselImages} className="mb-6 md:mb-10" />

        <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">
          <div className="md:w-3/5">
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {cabana.nombre}
            </h1>
            <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-100 pb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" /> Hasta{" "}
                {cabana.capacidad} personas
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-400" /> Elegí las
                noches
              </div>
            </div>
            <p className="whitespace-pre-line text-base font-normal leading-relaxed text-slate-600 md:text-lg">
              {cabana.descripcion?.trim() ||
                "Hermoso alojamiento equipado para tu descanso."}
            </p>

            {cabinAmenities.length > 0 && (
              <div className="mt-8">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Comodidades
                </p>
                <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900">
                  Todo lo que vas a encontrar
                </h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {cabinAmenities.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                    >
                      <a.icon className="h-4 w-4 shrink-0 text-slate-700" />
                      <span className="text-sm font-medium text-slate-900">
                        {a.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CabinVideoEmbeds
              videos={cabana.videos || []}
              className="mt-10"
            />
          </div>

          <div className="md:w-2/5">
            <div
              className={`rounded-2xl border p-4 shadow-lg shadow-slate-900/[0.03] transition-colors md:sticky md:top-24 md:p-6 ${
                isWhatsApp
                  ? "border-emerald-100 bg-emerald-50/40"
                  : "border-slate-100 bg-white"
              }`}
            >
              <div className="mb-5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Tarifa por noche
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                    ${cabana.precio}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    / noche
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-slate-100 bg-white p-3 sm:p-3">
                <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:px-2">
                  Noches de estadía
                </p>
                <p className="mb-2 px-1 text-[11px] text-slate-500 sm:px-2">
                  Elegí las noches
                </p>
                <div className="w-full min-w-0">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={[
                      { before: startOfDay(new Date()) },
                      isDisabled,
                    ]}
                    numberOfMonths={1}
                    className="w-full p-0 sm:p-1"
                  />
                </div>
                <div className="mt-2 flex gap-3 px-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-slate-200" /> Ocupado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-primary" /> Selección
                  </span>
                </div>
              </div>

              {noches > 0 && (
                <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Estimado · {noches} {noches === 1 ? "noche" : "noches"}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatMoneyARS(estimado)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Estimado según tu tarifa. El anfitrión confirma.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitConsulta} className="space-y-3">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  required
                  className="field-auth"
                  value={formData.nombre_turista}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_turista: e.target.value,
                    })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="field-auth"
                  value={formData.email_turista}
                  onChange={(e) =>
                    setFormData({ ...formData, email_turista: e.target.value })
                  }
                />
                <input
                  type="tel"
                  placeholder={
                    isWhatsApp
                      ? "Tu WhatsApp"
                      : "Teléfono / WhatsApp de contacto"
                  }
                  required
                  className="field-auth"
                  value={formData.telefono_turista}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono_turista: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Mensaje o duda adicional"
                  rows={2}
                  required
                  className="field-auth-area"
                  value={formData.contenido}
                  onChange={(e) =>
                    setFormData({ ...formData, contenido: e.target.value })
                  }
                />

                <button
                  type="submit"
                  disabled={sending}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    isWhatsApp
                      ? "btn-whatsapp shadow-lg shadow-[#25D366]/25"
                      : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                  }`}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : isWhatsApp ? (
                    <>
                      <WhatsAppIcon className="h-4 w-4" /> Consultar por
                      WhatsApp
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Enviar consulta
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Consulta directa · el anfitrión confirma
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
