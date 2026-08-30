"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function safeNextPath(next: string | null): string {
  if (!next) return "/dashboard";
  let decoded = next;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return "/dashboard";
  }
  if (decoded === "#precios" || decoded === "/#precios") return "/#precios";
  if (decoded === "/") return "/";
  if (
    decoded.startsWith("/") &&
    !decoded.startsWith("//") &&
    !decoded.includes("://")
  ) {
    return decoded;
  }
  return "/dashboard";
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );

  useEffect(() => {
    if (user && !loading) {
      router.replace(nextPath);
    }
  }, [user, nextPath, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.replace(nextPath);
    } catch {
      setError("Credenciales inválidas. Verificá tu usuario y contraseña.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex min-h-screen">
      <div className="relative hidden lg:flex lg:w-1/2">
        <img
          src="/assets/img-para-inicio-de-sesion.jpg"
          alt="Alojamiento en el bosque al atardecer"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="font-heading mb-3 text-3xl font-bold text-white">
            Gestioná tu complejo de alojamientos
          </h2>
          <p className="max-w-md text-base text-white/80">
            Controlá tus reservas, actualizá tus precios y conectate con tus
            huéspedes desde un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link
              href="/"
              aria-label="Zentt"
              className="mb-5 inline-flex h-10 shrink-0 items-center justify-center leading-none"
            >
              <ZenttLogo className="aspect-[290/130] h-10 w-auto" />
            </Link>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Bienvenido de vuelta
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Ingresá tus credenciales para acceder a tu panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="ui-label text-[11px]">
                Usuario o email
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="field-auth"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="ui-label text-[11px]">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="field-auth pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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
              aria-busy={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ingresando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <p className="text-center text-sm font-medium text-slate-500">
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </Suspense>
  );
}
