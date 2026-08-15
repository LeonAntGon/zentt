"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, type User } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import { BusinessAvatar } from "@/components/dashboard/BusinessAvatar";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Camera,
  Check,
  CreditCard,
  Loader2,
  Mail,
  Save,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";
import { toast } from "sonner";
import axios from "axios";
import type { Cabana } from "@/types/cabin";
import {
  getUsernameError,
  normalizeUsername,
  normalizeUsernameLive,
} from "@/lib/username";
import {
  UnsavedChangesGuard,
  type UnsavedChangesGuardHandle,
} from "@/components/dashboard/UnsavedChangesGuard";

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
  const [publicUsername, setPublicUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const unsavedGuardRef = useRef<UnsavedChangesGuardHandle | null>(null);
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [cabanasLoading, setCabanasLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "complejo" | null>(
    null
  );

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get("payment");
    if (!payment) return;
    if (payment === "success") {
      toast.success("Pago recibido. Actualizamos tu plan en unos segundos.");
      void checkCurrentUser();
    } else if (payment === "failure") {
      toast.error("El pago no se completó. Podés intentar de nuevo.");
    } else if (payment === "pending") {
      toast.message("El pago quedó pendiente. Te avisamos cuando se acredite.");
    }
    window.history.replaceState({}, "", `${window.location.pathname}#planes`);
  }, [checkCurrentUser]);

  useEffect(() => {
    const loadCabanas = async () => {
      try {
        const { data } = await api.get<Cabana[]>("/cabanas/");
        setCabanas(data || []);
      } catch {
        // Silently fail
      } finally {
        setCabanasLoading(false);
      }
    };
    loadCabanas();
  }, []);

  const startCheckout = async (plan: "pro" | "complejo") => {
    const run = async () => {
      setCheckoutLoading(plan);
      try {
        const { data } = await api.post<{
          checkout_url?: string;
          init_point?: string;
          sandbox_init_point?: string;
        }>("/payments/create-preference/", { plan });
        const url =
          data.checkout_url || data.init_point || data.sandbox_init_point;
        if (!url) {
          toast.error("No pudimos iniciar el pago.");
          return;
        }
        window.location.href = url;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 503) {
          toast.error("MercadoPago todavía no está configurado.");
        } else {
          toast.error("No pudimos iniciar el pago. Probá de nuevo.");
        }
      } finally {
        setCheckoutLoading(null);
      }
    };

    if (unsavedGuardRef.current) {
      unsavedGuardRef.current.tryLeave(() => {
        void run();
      });
    } else {
      void run();
    }
  };

  const currentPlan = user?.profile?.plan || "gratis";
  const planLabel =
    currentPlan === "complejo"
      ? "Plan Complejo"
      : currentPlan === "pro"
        ? "Plan Pro"
        : "Plan Gratis";
  const planUsage = cabanasLoading
    ? "Cargando..."
    : currentPlan === "complejo"
      ? `${cabanas.length} de 15 alojamientos`
      : currentPlan === "pro"
        ? `${cabanas.length} de 5 alojamientos`
        : `${cabanas.length} de 1 alojamiento`;
  const expiresLabel = user?.profile?.plan_expires_at
    ? new Date(user.profile.plan_expires_at).toLocaleDateString("es-AR")
    : null;

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
    setPublicUsername(user.profile?.slug || user.username || "");
    setUsernameError("");
    setPreviewUrl(getMediaUrl(user.profile?.foto_perfil));
    setHydrated(true);
  }, [user]);

  const telefonoWhatsapp = useMemo(
    () => `${countryCode}${phoneLocal.replace(/\D/g, "")}`,
    [countryCode, phoneLocal]
  );

  const slugPreview = publicUsername
    ? `zentt.app/${normalizeUsername(publicUsername) || publicUsername}`
    : "zentt.app/tu-usuario";

  const savedPublicUsername = user?.profile?.slug || user?.username || "";
  const savedPhone = parseWhatsApp(user?.profile?.telefono);
  const isDirty =
    hydrated &&
    (nombre !== (user?.profile?.nombre_negocio || "") ||
      metodoContacto !== (user?.profile?.metodo_contacto || "WA") ||
      countryCode !== savedPhone.countryCode ||
      phoneLocal !== savedPhone.localNumber ||
      stripAt(instagramUser) !== (user?.profile?.instagram_user || "") ||
      stripAt(tiktokUser) !== (user?.profile?.tiktok_user || "") ||
      stripAt(youtubeUser) !== (user?.profile?.youtube_user || "") ||
      normalizeUsername(publicUsername) !==
        normalizeUsername(savedPublicUsername));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setLogoSaving(true);
    try {
      const formData = new FormData();
      formData.append("profile.foto_perfil", file);
      const { data } = await api.patch<User>("/accounts/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data);
      setPreviewUrl(getMediaUrl(data.profile?.foto_perfil));
      toast.success("Logo guardado");
    } catch {
      setPreviewUrl(getMediaUrl(user?.profile?.foto_perfil));
      toast.error("No se pudo guardar el logo");
    } finally {
      URL.revokeObjectURL(localPreview);
      setLogoSaving(false);
    }
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

  const persist = async (): Promise<boolean> => {
    const error = validate();
    if (error) {
      toast.error(error);
      return false;
    }

    const nextUsername = normalizeUsername(publicUsername);
    const usernameChanged =
      nextUsername !== normalizeUsername(savedPublicUsername);
    if (usernameChanged) {
      const usernameErr = getUsernameError(publicUsername);
      if (usernameErr) {
        setUsernameError(usernameErr);
        toast.error(usernameErr);
        return false;
      }
    }

    const payload = buildPayload();
    setLoading(true);

    const profileBody = {
      nombre_negocio: payload.nombre,
      metodo_contacto: payload.metodo_contacto,
      telefono: payload.telefono_whatsapp || null,
      email_contacto: payload.email_contacto || null,
      instagram_user: payload.instagram_user || null,
      tiktok_user: payload.tiktok_user || null,
      youtube_user: payload.youtube_user || null,
    };

    const body: { profile: typeof profileBody; username?: string } = {
      profile: profileBody,
    };
    if (usernameChanged) {
      body.username = nextUsername;
    }

    try {
      const { data: updatedUser } = await api.patch<User>(
        "/accounts/me/",
        body
      );

      setUser(updatedUser);
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
      setPublicUsername(updatedUser.profile?.slug || updatedUser.username);
      setUsernameError("");

      await checkCurrentUser();
      toast.success("Identidad del negocio guardada");
      return true;
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        const resBody = err.response.data as Record<string, unknown>;
        const usernameErr = resBody.username;
        const profileErrors = resBody.profile as
          | Record<string, string[] | string>
          | undefined;
        const telefonoErr = profileErrors?.telefono;
        const emailErr = profileErrors?.email_contacto;
        const usernameMsg = Array.isArray(usernameErr)
          ? usernameErr[0]
          : typeof usernameErr === "string"
            ? usernameErr
            : null;
        if (usernameMsg) {
          setUsernameError(usernameMsg);
          toast.error(usernameMsg);
        } else if (telefonoErr) {
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await persist();
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
                className={`absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90 ${
                  logoSaving
                    ? "pointer-events-none opacity-70"
                    : "cursor-pointer"
                }`}
                title="Subir logo"
              >
                {logoSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={logoSaving}
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
                Nombre visible en tu sitio público.
              </p>
              <div className="space-y-2 pt-2">
                <Label
                  htmlFor="public-username"
                  className="text-sm font-semibold text-slate-700"
                >
                  URL de tu sitio
                </Label>
                <div
                  className={`flex overflow-hidden rounded-xl border bg-white ${
                    usernameError ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  <span className="flex shrink-0 items-center bg-slate-50 px-3 text-sm font-medium text-slate-500">
                    zentt.app/
                  </span>
                  <input
                    id="public-username"
                    value={publicUsername}
                    onChange={(e) => {
                      setUsernameError("");
                      setPublicUsername(normalizeUsernameLive(e.target.value));
                    }}
                    placeholder="tu-usuario"
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none focus:ring-0"
                    autoComplete="username"
                  />
                </div>
                {usernameError ? (
                  <p className="text-xs font-medium text-red-500">
                    {usernameError}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    También es tu nombre de usuario para iniciar sesión.{" "}
                    <span className="font-medium text-slate-500">
                      {slugPreview}
                    </span>
                  </p>
                )}
              </div>
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

        {/* —— Tarjeta 4: Tu Plan —— */}
        <section id="planes" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="section-title mb-0">Tu plan</h2>
              <p className="text-sm text-slate-500">
                Plan actual y renovación cada 30 días
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {planLabel}
                  </span>
                  {currentPlan === "gratis" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      1 alojamiento
                    </span>
                  )}
                  {currentPlan === "pro" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{planUsage}</p>
                {expiresLabel && currentPlan !== "gratis" && (
                  <p className="mt-1 text-xs text-slate-400">
                    Vence el {expiresLabel}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {currentPlan !== "pro" && currentPlan !== "complejo" && (
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-60"
                    onClick={() => void startCheckout("pro")}
                  >
                    {checkoutLoading === "pro" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    Actualizar a Pro · $9.900
                  </button>
                )}
                {currentPlan === "pro" && (
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => void startCheckout("pro")}
                  >
                    {checkoutLoading === "pro" && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Renovar Pro · $9.900
                  </button>
                )}
                {currentPlan !== "complejo" && (
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => void startCheckout("complejo")}
                  >
                    {checkoutLoading === "complejo" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {currentPlan === "pro" ? "Pasar a Complejo" : "Complejo"} · $19.900
                  </button>
                )}
                {currentPlan === "complejo" && (
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
                    onClick={() => void startCheckout("complejo")}
                  >
                    {checkoutLoading === "complejo" && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Renovar Complejo · $19.900
                  </button>
                )}
              </div>
            </div>

            {currentPlan === "gratis" && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Desbloqueá más con Pro:
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Hasta 5 alojamientos",
                    "Sync Airbnb y Booking",
                    "Precios dinámicos",
                    "Analytics detalladas",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check size={14} className="shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Los pagos se procesan de forma segura a través de MercadoPago.
            Cada plan pago cubre 30 días y se renueva de forma manual desde
            esta pantalla. No hay débito automático.
          </p>
        </section>

        {/* Spacer for sticky button */}
        <div className="h-4" aria-hidden />
      </form>
      )}

      {/* Botón fijo Guardar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-md md:left-52">
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
      <UnsavedChangesGuard
        dirty={isDirty}
        saving={loading}
        onSave={persist}
        guardRef={unsavedGuardRef}
      />
    </div>
  );
}
