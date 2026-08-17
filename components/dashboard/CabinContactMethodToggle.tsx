"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cabanaSectionClass } from "@/components/dashboard/cabana-form-styles";
import { cn } from "@/lib/utils";

export type ContactMethod = "WA" | "MAIL";

type CabinContactMethodToggleProps = {
  value: ContactMethod;
  onChange: (value: ContactMethod) => void;
  hasPhone: boolean;
  hasEmail: boolean;
  /** Called when the user picks a channel they cannot use yet. */
  onBlocked?: (method: ContactMethod) => void;
};

export function CabinContactMethodToggle({
  value,
  onChange,
  hasPhone,
  hasEmail,
  onBlocked,
}: CabinContactMethodToggleProps) {
  const select = (method: ContactMethod, allowed: boolean) => {
    if (!allowed) {
      onBlocked?.(method);
      return;
    }
    onChange(method);
  };

  return (
    <div className={`${cabanaSectionClass} space-y-3`}>
      <div>
        <h3 className="font-black text-slate-900">Cómo te contactan</h3>
        <p className="mt-1 text-xs text-slate-500">
          Define el canal de consulta en la web de este alojamiento. Los datos
          se toman de{" "}
          <Link
            href="/dashboard/configuracion"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Negocio
          </Link>
          .
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
        role="group"
        aria-label="Método de contacto"
      >
        <button
          type="button"
          onClick={() => select("WA", hasPhone)}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
            value === "WA"
              ? "bg-white text-[#128C7E] shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800",
            !hasPhone && value !== "WA" && "opacity-60"
          )}
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => select("MAIL", hasEmail)}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
            value === "MAIL"
              ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800",
            !hasEmail && value !== "MAIL" && "opacity-60"
          )}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>
    </div>
  );
}
