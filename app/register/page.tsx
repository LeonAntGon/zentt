"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { normalizeUsername, normalizeUsernameLive } from "@/lib/username";
import { toast } from "sonner";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "username" ? normalizeUsernameLive(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const username = normalizeUsername(formData.username);
    if (!username) {
      setError("Ingresá un nombre de usuario válido.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden. Verificá los datos.");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("La contraseña debe tener al menos una letra mayúscula.");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("La contraseña debe tener al menos un número.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/accounts/register/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username,
        email: formData.email,
        password: formData.password,
        accept_legal: acceptLegal,
      });

      await login(username, formData.password);
      toast.success("Cuenta creada. Bienvenido a Zentt.");
      router.replace("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[] | string>;

        if (data.username) setError(`Usuario: ${data.username[0]}`);
        else if (data.first_name) setError(`Nombre: ${data.first_name[0]}`);
        else if (data.last_name) setError(`Apellido: ${data.last_name[0]}`);
        else if (data.accept_legal) setError(String(data.accept_legal[0] || data.accept_legal));
        else if (data.email) setError(`Email: ${data.email[0]}`);
        else if (data.password) setError(`Contraseña: ${data.password[0]}`);
        else if (data.detail) setError(String(data.detail));
        else if (data.error) setError(String(data.error));
        else if (data.non_field_errors) {
          setError(String(data.non_field_errors[0] || data.non_field_errors));
        }
        else setError("Error al crear la cuenta. Verificá los datos.");
      } else {
        setError(
          "Error de conexión con el servidor. Intentá de nuevo más tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "field-auth h-10";
  const labelClass = "ui-label text-[11px]";

  return (
    <div className="auth-shell flex min-h-dvh lg:h-dvh lg:overflow-hidden">
      <div className="relative hidden lg:flex lg:w-1/2">
        <img
          src="/assets/img-para-registro.jpg"
          alt="Alojamiento entre montañas"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="font-heading mb-3 text-3xl font-bold text-white">
            Empezá a gestionar tu alojamiento como un profesional
          </h2>
          <p className="max-w-md text-base text-white/80">
            Creá tu web, centralizá tus fotos, ajustá precios y recibí consultas
            de huéspedes desde un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto bg-white px-6 py-4 max-lg:min-h-dvh lg:items-center lg:overflow-y-auto lg:py-6 max-[700px]:items-start">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <Link
              href="/"
              aria-label="Zentt"
              className="mb-3 inline-flex h-8 shrink-0 items-center justify-center leading-none"
            >
              <ZenttLogo className="aspect-[290/130] h-8 w-auto" />
            </Link>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Creá tu cuenta gratuita
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Completá tus datos para entrar al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className={labelClass}>
                  Nombre
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className={labelClass}>
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" className={labelClass}>
                Nombre de usuario
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ej: alojamientos-del-sol"
                autoComplete="username"
                required
                className={inputClass}
              />
              <p className="truncate text-xs text-slate-400">
                URL:{" "}
                <span className="font-medium text-slate-600">
                  zentt.app/{normalizeUsername(formData.username) || "tu-usuario"}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className={labelClass}>
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="password" className={labelClass}>
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] leading-tight text-slate-400">
                  8+ caracteres, 1 mayúscula y 1 número
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className={labelClass}>
                  Confirmar
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación"
                        : "Mostrar confirmación"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 py-1.5 text-center text-sm font-bold text-red-500">
                {error}
              </p>
            )}

            <label className="flex items-start gap-2.5 text-xs leading-snug text-slate-600">
              <input
                type="checkbox"
                checked={acceptLegal}
                onChange={(event) => setAcceptLegal(event.target.checked)}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>
                Acepto los{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-slate-900 underline"
                >
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-slate-900 underline"
                >
                  Política de Privacidad
                </Link>
                .
              </span>
            </label>

            <Button
              type="submit"
              className="h-10 w-full text-sm font-bold bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Crear cuenta"
              )}
            </Button>

            <p className="text-center text-sm font-medium text-slate-500">
              ¿Ya tenés una cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-slate-900 hover:underline"
              >
                Iniciá sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
