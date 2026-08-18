"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  emptyOtp,
  OtpInput,
  otpToString,
  OTP_LENGTH,
} from "@/components/auth/OtpInput";

type EmailVerifyContextValue = {
  openVerify: (opts?: { reason?: string }) => void;
  requireEmailVerified: () => boolean;
};

const EmailVerifyContext = createContext<EmailVerifyContextValue | null>(null);

export function useEmailVerify() {
  const ctx = useContext(EmailVerifyContext);
  if (!ctx) {
    return {
      openVerify: () => {
        toast.message("Verificá tu email desde el panel.");
      },
      requireEmailVerified: () => true,
    };
  }
  return ctx;
}

export function EmailVerifyProvider({ children }: { children: ReactNode }) {
  const { user, checkCurrentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [code, setCode] = useState(emptyOtp());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  const isVerified = Boolean(user?.email_verified);

  const startCooldown = useCallback((seconds = 60) => {
    setCooldown(seconds);
    const id = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendCode = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/accounts/email-verify/send/");
      toast.success("Te enviamos un código a tu email.");
      setCode(emptyOtp());
      startCooldown(60);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError("No pudimos enviar el código. Probá de nuevo.");
      }
    } finally {
      setSending(false);
    }
  }, [startCooldown]);

  const openVerify = useCallback(
    (opts?: { reason?: string }) => {
      setReason(opts?.reason || null);
      setOpen(true);
      setError("");
      setCode(emptyOtp());
      void sendCode();
    },
    [sendCode]
  );

  const requireEmailVerified = useCallback(() => {
    if (isVerified) return true;
    openVerify({
      reason: "Verificá tu email para continuar con el pago.",
    });
    return false;
  }, [isVerified, openVerify]);

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/accounts/email-verify/confirm/", {
        codigo: otpToString(code),
      });
      await checkCurrentUser();
      toast.success("Email verificado.");
      setOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError("No pudimos verificar el código.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmailVerifyContext.Provider value={{ openVerify, requireEmailVerified }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-verify-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <h2
              id="email-verify-title"
              className="pr-8 text-lg font-bold text-slate-900"
            >
              Verificá tu email
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {reason ||
                `Te enviamos un código de ${OTP_LENGTH} dígitos a ${user?.email || "tu correo"}.`}
            </p>
            <form onSubmit={confirm} className="mt-5 space-y-4">
              <OtpInput value={code} onChange={setCode} disabled={loading} />
              {error && (
                <p className="text-center text-sm font-semibold text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading || code.some((d) => !d)}
                className="h-11 w-full bg-slate-900"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Confirmar código"
                )}
              </Button>
              <button
                type="button"
                disabled={sending || cooldown > 0}
                onClick={() => void sendCode()}
                className="w-full text-center text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline disabled:opacity-50"
              >
                {cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : sending
                    ? "Enviando…"
                    : "Reenviar código"}
              </button>
            </form>
          </div>
        </div>
      )}
    </EmailVerifyContext.Provider>
  );
}

export function EmailVerifyBanner() {
  const { user } = useAuth();
  const { openVerify } = useEmailVerify();

  if (!user || user.email_verified) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          Confirmá tu email para suscribirte a un plan pago.
        </p>
        <button
          type="button"
          onClick={() => openVerify()}
          className="text-sm font-bold text-amber-900 underline underline-offset-2 hover:no-underline"
        >
          Verificar ahora
        </button>
      </div>
    </div>
  );
}
