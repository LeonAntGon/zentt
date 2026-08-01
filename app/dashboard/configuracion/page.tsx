"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth, type User } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import { BusinessAvatar } from "@/components/dashboard/BusinessAvatar";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Camera,
  Loader2,
  Mail,
  Save,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";
import { toast } from "sonner";
import axios from "axios";

type MetodoContacto = "WA" | "MAIL";

const COUNTRY_CODES = [
  { code: "+54", label: "🇦🇷 +54", flag: "🇦🇷" },
  { code: "+598", label: "🇺🇾 +598", flag: "🇺🇾" },
  { code: "+56", label: "🇨🇱 +56", flag: "🇨🇱" },
  { code: "+52", label: "🇲🇽 +52", flag: "🇲🇽" },
  { code: "+1", label: "🇺🇸 +1", flag: "🇺🇸" },
] as const;

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 ease-in-out focus:border-primary focus:ring-2 focus:ring-primary";

function stripAt(value: string) {
  return value.replace(/^@+/, "").trim();
}

function parseWhatsApp(full?: string | null) {
  const digits = (full || "").replace(/[^\d+]/g, "");
  const normalized = digits.startsWith("+") ? digits : digits ? `+${digits}` : "";

  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (normalized.startsWith(c.code)) {
      return {
        countryCode: c.code,
        localNumber: normalized.slice(c.code.length).replace(/\D/g, ""),
      };
    }
  }

  return { countryCode: "+54", localNumber: normalized.replace(/\D/g, "") };
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

