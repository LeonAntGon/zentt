"use client";

import { useEffect, useState } from "react";
import { Check, Globe2, Loader2, Clock3 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

type CustomDomain = {
  domain: string | null;
  display_domain: string | null;
  status: "requested" | "pending" | "verified" | "coordinated";
  requested_at?: string;
};

export function CustomDomainCard() {
  const [domain, setDomain] = useState<CustomDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<{ custom_domain: CustomDomain | null }>(
        "/accounts/custom-domain/"
      );
      setDomain(data.custom_domain);
    } catch {
      toast.error("No pudimos cargar la solicitud de dominio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const requestDomain = async () => {
    setSaving(true);
    try {
      const { data } = await api.post<{ custom_domain: CustomDomain }>(
        "/accounts/custom-domain/"
      );
      setDomain(data.custom_domain);
      toast.success("Recibimos tu pedido. Nos vamos a contactar para coordinarlo.");
    } catch {
      toast.error("No pudimos registrar tu pedido. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const isCoordinated = domain?.status === "coordinated" || domain?.status === "verified";

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Globe2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="section-title mb-0">Dominio propio</h2>
          <p className="mt-1 text-sm text-slate-500">
            Podés usar una dirección como <strong>misalojamientos.com</strong> para que tus huéspedes te encuentren fácilmente.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-label="Cargando" />
      ) : isCoordinated && domain?.display_domain ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-800">Tu dominio propio</p>
            <p className="mt-1 text-lg font-bold text-emerald-950">{domain.display_domain}</p>
          </div>
          <span className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-full bg-white px-3 py-2 text-xs font-semibold text-emerald-700 sm:self-auto">
            <Check size={14} /> Coordinado
          </span>
        </div>
      ) : domain ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-950">Pediste tu dominio propio</p>
            <p className="mt-1 text-sm text-amber-800">Nos ocupamos de coordinarlo con vos. Te avisaremos cuando esté listo.</p>
          </div>
          <span className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-full bg-white px-3 py-2 text-xs font-semibold text-amber-700 sm:self-auto">
            <Clock3 size={14} /> En coordinación
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            ¿Querés un dominio propio? Pedinos que lo coordinemos y nos ocupamos de la parte técnica por vos.
          </p>
          <button
            type="button"
            onClick={() => void requestDomain()}
            disabled={saving}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Enviando…" : "Pedir mi dominio propio"}
          </button>
        </div>
      )}
    </section>
  );
}
