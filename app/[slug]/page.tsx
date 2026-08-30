import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getMediaUrl } from "@/lib/media";
import { Cabana } from "@/types/cabin";
import { MapPin, Building2, CloudOff } from "lucide-react";
import { CabinLinkCard } from "@/components/public/CabinLinkCard";
import { SocialIconButton } from "@/components/public/SocialIconButton";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { PublicSiteFooter } from "@/components/public/PublicSiteFooter";
import { socialHref } from "@/lib/socialLinks";

export const dynamic = "force-dynamic";

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
  facebook_user?: string | null;
  ubicacion?: string | null;
}

function InstagramIcon({ className }: { className?: string }) {
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

function SitePanel({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white text-center px-6">
      {icon}
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 mb-8 text-sm">{message}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
      >
        Volver a Zentt
      </Link>
    </div>
  );
}

export default async function LinktreePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  let siteData: PublicWebsiteData | null = null;
  let status = 0;
  try {
    const response = await fetch(`${apiUrl}/public/${slug}/`, {
      cache: "no-store",
    });
    status = response.status;
    if (response.ok) {
      siteData = (await response.json()) as PublicWebsiteData;
    }
  } catch {
    // Error de red o de parseo; se muestra un panel genérico abajo.
  }

  if (status === 404 || (!siteData && status > 0 && status !== 500)) {
    return (
      <SitePanel
        icon={<Building2 size={56} className="text-slate-200 mb-6" />}
        title="Sitio no encontrado"
        message="La página web que buscas no existe o ha sido dada de baja."
      />
    );
  }

  if (!siteData) {
    return (
      <SitePanel
        icon={<CloudOff size={56} className="text-slate-200 mb-6" />}
        title="No pudimos cargar el sitio"
        message="Hubo un problema inesperado. Volvé a intentar en unos minutos."
      />
    );
  }

  const nombreParaMostrar =
    siteData.nombre_negocio || `${siteData.first_name}'s Place`;
  const logoUrl = getMediaUrl(siteData.foto_perfil);
  const ubicacion = siteData.ubicacion || null;

  const igHref = socialHref(siteData.instagram_user, "instagram");
  const fbHref = socialHref(siteData.facebook_user, "facebook");
  const ttHref = socialHref(siteData.tiktok_user, "tiktok");
  const ytHref = socialHref(siteData.youtube_user, "youtube");

  const socialLinks = [
    igHref
      ? {
          id: "instagram",
          label: "Instagram",
          href: igHref,
          Icon: InstagramIcon,
        }
      : null,
    fbHref
      ? {
          id: "facebook",
          label: "Facebook",
          href: fbHref,
          Icon: FacebookIcon,
        }
      : null,
    ttHref
      ? {
          id: "tiktok",
          label: "TikTok",
          href: ttHref,
          Icon: TikTokIcon,
        }
      : null,
    ytHref
      ? {
          id: "youtube",
          label: "YouTube",
          href: ytHref,
          Icon: YouTubeIcon,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
  }>;

  const cabanasCount = siteData.cabanas.length;
  const sectionLabel =
    cabanasCount === 1 ? "Nuestro alojamiento" : "Nuestros alojamientos";

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-50 to-white font-public">
      <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:py-16">
        {/* Avatar / Logo */}
        <div className="flex flex-col items-center">
          {logoUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-100">
              <Image
                src={logoUrl}
                alt={nombreParaMostrar}
                fill
                sizes="288px"
                quality={100}
                unoptimized
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-900 text-3xl font-bold text-white shadow-lg">
              {nombreParaMostrar.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="mt-5 text-center text-xl font-bold text-slate-900">
            {nombreParaMostrar}
          </h1>

          {ubicacion && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} className="shrink-0" />
              <span>{ubicacion}</span>
            </p>
          )}
        </div>

        {/* Social Icons */}
        {socialLinks.length > 0 && (
          <div className="mt-6 flex justify-center gap-3">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <SocialIconButton key={id} href={href} icon={Icon} label={label} />
            ))}
          </div>
        )}

        {/* Cabanas Section */}
        <div className="mt-10">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {sectionLabel}
          </p>

          {cabanasCount > 0 ? (
            <div className="space-y-3">
              {siteData.cabanas.map((c) => (
                <CabinLinkCard
                  key={c.id}
                  href={`/${siteData.slug}/cabana/${c.slug}`}
                  image={getMediaUrl(c.imagen_portada) || ""}
                  name={c.nombre}
                  capacity={c.capacidad}
                  price={Number(c.precio)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
              <p className="text-sm font-medium text-slate-400">
                Alojamientos en preparación
              </p>
            </div>
          )}
        </div>
      </div>

      <PublicSiteFooter businessName={nombreParaMostrar} />
    </div>
  );
}