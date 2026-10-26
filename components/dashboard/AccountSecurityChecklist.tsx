"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerify } from "@/components/dashboard/EmailVerify";
import { PhoneField } from "@/components/public/PhoneField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ModalKind = "email" | "password" | null;

function parseApiError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | {
        detail?: string;
        email?: string[] | string;
        telefono?: string[] | string;
        new_password?: string[] | string;
        confirm_password?: string[] | string;
        profile?: {
          telefono?: string[] | string;
          email_contacto?: string[] | string;
        };
      }
    | undefined;

  const first = (value?: string[] | string) =>
    Array.isArray(value) ? value[0] : value;

  return (
    first(data?.profile?.telefono) ||
    first(data?.telefono) ||
    first(data?.email) ||
    first(data?.new_password) ||
    first(data?.confirm_password) ||
    data?.detail ||
    fallback
  );
}

export function AccountSecurityChecklist() {
  const { user, checkCurrentUser } = useAuth();
  const { openVerify } = useEmailVerify();
  const [modal, setModal] = useState<ModalKind>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ email: "", telefono: "" });
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (
      pendingEmail &&
      (user?.email || "").trim().toLowerCase() === pendingEmail.toLowerCase()
    ) {
      setPendingEmail(null);
    }
  }, [pendingEmail, user?.email]);

  const profile = user?.profile;
  const needsOnboarding = Boolean(
    user && (profile?.onboarding_required || !(user.email || "").trim())
  );
  const hasPhone = Boolean(profile?.telefono?.trim());
  const emailDone = Boolean(
    (user?.email || "").trim() && user?.email_verified && hasPhone
  );
  const passwordDone = Boolean(profile?.onboarding_password_changed_at);
  const doneCount = [emailDone, passwordDone].filter(Boolean).length;
  const percent = Math.round((doneCount / 2) * 100);

  if (!user || !needsOnboarding || (emailDone && passwordDone)) {
    return null;
  }

  const openEmailModal = () => {
    setEmailForm({
      email: (user.email || "").trim(),
      telefono: profile?.telefono || "",
    });
    setFormError("");
    setModal("email");
  };

  const openPasswordModal = () => {
    setPasswordForm({ new_password: "", confirm_password: "" });
    setFormError("");
    setModal("password");
  };

  const handleEmailAction = () => {
    if (pendingEmail) {
      openVerify({
        reason: `Ingresá el código enviado a ${pendingEmail}.`,
        send: false,
      });
      return;
    }
    openEmailModal();
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = emailForm.email.trim();
    const telefono = emailForm.telefono.trim();

    if (!email) {
      setFormError("Ingresá tu email definitivo.");
      return;
    }
    if (!telefono) {
      setFormError("Ingresá tu número de WhatsApp.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const { data } = await api.patch<{
        email_change_pending?: boolean;
        detail?: string;
        pending_email?: string;
      }>("/accounts/me/", {
        email,
        profile: { telefono, metodo_contacto: "WA" },
      });

      setModal(null);
      await checkCurrentUser();

      if (data.email_change_pending) {
        setPendingEmail(data.pending_email || email);
        toast.message(
          data.detail ||
            "Te enviamos un código al nuevo email para confirmar el cambio."
        );
        openVerify({
          reason: `Ingresá el código enviado a ${data.pending_email || email}.`,
          send: false,
        });
        return;
      }

      toast.success("Email y WhatsApp actualizados.");
    } catch (error) {
      setFormError(parseApiError(error, "No pudimos guardar tus datos."));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { new_password, confirm_password } = passwordForm;

    if (new_password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(new_password)) {
      setFormError("La contraseña debe tener al menos una letra mayúscula.");
      return;
    }
    if (!/[0-9]/.test(new_password)) {
      setFormError("La contraseña debe tener al menos un número.");
      return;
    }
    if (new_password !== confirm_password) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const { data } = await api.post<{
        detail?: string;
        onboarding_completed?: boolean;
      }>("/accounts/me/onboarding/password/", passwordForm);

      setModal(null);
      setPasswordForm({ new_password: "", confirm_password: "" });
      await checkCurrentUser();
      toast.success(
        data.onboarding_completed
          ? "Contraseña actualizada. Tu cuenta está completa."
          : data.detail || "Contraseña actualizada."
      );
    } catch (error) {
      setFormError(
        parseApiError(error, "No pudimos actualizar la contraseña.")
      );
    } finally {
      setSaving(false);
    }
  };

  const emailDescription = !(user.email || "").trim()
    ? "Cargá tu email definitivo y confirmalo con un código."
    : !user.email_verified
      ? "Verificá tu email definitivo para asegurar tu cuenta."
      : "Agregá tu número de WhatsApp para recibir avisos de reservas.";

  const emailLabel = pendingEmail
    ? "Verificar código"
    : emailDone
      ? "Listo"
      : "Completar";

  return (
    <section className="mb-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-md shadow-amber-900/5 transition-all duration-300 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldCheck size={21} />
          </span>
          <div>
            <p className="page-eyebrow mb-1 text-amber-700">Seguridad</p>
            <h2 className="font-heading text-xl font-bold text-slate-800 md:text-2xl">
              Completá tu cuenta
            </h2>
            <p className="page-subtitle mt-1">
              {doneCount} de 2 listos. Podés seguir usando el panel mientras
              tanto.
            </p>
          </div>
        </div>

        <div className="min-w-[140px]">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Progreso</span>
            <span className="text-slate-800">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-in-out"
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
        <li>
          <div
            className={`flex items-center gap-4 rounded-xl border px-4 py-4 ${
              emailDone
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-slate-100 bg-slate-50/80"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                emailDone
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-white text-slate-400 shadow-sm"
              }`}
            >
              {emailDone ? <CheckCircle2 size={22} /> : <Mail size={20} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Paso 1
                </span>
                {!emailDone && (
                  <Circle size={10} className="text-slate-300" aria-hidden />
                )}
              </div>
              <p
                className={`font-semibold ${
                  emailDone
                    ? "text-slate-500 line-through decoration-slate-300"
                    : "text-slate-800"
                }`}
              >
                Email y WhatsApp
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {emailDone ? "Datos de contacto listos." : emailDescription}
              </p>
            </div>
            {!emailDone && (
              <button
                type="button"
                onClick={handleEmailAction}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                {emailLabel}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </li>

        <li>
          <div
            className={`flex items-center gap-4 rounded-xl border px-4 py-4 ${
              passwordDone
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-slate-100 bg-slate-50/80"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                passwordDone
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-white text-slate-400 shadow-sm"
              }`}
            >
              {passwordDone ? <CheckCircle2 size={22} /> : <KeyRound size={20} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Paso 2
                </span>
                {!passwordDone && (
                  <Circle size={10} className="text-slate-300" aria-hidden />
                )}
              </div>
              <p
                className={`font-semibold ${
                  passwordDone
                    ? "text-slate-500 line-through decoration-slate-300"
                    : "text-slate-800"
                }`}
              >
                Contraseña definitiva
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {passwordDone
                  ? "Contraseña actualizada."
                  : "Reemplazá la contraseña temporal que te compartimos."}
              </p>
            </div>
            {!passwordDone && (
              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                Cambiar
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </li>
      </ol>

      {modal && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-security-modal-title"
          onClick={() => {
            if (!saving) setModal(null);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
              onClick={() => {
                if (!saving) setModal(null);
              }}
            >
              <X size={18} />
            </button>

            {modal === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <h2
                    id="account-security-modal-title"
                    className="pr-8 text-lg font-bold text-slate-900"
                  >
                    Email y WhatsApp
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Usaremos tu email para iniciar sesión y tu WhatsApp para
                    avisarte sobre reservas.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-email">Email definitivo</Label>
                  <Input
                    id="onboarding-email"
                    type="email"
                    value={emailForm.email}
                    onChange={(event) =>
                      setEmailForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-telefono">Número de WhatsApp</Label>
                  <PhoneField
                    value={emailForm.telefono}
                    onChange={(value) =>
                      setEmailForm((current) => ({
                        ...current,
                        telefono: value,
                      }))
                    }
                  />
                </div>

                {formError && (
                  <p
                    className="rounded-lg bg-red-50 py-2 text-center text-sm font-semibold text-red-600"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full bg-slate-900"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : emailForm.email.trim().toLowerCase() !==
                    (user.email || "").trim().toLowerCase() ? (
                    "Guardar y enviar código"
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <h2
                    id="account-security-modal-title"
                    className="pr-8 text-lg font-bold text-slate-900"
                  >
                    Contraseña definitiva
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Elegí una contraseña nueva. No necesitás ingresar la
                    contraseña temporal.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-password">Nueva contraseña</Label>
                  <Input
                    id="onboarding-password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        new_password: event.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <p className="text-[10px] leading-tight text-slate-400">
                    8+ caracteres, 1 mayúscula y 1 número
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-password-confirm">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="onboarding-password-confirm"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirm_password: event.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {formError && (
                  <p
                    className="rounded-lg bg-red-50 py-2 text-center text-sm font-semibold text-red-600"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full bg-slate-900"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Guardar contraseña"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
