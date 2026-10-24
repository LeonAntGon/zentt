"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { useEmailVerify } from "@/components/dashboard/EmailVerify";
import type { PaymentProvider } from "@/components/billing/PaymentProviderSelector";

export type PaidPlan = "pro" | "complejo";

type UsePlanCheckoutOptions = {
  onBeforeCheckout?: (continueCheckout: () => void) => void;
};

type MercadoPagoCheckoutResponse = {
  checkout_url?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type PolarCheckoutResponse = {
  checkout_url?: string;
};

export function usePlanCheckout({
  onBeforeCheckout,
}: UsePlanCheckoutOptions = {}) {
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const { requireEmailVerified } = useEmailVerify();

  const startCheckout = useCallback(
    (plan: PaidPlan, provider: PaymentProvider) => {
      const run = async () => {
        if (!requireEmailVerified()) return;

        setLoadingPlan(plan);
        try {
          if (provider === "polar") {
            const { data } = await api.post<PolarCheckoutResponse>(
              "/payments/create-polar-checkout/",
              { plan }
            );
            if (!data.checkout_url) {
              toast.error("Polar no devolvió una URL de pago.");
              return;
            }
            window.location.assign(data.checkout_url);
            return;
          }

          const { data } = await api.post<MercadoPagoCheckoutResponse>(
            "/payments/create-preference/",
            { plan }
          );
          const url =
            data.checkout_url || data.init_point || data.sandbox_init_point;
          if (!url) {
            toast.error("No pudimos iniciar el pago.");
            return;
          }
          window.location.href = url;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            toast.error(
              String(
                error.response.data?.detail ||
                  "Verificá tu email antes de pagar."
              )
            );
            requireEmailVerified();
          } else if (
            axios.isAxiosError(error) &&
            error.response?.status === 503
          ) {
            toast.error(
              provider === "polar"
                ? "Polar todavía no está configurado para este plan."
                : "MercadoPago todavía no está configurado."
            );
          } else {
            toast.error(
              provider === "polar"
                ? "No pudimos iniciar el checkout internacional. Probá de nuevo."
                : "No pudimos iniciar el pago. Probá de nuevo."
            );
          }
        } finally {
          setLoadingPlan(null);
        }
      };

      if (onBeforeCheckout) {
        onBeforeCheckout(() => void run());
      } else {
        void run();
      }
    },
    [onBeforeCheckout, requireEmailVerified]
  );

  return { loadingPlan, startCheckout };
}