export default function SettingsPage() {
  const { user, checkCurrentUser, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [nombre, setNombre] = useState("");
  const [metodoContacto, setMetodoContacto] = useState<MetodoContacto>("WA");
  const [countryCode, setCountryCode] = useState("+54");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [instagramUser, setInstagramUser] = useState("");
  const [tiktokUser, setTiktokUser] = useState("");
  const [youtubeUser, setYoutubeUser] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const parsed = parseWhatsApp(user.profile?.telefono);
    setNombre(user.profile?.nombre_negocio || "");
    setMetodoContacto((user.profile?.metodo_contacto || "WA") as MetodoContacto);
    setCountryCode(parsed.countryCode);
    setPhoneLocal(parsed.localNumber);
    setInstagramUser(user.profile?.instagram_user || "");
    setTiktokUser(user.profile?.tiktok_user || "");
    setYoutubeUser(user.profile?.youtube_user || "");
    setPreviewUrl(getMediaUrl(user.profile?.foto_perfil));
    setHydrated(true);
  }, [user]);

  const telefonoWhatsapp = useMemo(
    () => `${countryCode}${phoneLocal.replace(/\D/g, "")}`,
    [countryCode, phoneLocal]
  );

  const slugPreview = user?.profile?.slug
    ? `zentt.app/${user.profile.slug}`
    : "Se genera al guardar el nombre comercial";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = (): string | null => {
    if (metodoContacto === "WA" && !phoneLocal.trim()) {
      return "Si elegís WhatsApp, el número es obligatorio.";
    }
    if (metodoContacto === "MAIL" && !user?.email?.trim()) {
      return "Tu cuenta no tiene email. Agregalo en Perfil para recibir consultas.";
    }
    return null;
  };

  /** Payload lógico del formulario (campos exactos del brief). */
  const buildPayload = () => ({
    nombre: nombre.trim(),
    metodo_contacto: metodoContacto,
    telefono_whatsapp: phoneLocal.trim() ? telefonoWhatsapp : "",
    email_contacto: (user?.email || "").trim(),
    instagram_user: stripAt(instagramUser),
    tiktok_user: stripAt(tiktokUser),
    youtube_user: stripAt(youtubeUser),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = buildPayload();
    setLoading(true);

    // Contrato lógico → campos reales de Profile en Django
    const profileBody = {
      nombre_negocio: payload.nombre,
      metodo_contacto: payload.metodo_contacto,
      telefono: payload.telefono_whatsapp || null,
      // Siempre sincroniza el email de cuenta (consultas = User.email)
      email_contacto: payload.email_contacto || null,
      instagram_user: payload.instagram_user || null,
      tiktok_user: payload.tiktok_user || null,
      youtube_user: payload.youtube_user || null,
    };

    try {
      let updatedUser: User;

      if (selectedFile) {
        const formData = new FormData();
        Object.entries(profileBody).forEach(([key, value]) => {
          formData.append(
            `profile.${key}`,
            value === null || value === undefined ? "" : String(value)
          );
        });
        formData.append("profile.foto_perfil", selectedFile);

        const { data } = await api.patch<User>("/accounts/me/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedUser = data;
      } else {
        const { data } = await api.patch<User>("/accounts/me/", {
          profile: profileBody,
        });
        updatedUser = data;
      }

      setUser(updatedUser);
      setSelectedFile(null);
      setPreviewUrl(getMediaUrl(updatedUser.profile?.foto_perfil));

      const parsed = parseWhatsApp(updatedUser.profile?.telefono);
      setNombre(updatedUser.profile?.nombre_negocio || "");
      setMetodoContacto(
        (updatedUser.profile?.metodo_contacto || "WA") as MetodoContacto
      );
      setCountryCode(parsed.countryCode);
      setPhoneLocal(parsed.localNumber);
      setInstagramUser(updatedUser.profile?.instagram_user || "");
      setTiktokUser(updatedUser.profile?.tiktok_user || "");
      setYoutubeUser(updatedUser.profile?.youtube_user || "");

      await checkCurrentUser();
      toast.success("Identidad del negocio guardada");
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        const body = err.response.data as Record<string, unknown>;
        const profileErrors = body.profile as
          | Record<string, string[] | string>
          | undefined;
        const telefonoErr = profileErrors?.telefono;
        const emailErr = profileErrors?.email_contacto;
        if (telefonoErr) {
          toast.error(
            Array.isArray(telefonoErr) ? telefonoErr[0] : String(telefonoErr)
          );
        } else if (emailErr) {
          toast.error(
            Array.isArray(emailErr) ? emailErr[0] : String(emailErr)
          );
        } else {
          toast.error("No se pudieron guardar los cambios");
        }
      } else {
        toast.error("No se pudieron guardar los cambios");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pb-28">
      {!hydrated && !user ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <form
        id="identidad-negocio-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-5 p-6 md:p-10"
      >
        <header className="mb-2">
          <p className="page-eyebrow mb-1">Configuración</p>
          <h1 className="page-title">Identidad del Negocio</h1>
          <p className="page-subtitle mt-1">
            Cómo se ve tu marca y cómo te contactan los huéspedes.
          </p>
        </header>

        {/* —— Tarjeta 1: Identidad Pública —— */}
        <section className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
          <h2 className="section-title mb-5">
            Identidad pública
          </h2>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo del negocio"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BusinessAvatar
                    fotoPerfil={null}
                    nombreNegocio={nombre}
                    size="sm"
                    className="h-28 w-28 rounded-xl border-0 shadow-none"
                  />
                )}
              </div>
              <label
                className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90"
                title="Subir logo"
              >
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <Label
                htmlFor="nombre"
                className="text-sm font-semibold text-slate-700"
              >
                Nombre comercial
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Alojamientos del Sol"
                  className={`${inputBase} pl-10`}
                />
              </div>
              <p className="text-xs text-slate-400">
                URL pública:{" "}
                <span className="font-medium text-slate-500">{slugPreview}</span>
              </p>
            </div>
          </div>
        </section>

        {/* —— Tarjeta 2: Contacto —— */}
        <section className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
          <h2 className="section-title mb-2">
            ¿Cómo preferís recibir consultas?
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Este contacto se usa en tu sitio público y en los alojamientos sin
            contacto propio. Con WhatsApp el número es obligatorio; con Email
            usamos el correo de tu cuenta y el teléfono es opcional.
          </p>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodoContacto("WA")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ease-in-out ${
                metodoContacto === "WA"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <WhatsAppIcon className="text-lg" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setMetodoContacto("MAIL")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ease-in-out ${
                metodoContacto === "MAIL"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Mail size={18} /> Email
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                WhatsApp
                {metodoContacto === "WA" && (
                  <span className="ml-1 text-primary">*</span>
                )}
              </Label>
              <div
                className={`flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ease-in-out focus-within:border-primary focus-within:ring-2 focus-within:ring-primary ${
                  metodoContacto === "WA" ? "ring-1 ring-primary/15" : ""
                }`}
              >
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none"
                  aria-label="Código de país"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneLocal}
                  onChange={(e) =>
                    setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="3815551234"
                  required={metodoContacto === "WA"}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400">
                {metodoContacto === "WA"
                  ? "Obligatorio para recibir consultas por WhatsApp."
                  : "Opcional si preferís email."}{" "}
                Se guarda como{" "}
                <span className="font-medium text-slate-500">
                  {phoneLocal.trim() ? telefonoWhatsapp : "—"}
                </span>
                .
              </p>
            </div>

            {metodoContacto === "MAIL" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-700">
                  Las consultas llegan a{" "}
                  <span className="font-semibold text-primary">
                    {user?.email || "tu email de cuenta"}
                  </span>
                  .
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Podés cambiarlo en{" "}
                  <Link
                    href="/dashboard/perfil"
                    className="font-semibold text-primary hover:underline"
                  >
                    Perfil
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        {/* —— Tarjeta 3: Redes —— */}
        <section className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
          <h2 className="section-title mb-5">
            Redes sociales
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="instagram_user"
                className="text-sm font-semibold text-slate-700"
              >
                Instagram
              </Label>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ease-in-out focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <span className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3.5 text-slate-500">
                  <InstagramIcon className="h-4 w-4" />
                  <span className="text-sm font-medium text-slate-400">@</span>
                </span>
                <input
                  id="instagram_user"
                  value={instagramUser}
                  onChange={(e) => setInstagramUser(stripAt(e.target.value))}
                  placeholder="micabana"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tiktok_user"
                className="text-sm font-semibold text-slate-700"
              >
                TikTok
              </Label>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ease-in-out focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <span className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3.5 text-slate-500">
                  <TikTokIcon className="h-4 w-4" />
                  <span className="text-sm font-medium text-slate-400">@</span>
                </span>
                <input
                  id="tiktok_user"
                  value={tiktokUser}
                  onChange={(e) => setTiktokUser(stripAt(e.target.value))}
                  placeholder="micabana"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="youtube_user"
                className="text-sm font-semibold text-slate-700"
              >
                YouTube
              </Label>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ease-in-out focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <span className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3.5 text-slate-500">
                  <YouTubeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium text-slate-400">@</span>
                </span>
                <input
                  id="youtube_user"
                  value={youtubeUser}
                  onChange={(e) => setYoutubeUser(stripAt(e.target.value))}
                  placeholder="micabana"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Spacer for sticky button */}
        <div className="h-4" aria-hidden />
      </form>
      )}

      {/* Botón fijo Guardar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-md md:left-64">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-6 py-4">
          <button
            type="submit"
            form="identidad-negocio-form"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
