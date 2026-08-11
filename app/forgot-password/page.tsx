"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Loader2 } from "lucide-react";

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seconds, setSeconds] = useState(900);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  const messageFrom = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as Record<string, string | string[]>;
      const value = data.detail || data.email || data.new_password;
      return Array.isArray(value) ? value[0] : value ? String(value) : "No pudimos procesar la solicitud.";
    }
    return "Error de conexión con el servidor. Intentá más tarde.";
  };

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/accounts/password-reset/", { email });
      setSeconds(900); setStep("code");
    } catch (err) { setError(messageFrom(err)); } finally { setLoading(false); }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await api.post("/accounts/password-reset/verify-code/", { email, codigo: code.join("") });
      setResetToken(data.reset_token); setStep("password");
    } catch (err) { setError(messageFrom(err)); } finally { setLoading(false); }
  };

  const setPassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      await api.post("/accounts/password-reset/set-password/", { reset_token: resetToken, new_password: newPassword, confirm_password: confirmPassword });
      setStep("done");
    } catch (err) { setError(messageFrom(err)); } finally { setLoading(false); }
  };

  const title = step === "email" ? "Recuperá tu contraseña" : step === "code" ? "Ingresá el código" : step === "password" ? "Nueva contraseña" : "Contraseña actualizada";
  return (
    <div className="auth-shell flex min-h-screen items-center justify-center bg-white p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center"><Link href="/" className="mb-6 inline-flex"><ZenttLogo className="h-10 w-auto" /></Link><h1 className="page-title text-2xl sm:text-3xl">{title}</h1><p className="page-subtitle mt-2">{step === "email" ? "Te enviaremos un código de 6 dígitos." : step === "code" ? "El código vence en 15 minutos." : step === "password" ? "Elegí una contraseña segura." : "Ya podés iniciar sesión."}</p></div>
        {step === "done" ? <Button asChild className="w-full h-12 bg-slate-900"><Link href="/login">Ir a iniciar sesión</Link></Button> : (
          <form onSubmit={step === "email" ? requestCode : step === "code" ? verifyCode : setPassword} className="space-y-6">
            {step === "email" && <div className="space-y-2"><Label htmlFor="email" className="ui-label">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-auth" /></div>}
            {step === "code" && <><div className="flex justify-center gap-2">{code.map((value, index) => <Input key={index} value={value} maxLength={1} inputMode="numeric" autoFocus={index === 0} className="h-12 w-11 text-center text-xl font-bold" onChange={(e) => { const next = [...code]; next[index] = e.target.value.replace(/\D/g, "").slice(-1); setCode(next); }} />)}</div><p className="text-center text-sm text-slate-500">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p></>}
            {step === "password" && <><div className="space-y-2"><Label htmlFor="new-password" className="ui-label">Nueva contraseña</Label><Input id="new-password" type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="field-auth" /></div><div className="space-y-2"><Label htmlFor="confirm-password" className="ui-label">Confirmar contraseña</Label><Input id="confirm-password" type="password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field-auth" /></div></>}
            {error && <p className="rounded-lg bg-red-50 py-2 text-center text-sm font-bold text-red-600">{error}</p>}
            <Button type="submit" disabled={loading || (step === "code" && seconds <= 0)} className="h-12 w-full bg-slate-900">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : step === "email" ? "Enviar código" : step === "code" ? "Validar código" : "Guardar contraseña"}</Button>
          </form>
        )}
        {step !== "done" && <p className="text-center text-sm text-slate-500"><Link href="/login" className="font-bold text-slate-900 hover:underline">Volver al inicio de sesión</Link></p>}
      </div>
    </div>
  );
}
