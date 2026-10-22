"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Copy, Globe2, Loader2, RefreshCw, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

type DomainRecord = {
  record_type: string;
  host: string;
  value: string;
  cname_target: string;
  a_target: string;
};

type CustomDomain = {
  domain: string;
  display_domain: string;
  status: "pending" | "verified";
  dns: DomainRecord;
};

export function CustomDomainCard() {
  const [domain, setDomain] = useState<CustomDomain | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<{ custom_domain: CustomDomain | null }>(
        "/accounts/custom-domain/"
      );
      setDomain(data.custom_domain);
      if (data.custom_domain) setInput(data.custom_domain.display_domain);
    } catch {
      toast.error("No pudimos cargar la configuración del dominio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addDomain = async () => {
    if (!input.trim()) {
      toast.error("Ingresá un dominio.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post<{ custom_domain: CustomDomain }>(
        "/accounts/custom-domain/",
        { domain: input.trim() }
      );
      setDomain(data.custom_domain);
      setInput(data.custom_domain.display_domain);
      toast.success("Dominio agregado. Configurá el DNS para verificarlo.");
    } catch (error) {
      const detail = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.response?.data?.domain?.[0]
        : null;
      toast.error(String(detail || "No pudimos agregar el dominio."));
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setSaving(true);
    try {
      const { data } = await api.post<{ custom_domain: CustomDomain }>(
        "/accounts/custom-domain/verify/"
      );
      setDomain(data.custom_domain);
      toast.success("Dominio verificado correctamente.");
    } catch (error) {
      const detail = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : null;
      toast.error(String(detail || "Todavía no encontramos el registro DNS."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("¿Eliminar este dominio personalizado?")) return;
    setSaving(true);
    try {
      await api.delete("/accounts/custom-domain/");
      setDomain(null);
      setInput("");
      toast.success("Dominio eliminado.");
    } catch {
      toast.error("No pudimos eliminar el dominio.");
    } finally {
      setSaving(false);
    }
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Globe2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="section-title mb-0">Dominio personalizado</h2>
          <p className="mt-1 text-sm text-slate-500">
            Publicá tu web con un dominio propio, como cabañaslanorita.com.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={Boolean(domain) || saving}
              placeholder="tudominio.com"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:bg-slate-50"
              aria-label="Dominio personalizado"
            />
            {!domain && (
              <button
                type="button"
                onClick={() => void addDomain()}
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Agregar dominio"}
              </button>
            )}
          </div>

          {domain && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">{domain.display_domain}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    domain.status === "verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {domain.status === "verified" ? <Check size={13} /> : null}
                  {domain.status === "verified" ? "Verificado" : "Pendiente"}
                </span>
              </div>

              {domain.status === "pending" && (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>
                    En tu proveedor DNS creá este registro TXT para demostrar que
                    el dominio es tuyo:
                  </p>
                  <DnsRow label="Tipo" value={domain.dns.record_type} onCopy={copy} copied={copied} />
                  <DnsRow label="Host" value={domain.dns.host} onCopy={copy} copied={copied} />
                  <DnsRow label="Valor" value={domain.dns.value} onCopy={copy} copied={copied} />
                  <p className="text-xs text-slate-500">
                    Después agregá el dominio al proyecto de Vercel y apuntá el
                    dominio raíz a <strong>{domain.dns.a_target}</strong> (A), o
                    un subdominio a <strong>{domain.dns.cname_target}</strong>
                    (CNAME).
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void verify()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      <RefreshCw size={14} className={saving ? "animate-spin" : ""} />
                      Verificar DNS
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              )}
              {domain.status === "verified" && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-emerald-700">Tu sitio ya puede responder en este dominio.</p>
                  <button
                    type="button"
                    onClick={() => void remove()}
                    disabled={saving}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"
                  >
                    <Trash2 size={13} /> Quitar
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function DnsRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: (value: string) => void;
  copied: string | null;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="w-12 shrink-0 text-[11px] font-semibold uppercase text-slate-400">{label}</span>
      <code className="min-w-0 flex-1 break-all text-xs text-slate-700">{value}</code>
      <button
        type="button"
        onClick={() => void onCopy(value)}
        aria-label={`Copiar ${label}`}
        className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        {copied === value ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
