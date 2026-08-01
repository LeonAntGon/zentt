"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Phone,
  Home,
  ImageIcon,
  Rocket,
  ArrowRight,
} from "lucide-react";
import type { Cabana } from "@/types/cabin";

export type BusinessProfile = {
  metodo_contacto?: "WA" | "MAIL" | string | null;
  telefono?: string | null;
  email_contacto?: string | null;
  foto_perfil?: string | null;
};

/** @deprecated use BusinessProfile */
export type ContactProfile = BusinessProfile;

export type OnboardingProgress = {
  contacto: boolean;
  alojamiento: boolean;
  logo: boolean;
};

/**
 * Contacto completo según método:
 * - WA → teléfono obligatorio
 * - MAIL → email de cuenta o email_contacto
 * - sin método → teléfono o email (fallback legacy)
 */
export function isContactoCompleto(
  profile?: BusinessProfile | null,
  accountEmail?: string | null
): boolean {
  if (!profile) return false;
  const metodo = (profile.metodo_contacto || "WA").toString().toUpperCase();
  const hasPhone = Boolean(profile.telefono?.trim());
  const hasEmail = Boolean(
    profile.email_contacto?.trim() || accountEmail?.trim()
  );

  if (metodo === "MAIL") return hasEmail;
  if (metodo === "WA") return hasPhone;
  return hasPhone || hasEmail;
}

export function evaluateOnboarding(
  cabanas: Cabana[],
  profile?: BusinessProfile | null,
  accountEmail?: string | null
): OnboardingProgress {
  const alojamiento = cabanas.length > 0;
  const contacto = isContactoCompleto(profile, accountEmail);
  const logo = Boolean(profile?.foto_perfil);

  return { contacto, alojamiento, logo };
}

type StepDef = {
  id: keyof OnboardingProgress;
  title: string;
  description: string;
  href: string;
  icon: typeof Phone;
};

const STEPS: StepDef[] = [
  {
    id: "contacto",
    title: "Configura medios de contacto",
    description:
      "Elegí WhatsApp (con número) o Email (correo de tu cuenta) en Configuración.",
    href: "/dashboard/configuracion",
    icon: Phone,
  },
  {
    id: "alojamiento",
    title: "Publica tu primer alojamiento",
    description: "Creá tu primer alojamiento con nombre, precio y capacidad.",
    href: "/dashboard/cabanas/crear",
    icon: Home,
  },
  {
    id: "logo",
    title: "Sube tu logo",
    description: "Subí el logo de tu negocio en Configuración.",
    href: "/dashboard/configuracion",
    icon: ImageIcon,
  },
];

type OnboardingStepperProps = {
  cabanas: Cabana[];
  profile?: BusinessProfile | null;
  accountEmail?: string | null;
  publicUrl?: string;
  hasSlug?: boolean;
};

export function OnboardingStepper({
  cabanas,
  profile,
  accountEmail,
  publicUrl = "",
  hasSlug = false,
}: OnboardingStepperProps) {
  const progress = evaluateOnboarding(cabanas, profile, accountEmail);
  const completedCount = STEPS.filter((s) => progress[s.id]).length;
  const totalSteps = STEPS.length;
  const percent = Math.round((completedCount / totalSteps) * 100);
  const prerequisitesDone =
    progress.contacto && progress.alojamiento && progress.logo;
  const allDone = prerequisitesDone && hasSlug;

  // Sitio ya publicado: no mostrar bloque redundante (la URL vive en el banner)
  if (allDone) {
    return null;
  }

  return (
    <section className="mb-10 rounded-2xl bg-white p-6 shadow-md shadow-primary/10 transition-all duration-300 ease-in-out md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-eyebrow mb-1">Primeros pasos</p>
          <h2 className="font-heading text-xl font-bold text-slate-800 md:text-2xl">
            Completá tu sitio web
          </h2>
          <p className="page-subtitle mt-1">
            {completedCount} de {totalSteps} listos — seguí para publicar.
          </p>
        </div>

        <div className="min-w-[140px]">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Progreso</span>
            <span className="text-slate-800">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <ol className="space-y-3">
        {STEPS.map((step, index) => {
          const done = progress[step.id];
          const Icon = step.icon;

          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`group flex items-center gap-4 rounded-xl border px-4 py-4 transition-all duration-300 ease-in-out ${
                  done
                    ? "border-emerald-100 bg-emerald-50/50 hover:shadow-sm"
                    : "border-slate-100 bg-slate-50/80 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-white hover:shadow-md hover:shadow-primary/10"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-in-out ${
                    done
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white text-slate-400 shadow-sm group-hover:text-primary"
                  }`}
                >
                  {done ? <CheckCircle2 size={22} /> : <Icon size={20} />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Paso {index + 1}
                    </span>
                    {!done && (
                      <Circle
                        size={10}
                        className="text-slate-300"
                        aria-hidden
                      />
                    )}
                  </div>
                  <p
                    className={`font-semibold ${
                      done
                        ? "text-slate-500 line-through decoration-slate-300"
                        : "text-slate-800"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {step.description}
                  </p>
                </div>

                <span
                  className={`hidden shrink-0 text-xs font-semibold transition-all duration-300 ease-in-out sm:inline-flex sm:items-center sm:gap-1 ${
                    done
                      ? "text-emerald-600"
                      : "text-primary opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {done ? (
                    "Listo"
                  ) : (
                    <>
                      Continuar <ArrowRight size={14} />
                    </>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 border-t border-slate-100 pt-5">
        {prerequisitesDone ? (
          <div className="space-y-3">
            {hasSlug && publicUrl ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Tu URL pública
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {publicUrl}
                    </p>
                  </div>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90"
                  >
                    Abrir
                  </a>
                </div>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
                >
                  <Rocket size={18} />
                  ¡Publica tu sitio web!
                </a>
              </>
            ) : (
              <Link
                href="/dashboard/configuracion"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
              >
                <Rocket size={18} />
                Definí el nombre del negocio para obtener tu URL
              </Link>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-4 text-sm font-bold text-slate-400"
              title="Completá los 3 pasos anteriores para ver tu URL"
            >
              <Rocket size={18} />
              ¡Publica tu sitio web!
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Completá los 3 pasos de arriba. La URL de tu web aparece al final.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
