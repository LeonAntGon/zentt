"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStickySaveBar } from "@/components/dashboard/FormStickySaveBar";
import { UnsavedChangesGuard } from "@/components/dashboard/UnsavedChangesGuard";
import {
  getUsernameError,
  normalizeUsername,
  normalizeUsernameLive,
} from "@/lib/username";
import {
  KeyRound,
  Loader2,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

export default function PerfilPage() {
  const { user, checkCurrentUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  });
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
      });
      setEmailError("");
      setUsernameError("");
      setHydrated(true);
    }
  }, [user]);

  const fullName =
    [formData.first_name, formData.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Usuario";

  const isDirty =
    hydrated &&
    (formData.first_name !== (user?.first_name || "") ||
      formData.last_name !== (user?.last_name || "") ||
      formData.email.trim() !== (user?.email || "") ||
      normalizeUsername(formData.username) !==
        normalizeUsername(user?.username || ""));

  const persist = async (): Promise<boolean> => {
    setEmailError("");
    setUsernameError("");
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresá un email válido.");
      toast.error("Ingresá un email válido.");
      return false;
    }

    const nextUsername = normalizeUsername(formData.username);
    const usernameChanged =
      nextUsername !== normalizeUsername(user?.username || "");
    if (usernameChanged) {
      const usernameErr = getUsernameError(formData.username);
      if (usernameErr) {
        setUsernameError(usernameErr);
        toast.error(usernameErr);
        return false;
      }
    }

    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email", email);
      if (usernameChanged) {
        data.append("username", nextUsername);
      }
      await api.patch("/accounts/me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await checkCurrentUser();
      toast.success("Perfil actualizado");
      return true;
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            email?: string[] | string;
            username?: string[] | string;
          };
        };
      };
      const emailErr = err.response?.data?.email;
      const usernameErr = err.response?.data?.username;
      const emailMsg = Array.isArray(emailErr)
        ? emailErr[0]
        : typeof emailErr === "string"
          ? emailErr
          : null;
      const usernameMsg = Array.isArray(usernameErr)
        ? usernameErr[0]
        : typeof usernameErr === "string"
          ? usernameErr
          : null;
      if (emailMsg) setEmailError(emailMsg);
      if (usernameMsg) setUsernameError(usernameMsg);
      toast.error(emailMsg || usernameMsg || "No se pudo guardar el perfil");
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await persist();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setSavingPassword(true);
    try {
      await api.post("/accounts/me/change-password/", passwordData);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("Contraseña actualizada");
    } catch (error) {
      const err = error as {
        response?: { data?: { current_password?: string[] } };
      };
      const msg =
        err.response?.data?.current_password?.[0] ||
        "No se pudo cambiar la contraseña";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in p-6 pb-28 duration-500 md:p-10">
      <header className="mb-10">
        <p className="page-eyebrow mb-2 flex items-center gap-2">
          <User size={14} /> Cuenta
        </p>
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle mt-1">
          Tu cuenta personal: datos de acceso y seguridad.
        </p>
      </header>

      <div className="mb-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <UserAvatar
            firstName={formData.first_name}
            lastName={formData.last_name}
            email={user?.email}
            alt={fullName}
            size="2xl"
          />
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-black capitalize text-slate-900">
                {fullName.toLowerCase()}
              </h2>
              <p className="mt-1 flex items-center justify-center gap-2 font-medium text-slate-500 sm:justify-start">
                <Mail size={16} className="text-slate-400" />
                {formData.email || user?.email}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <Shield size={14} className="text-emerald-500" />
              @{formData.username || user?.username}
            </div>
          </div>
        </div>
      </div>

      <form
        id="perfil-cuenta-form"
        onSubmit={handleSaveProfile}
        className="mb-8 space-y-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="h-6 w-1.5 rounded-full bg-primary" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
            Cuenta de administrador
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="ml-1 font-bold text-slate-700">
              Nombre
            </Label>
            <Input
              id="first_name"
              className="h-14 rounded-2xl border-none bg-slate-50 font-medium"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="ml-1 font-bold text-slate-700">
              Apellido
            </Label>
            <Input
              id="last_name"
              className="h-14 rounded-2xl border-none bg-slate-50 font-medium"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="ml-1 font-bold text-slate-700">
            Nombre de usuario
          </Label>
          <Input
            id="username"
            autoComplete="username"
            className={`h-14 rounded-2xl border-none bg-slate-50 font-medium ${
              usernameError ? "ring-2 ring-red-300" : ""
            }`}
            value={formData.username}
            onChange={(e) => {
              setUsernameError("");
              setFormData({
                ...formData,
                username: normalizeUsernameLive(e.target.value),
              });
            }}
          />
          {usernameError ? (
            <p className="ml-1 text-xs font-medium text-red-500">
              {usernameError}
            </p>
          ) : (
            <p className="ml-1 text-[10px] font-medium text-slate-400">
              También es la URL de tu sitio: zentt.app/
              {normalizeUsername(formData.username) || "tu-usuario"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="ml-1 font-bold text-slate-700">
            Email de inicio de sesión
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className={`h-14 rounded-2xl border-none bg-slate-50 font-medium ${
              emailError ? "ring-2 ring-red-300" : ""
            }`}
            value={formData.email}
            onChange={(e) => {
              setEmailError("");
              setFormData({ ...formData, email: e.target.value });
            }}
          />
          {emailError ? (
            <p className="ml-1 text-xs font-medium text-red-500">{emailError}</p>
          ) : (
            <p className="ml-1 text-[10px] font-medium text-slate-400">
              Usás este correo para iniciar sesión y recuperar la contraseña.
            </p>
          )}
        </div>
      </form>

      <form
        onSubmit={handleChangePassword}
        className="mb-8 space-y-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="h-6 w-1.5 rounded-full bg-slate-300" />
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
            <KeyRound size={14} /> Cambiar contraseña
          </h3>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="current_password"
            className="ml-1 font-bold text-slate-700"
          >
            Contraseña actual
          </Label>
          <Input
            id="current_password"
            type="password"
            className="h-14 rounded-2xl border-none bg-slate-50 font-medium"
            value={passwordData.current_password}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                current_password: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="new_password"
              className="ml-1 font-bold text-slate-700"
            >
              Nueva contraseña
            </Label>
            <Input
              id="new_password"
              type="password"
              className="h-14 rounded-2xl border-none bg-slate-50 font-medium"
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  new_password: e.target.value,
                })
              }
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirm_password"
              className="ml-1 font-bold text-slate-700"
            >
              Confirmar nueva
            </Label>
            <Input
              id="confirm_password"
              type="password"
              className="h-14 rounded-2xl border-none bg-slate-50 font-medium"
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirm_password: e.target.value,
                })
              }
              required
              minLength={8}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={savingPassword}
          variant="outline"
          className="h-14 w-full rounded-2xl font-black uppercase tracking-widest"
        >
          {savingPassword ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <KeyRound className="mr-2" size={18} />
          )}
          Actualizar contraseña
        </Button>
      </form>

      <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 md:p-8">
        <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-slate-900">
          Iniciar sesión con Google
        </h3>
        <p className="mb-6 max-w-xl text-sm font-medium text-slate-500">
          Pronto podrás vincular Google para acceder más rápido y usar tu foto
          automáticamente.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-12 cursor-not-allowed gap-3 rounded-xl bg-white font-bold opacity-80"
        >
          <GoogleIcon className="h-5 w-5" />
          Continuar con Google
          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Próximamente
          </span>
        </Button>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          asChild
          variant="ghost"
          className="gap-2 rounded-xl font-bold text-slate-600"
        >
          <Link href="/dashboard/configuracion">
            <Settings size={16} />
            Ir a configuración del negocio
          </Link>
        </Button>
      </div>

      <FormStickySaveBar
        form="perfil-cuenta-form"
        loading={savingProfile}
        submitLabel="Guardar cambios"
        loadingLabel="Guardando..."
      />
      <UnsavedChangesGuard
        dirty={isDirty}
        saving={savingProfile}
        onSave={persist}
      />
    </div>
  );
}
