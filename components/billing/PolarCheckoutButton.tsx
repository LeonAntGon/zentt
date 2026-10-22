"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { useEmailVerify } from "@/components/dashboard/EmailVerify";
import { UpgradeProButton } from "@/components/billing/PlanConversionUi";

type PaidPlan = "pro" | "complejo";

type PolarCheckoutButtonProps = {
  plan: PaidPlan;
  disabled?: boolean;
  className?: string;
  label?: string;
  onLoadingChange?: (loading: boolean) => void;
  onRequestCheckout?: (continueCheckout: () => void) => void;
};

export const isPolarCheckoutEnabled =
  process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ENABLED === "true";

export function PolarCheckoutButton({
  plan,
  disabled = false,
  className,
  label = "Pagar en USD con Polar",
  onLoadingChange,
  onRequestCheckout,
}: PolarCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { requireEmailVerified } = useEmailVerify();

  if (!isPolarCheckoutEnabled) return null;

  const startCheckout = async () => {
    if (disabled || loading || !requireEmailVerified()) return;
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const { data } = await api.post<{ checkout_url?: string }>(
        "/payments/create-polar-checkout/",
        { plan },
      );
      if (!data.checkout_url) {
        toast.error("Polar no devolvió una URL de pago.");
        return;
      }
      window.location.assign(data.checkout_url);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error(String(error.response.data?.detail || "Verificá tu email para pagar."));
        requireEmailVerified();
      } else if (axios.isAxiosError(error) && error.response?.status === 503) {
        toast.error("Polar todavía no está configurado para este plan.");
      } else {
        toast.error("No pudimos iniciar el checkout internacional. Probá de nuevo.");
      }
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <UpgradeProButton
      className={className}
      loading={loading}
      disabled={disabled || loading}
      showPulse={false}
      onClick={() => {
        const continueCheckout = () => void startCheckout();
        if (onRequestCheckout) onRequestCheckout(continueCheckout);
        else continueCheckout();
      }}
    >
      {loading ? "Conectando con Polar…" : label}
    </UpgradeProButton>
  );
}
