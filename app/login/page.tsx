"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch {
      setError("Credenciales inválidas. Verificá tu usuario y contraseña.");
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
          <h2
            className="font-heading text-4xl font-bold text-white mb-3"
          >
            Gestioná tu complejo de alojamientos
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Controlá tus reservas, actualizá tus precios y conectate con tus
            huéspedes desde un solo lugar.
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
              Bienvenido de vuelta
            </h1>
            <p className="page-subtitle mt-2">
              Ingresá tus credenciales para acceder a tu panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="ui-label">
                Usuario
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu_usuario"
                required
                className="field-auth"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password" className="ui-label">
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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
                "Iniciar sesión"
              )}
            </Button>

            <p className="text-center text-sm font-medium text-slate-500 pt-4">
              ¿No tenés una cuenta?{" "}
              <Link
                href="/register"
                className="text-slate-900 font-bold hover:underline"
              >
                Creá tu cuenta aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
