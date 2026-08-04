"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import { Cabana } from "@/types/cabin";
import { toast } from "sonner";
import {
  Users,
  ArrowRight,
  Send,
  MapPin,
  Phone,
  Menu,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";

interface PublicWebsiteData {
  nombre_negocio: string | null;
  telefono: string | null;
  foto_perfil: string | null;
  slug: string;
  first_name: string;
  cabanas: Cabana[];
  username?: string;
  metodo_contacto?: "WA" | "MAIL";
  email_contacto?: string | null;
  instagram_user?: string | null;
  tiktok_user?: string | null;
  youtube_user?: string | null;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
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

const HERO_TITLE = "Tu lugar ideal para descansar y disfrutar.";
const HERO_SUBTITLE =
  "Confort, comodidad y todo lo que necesitás para una estadía perfecta.";

export default function FreeTemplatePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [siteData, setSiteData] = useState<PublicWebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const response = await api.get<PublicWebsiteData>(`/public/${slug}/`);
        setSiteData(response.data);
      } catch (err) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setErrorNotFound(true);
        } else {
          toast.error("Hubo un problema al cargar el sitio.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPublicData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/public/${slug}/contacto/`, {
        ...form,
        origen: "WEB",
      });
      toast.success("¡Mensaje enviado con éxito!");
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    } catch {
      toast.error("Error al enviar el mensaje. Intenta nuevamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-xs">
          Cargando sitio...
        </p>
      </div>
    );
  }

  if (errorNotFound || !siteData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
        <Building2 size={64} className="text-slate-300 mb-6" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          Sitio no encontrado
        </h1>
        <p className="text-slate-500 mb-8">
          La página web que buscas no existe o ha sido dada de baja.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
        >
          Volver a Zentt
        </Link>
      </div>
    );
  }

  const prefersWhatsApp = (siteData.metodo_contacto || "WA") === "WA";
  const whatsappUrl =
    prefersWhatsApp && siteData.telefono
      ? `https://wa.me/${siteData.telefono.replace(/[^0-9]/g, "")}`
      : "#";
  const mailtoUrl =
    !prefersWhatsApp && siteData.email_contacto
      ? `mailto:${siteData.email_contacto}`
      : "#";
  const heroImage =
    getMediaUrl(siteData.cabanas[0]?.imagen_portada) ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";
  const logoUrl = getMediaUrl(siteData.foto_perfil);
  const nombreParaMostrar =
    siteData.nombre_negocio || `${siteData.first_name}'s Place`;

  const ig = (siteData.instagram_user || "").trim().replace(/^@+/, "");
  const tt = (siteData.tiktok_user || "").trim().replace(/^@+/, "");
  const yt = (siteData.youtube_user || "").trim().replace(/^@+/, "");
  const socialLinks = [
    ig
      ? {
          id: "instagram",
          label: "Instagram",
          href: `https://www.instagram.com/${ig}/`,
          Icon: InstagramIcon,
        }
      : null,
    tt
      ? {
          id: "tiktok",
          label: "TikTok",
          href: `https://www.tiktok.com/@${tt}`,
          Icon: TikTokIcon,
        }
      : null,
    yt
      ? {
          id: "youtube",
          label: "YouTube",
          href: `https://www.youtube.com/@${yt}`,
          Icon: YouTubeIcon,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
  }>;
  const hasSocial = socialLinks.length > 0;

  const cabanasCount = siteData.cabanas.length;
  const alojamientosLabel =
    cabanasCount === 1 ? "El alojamiento" : "Alojamientos";

  const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#cabanas", label: alojamientosLabel },
    ...(hasSocial ? [{ href: "#redes", label: "Redes" }] : []),
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 scroll-smooth">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nombreParaMostrar}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold uppercase text-white">
                {nombreParaMostrar.charAt(0)}
              </div>
            )}
            <span className="max-w-[160px] truncate text-sm font-semibold tracking-tight text-slate-900 sm:max-w-none sm:text-base">
              {nombreParaMostrar}
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {prefersWhatsApp && siteData.telefono && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
            {!prefersWhatsApp && siteData.email_contacto && (
              <a
                href={mailtoUrl}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </a>
            )}
            <button
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
              className="ml-0.5 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary md:flex"
            >
              <UserIcon className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-slate-100 bg-white/95 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-3 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </a>
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

      <section
        id="inicio"
        className="relative flex h-[75vh] max-h-[75vh] min-h-[520px] items-end overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/45 to-slate-900/20" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-12 md:px-10 md:pb-16">
          <div className="max-w-2xl animate-fade-in">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:mb-4">
              {nombreParaMostrar}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {HERO_TITLE}
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg md:mt-5">
              {HERO_SUBTITLE}
            </p>
            <a
              href="#cabanas"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition-transform hover:scale-[1.02] md:mt-9 md:px-7 md:py-3.5"
            >
              Ver alojamientos <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section
        id="cabanas"
        className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:mt-24 sm:pb-28 md:mt-28 md:pb-32"
      >
        <div className="mb-10 sm:mb-14">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            {alojamientosLabel}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {cabanasCount === 1
              ? "Conocé el alojamiento"
              : "Elegí dónde quedarte"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {siteData.cabanas.map((c) => {
            const cabanaImage =
              getMediaUrl(c.imagen_portada) ||
              "https://images.unsplash.com/photo-1542718610-a1d656d1884c";

            return (
              <Link
                key={c.id}
                href={`/${siteData.slug}/cabana/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cabanaImage}
                    alt={c.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md backdrop-blur">
                    ${c.precio}
                    <span className="ml-1 text-[10px] font-medium text-slate-500">
                      / noche
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
                  <div>
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900 underline-offset-4 group-hover:underline">
                      {c.nombre}
                    </h3>
                    <p className="line-clamp-2 text-sm font-normal leading-relaxed text-slate-500">
                      {c.descripcion ||
                        "Hermoso alojamiento equipado para tu descanso."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>Hasta {c.capacidad}</span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition-colors group-hover:bg-primary group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {siteData.cabanas.length === 0 && (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Alojamiento en preparación.
              </p>
            </div>
          )}
        </div>
      </section>

      {hasSocial && (
        <section id="redes" className="bg-white py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center sm:mb-12">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Conectá
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Redes sociales
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {socialLinks.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-200 hover:bg-white hover:shadow-sm"
                >
                  <Icon className="h-5 w-5 text-slate-700" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contacto" className="bg-slate-50 py-20 sm:py-28 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Contacto
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              ¿Hablamos?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
            >
              <input
                type="text"
                placeholder="Nombre completo"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="field-auth"
              />
              <input
                type="email"
                placeholder="Tu email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field-auth"
              />
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp de contacto"
                required
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="field-auth"
              />
              <textarea
                placeholder="¿Para qué fechas buscas disponibilidad?"
                rows={4}
                required
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                className="field-auth-area"
              />
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                <Send className="h-4 w-4" /> Enviar Consulta
              </button>
            </form>

            <div className="flex flex-col justify-center gap-6 sm:gap-8 md:pl-4">
              <p className="text-lg font-medium leading-relaxed text-slate-500">
                Estamos aquí para ayudarte a planear tu estadía perfecta en{" "}
                <span className="font-bold text-slate-900">
                  {nombreParaMostrar}
                </span>
                .
              </p>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Ubicación
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    Consultar dirección exacta
                  </p>
                </div>
              </div>

              {prefersWhatsApp && siteData.telefono && (
                <>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100">
                      <Phone className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Teléfono
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {siteData.telefono}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10">
                      <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        WhatsApp
                      </p>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-[#25D366] hover:underline"
                      >
                        Escríbenos directamente
                      </a>
                    </div>
                  </div>
                </>
              )}

              {!prefersWhatsApp && siteData.email_contacto && (
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Email
                    </p>
                    <a
                      href={mailtoUrl}
                      className="text-base font-semibold text-slate-900 hover:underline"
                    >
                      {siteData.email_contacto}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            © {new Date().getFullYear()} {nombreParaMostrar}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Powered by
            </span>
            <span className="font-bold tracking-tight text-slate-900">
              ZENTT
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
