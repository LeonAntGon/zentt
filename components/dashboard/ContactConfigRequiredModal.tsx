"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Mail, Settings2, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { ContactMethod } from "@/components/dashboard/CabinContactMethodToggle";

type ContactConfigRequiredModalProps = {
  open: boolean;
  method: ContactMethod;
  onClose: () => void;
};

const COPY: Record<
  ContactMethod,
  {
    title: string;
    body: string;
    Icon: ComponentType<{ className?: string }>;
  }
> = {
  WA: {
    title: "Falta tu número de WhatsApp",
    body: "Para que los huéspedes te contacten por WhatsApp en este alojamiento, primero tenés que cargar tu número en Configuración.",
    Icon: WhatsAppIcon,
  },
  MAIL: {
    title: "Falta tu email de contacto",
    body: "Para recibir consultas por email en este alojamiento, primero tenés que tener un email en tu cuenta (Perfil) o en Configuración.",
    Icon: Mail,
  },
};

export function ContactConfigRequiredModal({
  open,
  method,
  onClose,
}: ContactConfigRequiredModalProps) {
  if (!open) return null;

  const { title, body, Icon } = COPY[method];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-config-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            method === "WA" ? "bg-[#25D366]/10 text-[#128C7E]" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <h2
          id="contact-config-modal-title"
          className="pr-8 text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Entendido
          </button>
          <Link
            href="/dashboard/configuracion"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            <Settings2 size={16} />
            Ir a Configuración
          </Link>
        </div>
      </div>
    </div>
  );
}
