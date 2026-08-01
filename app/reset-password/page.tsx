"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const linkMissing = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/accounts/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(
        data?.detail || "Contraseña actualizada. Ya podés iniciar sesión."
      );
      setTimeout(() => router.replace("/login"), 1800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[] | string>;
        if (data.detail) setError(String(data.detail));
        else if (data.new_password) {
          setError(
            Array.isArray(data.new_password)
              ? data.new_password[0]
              : String(data.new_password)
          );
        } else if (data.confirm_password) {
          setError(
            Array.isArray(data.confirm_password)
              ? data.confirm_password[0]
              : String(data.confirm_password)
          );
        } else {
          setError("No pudimos restablecer la contraseña. Pedí un enlace nuevo.");
        }
      } else {
        setError("Error de conexión con el servidor. Intentá más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link
          href="/"
          aria-label="Zentt"
          className="mb-6 inline-flex h-10 shrink-0 items-center justify-center leading-none"
        >
          <ZenttLogo className="h-10 w-auto aspect-[290/130]" />
        </Link>
        <h1 className="page-title text-2xl sm:text-3xl md:text-3xl">
          Nueva contraseña
        </h1>
        <p className="page-subtitle mt-2">
          Elegí una contraseña segura para tu cuenta
        </p>
      </div>

      {linkMissing ? (
        <div className="space-y-6">
          <p className="text-sm font-bold text-red-500 text-center bg-red-50 py-2 rounded-lg">
            El enlace es inválido o incompleto. Pedí uno nuevo desde
            &quot;Olvidé mi contraseña&quot;.
          </p>
          <Button
            asChild
            className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800"
          >
            <Link href="/forgot-password">Pedir nuevo enlace</Link>
          </Button>
        </div>
      ) : success ? (
        <div className="space-y-6">
          <p className="text-sm font-medium text-emerald-700 text-center bg-emerald-50 py-3 px-4 rounded-lg">
            {success}
          </p>
          <Button
            asChild
            className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800"
          >
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="ui-label">
              Nueva contraseña
            </Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
              className="field-auth"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="ui-label">
              Confirmar contraseña
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
              className="field-auth"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-500 text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Guardar contraseña"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-shell flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/assets/cabin-hero.jpg"
          alt="Alojamiento en el bosque"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="font-heading text-4xl font-bold text-white mb-3">
            Creá tu nueva contraseña
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Con el enlace del email podés volver a entrar a tu panel de Zentt.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
