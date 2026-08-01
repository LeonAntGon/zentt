"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/accounts/password-reset/", { email });
      setSuccess(
        data?.detail ||
          "Si existe una cuenta con ese email, te enviamos instrucciones."
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[] | string>;
        if (data.email) {
          setError(Array.isArray(data.email) ? data.email[0] : String(data.email));
        } else if (data.detail) {
          setError(String(data.detail));
        } else {
          setError("No pudimos procesar el pedido. Intentá de nuevo.");
        }
      } else {
        setError("Error de conexión con el servidor. Intentá más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            Recuperá el acceso a tu panel
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Te enviamos un enlace seguro a tu email para crear una nueva
            contraseña.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
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
              Olvidé mi contraseña
            </h1>
            <p className="page-subtitle mt-2">
              Ingresá el email de tu cuenta y te mandamos el enlace
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <p className="text-sm font-medium text-emerald-700 text-center bg-emerald-50 py-3 px-4 rounded-lg">
                {success}
              </p>
              <p className="text-center text-sm text-slate-500">
                Revisá tu bandeja de entrada (y spam). El enlace vence por
                seguridad.
              </p>
              <Button
                asChild
                className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800"
              >
                <Link href="/login">Volver al inicio de sesión</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="ui-label">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
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
                  "Enviar enlace"
                )}
              </Button>

              <p className="text-center text-sm font-medium text-slate-500 pt-2">
                <Link
                  href="/login"
                  className="text-slate-900 font-bold hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
