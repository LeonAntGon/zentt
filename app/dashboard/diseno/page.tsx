"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Check, ExternalLink, Monitor, Palette, Smartphone } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth, type User } from "@/contexts/AuthContext";
import { getMediaUrl } from "@/lib/media";
import { getDesign, DESIGNS, type DesignKey } from "@/lib/designs";
import type { Cabana } from "@/types/cabin";

type PreviewStyle = CSSProperties & Record<`--${string}`, string>;

function DesignPreview({
  design,
  businessName,
  cabanas,
  logo,
  device,
}: {
  design: DesignKey;
  businessName: string;
  cabanas: Cabana[];
  logo: string | null;
  device: "phone" | "desktop";
}) {
  const definition = getDesign(design);
  const style: PreviewStyle = {
    "--site-bg": definition.tokens.bg,
    "--site-text": definition.tokens.text,
    "--site-surface": definition.tokens.surface,
    "--site-border": definition.tokens.border,
    "--site-primary": definition.tokens.primary,
    "--site-primary-text": definition.tokens.primaryText,
    "--site-muted": definition.tokens.muted,
    "--site-accent": definition.tokens.accent,
    "--site-accent-text": definition.tokens.accentText,
  };
  const firstCabana = cabanas[0];

  return (
    <div
      data-design={design}
      style={style}
      className={`site-theme overflow-hidden rounded-[1.25rem] border border-[var(--site-border)] bg-[var(--site-bg)] text-[var(--site-text)] shadow-inner transition-all duration-200 ${device === "phone" ? "mx-auto max-w-[350px]" : "w-full"}`}
    >
      <div className="site-preview-hero relative min-h-36 overflow-hidden px-5 py-6">
        {design === "atardecer" && firstCabana?.imagen_portada ? (
          <img
            src={getMediaUrl(firstCabana.imagen_portada) || ""}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
        ) : null}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="site-preview-primary flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold">
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="site-preview-kicker truncate text-[10px] font-bold uppercase tracking-[0.18em]">Tu web</p>
              <h3 className="truncate text-lg font-bold">{businessName}</h3>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm font-medium opacity-90">Encontrá tu próximo descanso.</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="site-preview-accent text-center text-[10px] font-bold uppercase tracking-[0.18em]">Alojamientos</div>
        {(cabanas.length ? cabanas.slice(0, 2) : [{ id: 1, nombre: "Tu alojamiento", capacidad: 4, precio: "0", imagen_portada: null } as Cabana]).map((cabana) => (
          <div key={cabana.id} className="site-preview-surface flex items-center gap-3 rounded-2xl border p-2.5">
            {cabana.imagen_portada ? (
              <img src={getMediaUrl(cabana.imagen_portada) || ""} alt="" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-[var(--site-border)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{cabana.nombre}</p>
              <p className="site-preview-muted text-xs">Hasta {cabana.capacidad} personas</p>
              <p className="site-preview-accent text-sm font-bold">Ver alojamiento</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignPage() {
  const { user, setUser } = useAuth();
  const currentDesign = (user?.profile?.design || "claro") as DesignKey;
  const [selected, setSelected] = useState<DesignKey>(currentDesign);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [saving, setSaving] = useState(false);
  const [cabanas, setCabanas] = useState<Cabana[]>([]);

  useEffect(() => {
    void api.get<Cabana[]>("/cabanas/").then(({ data }) => setCabanas(data || [])).catch(() => undefined);
  }, []);

  const definition = getDesign(selected);
  const publicUrl = user?.profile?.slug ? `/${user.profile.slug}` : "/dashboard/configuracion";
  const businessName = user?.profile?.nombre_negocio || "Tu alojamiento";
  const logo = getMediaUrl(user?.profile?.foto_perfil);

  const publish = async () => {
    if (selected === currentDesign) return;
    const previousDesign = currentDesign;
    setSaving(true);
    try {
      const { data } = await api.patch<User>("/accounts/me/", { profile: { design: selected } });
      setUser(data);
      toast.success(`Tu web ahora usa ${definition.name}.`, {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: () => {
            void api
              .patch<User>("/accounts/me/", { profile: { design: previousDesign } })
              .then(({ data: restored }) => {
                setUser(restored);
                setSelected(previousDesign);
                toast.success(`Volviste a ${getDesign(previousDesign).name}.`);
              })
              .catch(() => toast.error("No pudimos deshacer el cambio."));
          },
        },
      });
    } catch {
      toast.error("No pudimos publicar el diseño. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/dashboard/configuracion" className="hover:text-primary">Mi web</Link>
            <span aria-hidden>›</span>
            <span className="text-slate-600">Diseño</span>
          </div>
          <p className="page-eyebrow">Personalizá tu web</p>
          <h1 className="page-title mt-2">Elegí un diseño</h1>
          <p className="page-subtitle mt-2 max-w-2xl">Probá los cuatro estilos y publicá el que mejor represente tus alojamientos. No necesitás configurar colores ni tipografías.</p>
        </div>
        {user?.profile?.slug ? (
          <Link href={publicUrl} target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
            Ver mi web <ExternalLink size={16} />
          </Link>
        ) : null}
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Palette size={19} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Diseño publicado</p>
            <p className="mt-0.5 font-bold text-slate-900">{getDesign(currentDesign).name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">La vista previa no cambia tu web hasta que publiques.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <section aria-labelledby="design-options-title">
          <h2 id="design-options-title" className="sr-only">Opciones de diseño</h2>
          <div role="radiogroup" aria-label="Diseños disponibles" className="grid gap-4 sm:grid-cols-2">
            {DESIGNS.map((design) => {
              const isSelected = selected === design.id;
              const isPublished = currentDesign === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(design.id)}
                  className={`group rounded-2xl border bg-white p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-slate-200"}`}
                >
                  <div className="pointer-events-none mb-3">
                    <DesignPreview design={design.id} businessName={businessName} cabanas={cabanas} logo={logo} device="phone" />
                  </div>
                  <div className="flex items-start justify-between gap-3 px-1">
                    <div>
                      <p className="font-bold text-slate-900">{design.name}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{design.description}</p>
                      <p className="mt-2 text-xs font-semibold text-primary">Ideal para: {design.idealFor}</p>
                    </div>
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary text-white" : "border-slate-300 text-transparent"}`} aria-hidden>
                      <Check size={15} />
                    </span>
                  </div>
                  <div className="mt-3 flex min-h-6 items-center gap-2 px-1 text-xs font-semibold">
                    {isPublished ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Publicado</span> : isSelected ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Vista previa</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lg:sticky lg:top-6 lg:self-start" aria-labelledby="preview-title">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="page-eyebrow">Vista previa</p>
                <h2 id="preview-title" className="mt-1 text-xl font-bold text-slate-900">{definition.name}</h2>
              </div>
              <div className="flex rounded-xl border border-slate-200 p-1" aria-label="Tamaño de vista previa">
                <button type="button" onClick={() => setDevice("phone")} aria-label="Vista celular" aria-pressed={device === "phone"} className={`rounded-lg p-2 ${device === "phone" ? "bg-slate-100 text-primary" : "text-slate-400"}`}><Smartphone size={17} /></button>
                <button type="button" onClick={() => setDevice("desktop")} aria-label="Vista computadora" aria-pressed={device === "desktop"} className={`rounded-lg p-2 ${device === "desktop" ? "bg-slate-100 text-primary" : "text-slate-400"}`}><Monitor size={17} /></button>
              </div>
            </div>
            <DesignPreview design={selected} businessName={businessName} cabanas={cabanas} logo={logo} device={device} />
            <button type="button" onClick={() => void publish()} disabled={saving || selected === currentDesign} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Publicando…" : selected === currentDesign ? "Este diseño ya está publicado" : `Publicar ${definition.name}`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
