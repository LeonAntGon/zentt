"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Loader2 } from "lucide-react";

type Step = "email" | "code" | "password" | "done";

const CODE_LENGTH = 6;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seconds, setSeconds] = useState(900);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const timer = window.setInterval(
      () => setSeconds((value) => value - 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "code") {
      codeRefs.current[0]?.focus();
    }
  }, [step]);

  const messageFrom = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as Record<string, string | string[]>;
      const value = data.detail || data.email || data.new_password;
      return Array.isArray(value)
        ? value[0]
        : value
        ? String(value)
        : "No pudimos procesar la solicitud.";
    }
    return "Error de conexión con el servidor. Intentá más tarde.";
  };

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/accounts/password-reset/", { email });
      setSeconds(900);
      setCode(Array(CODE_LENGTH).fill(""));
      setStep("code");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post(
        "/accounts/password-reset/verify-code/",
        { email, codigo: code.join("") }
      );
      setResetToken(data.reset_token);
      setStep("password");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/accounts/password-reset/set-password/", {
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep("done");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      codeRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH - index);
    if (!pasted) return;
    e.preventDefault();
    setCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < pasted.length; i++) {
        next[index + i] = pasted[i];
      }
      return next;
    });
    const nextFocus = Math.min(index + pasted.length, CODE_LENGTH - 1);
    codeRefs.current[nextFocus]?.focus();
  };

  const title =
    step === "email"
      ? "Recuperá tu contraseña"
      : step === "code"
      ? "Ingresá el código"
      : step === "password"
      ? "Nueva contraseña"
      : "Contraseña actualizada";

  const subtitle =
    step === "email"
      ? "Te enviaremos un código de 6 dígitos."
      : step === "code"
      ? "El código vence en 15 minutos."
      : step === "password"
      ? "Elegí una contraseña segura."
      : "Ya podés iniciar sesión.";

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center bg-white p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="mb-6 inline-flex" aria-label="Zentt">
            <ZenttLogo className="h-10 w-auto" />
          </Link>
          <h1 className="page-title text-2xl sm:text-3xl">{title}</h1>
          <p className="page-subtitle mt-2">{subtitle}</p>
        </div>

        {step === "done" ? (
          <Button asChild className="h-12 w-full bg-slate-900">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        ) : (
          <form
            onSubmit={
              step === "email"
                ? requestCode
                : step === "code"
                ? verifyCode
                : setPassword
            }
            className="space-y-6"
          >
            {step === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email" className="ui-label">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field-auth"
                />
              </div>
            )}

            {step === "code" && (
              <>
                <fieldset>
                  <legend className="sr-only">
                    Código de verificación de 6 dígitos
                  </legend>
                  <div
                    className="flex justify-center gap-2"
                    role="group"
                    aria-label="Código de verificación"
                  >
                    {code.map((value, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          codeRefs.current[index] = el;
                        }}
                        value={value}
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
                        className="h-12 w-11 text-center text-xl font-bold focus-visible:ring-2 focus-visible:ring-primary/40"
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        onPaste={(e) => handleCodePaste(index, e)}
                      />
                    ))}
                  </div>
                </fieldset>
                <p
                  className="text-center text-sm text-slate-500"
                  aria-live="polite"
                >
                  {Math.floor(seconds / 60)}:
                  {String(seconds % 60).padStart(2, "0")}
                </p>
              </>
            )}

            {step === "password" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="ui-label">
                    Nueva contraseña
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="field-auth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="ui-label">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="field-auth"
                  />
                </div>
              </>
            )}

            {error && (
              <p
                className="rounded-lg bg-red-50 py-2 text-center text-sm font-bold text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={
                loading ||
                (step === "code" &&
                  (seconds <= 0 || code.some((digit) => digit === "")))
              }
              className="h-12 w-full bg-slate-900 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : step === "email" ? (
                "Enviar código"
              ) : step === "code" ? (
                "Validar código"
              ) : (
                "Guardar contraseña"
              )}
            </Button>
          </form>
        )}

        {step !== "done" && (
          <p className="text-center text-sm text-slate-500">
            <Link
              href="/login"
              className="font-bold text-slate-900 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
