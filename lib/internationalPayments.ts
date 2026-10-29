/**
 * International (non-ARS) plan payments.
 *
 * Temporary mode: instead of sending the customer to Polar, international
 * buyers are routed to Zentt's WhatsApp so the payment can be coordinated
 * manually. Flip INTERNATIONAL_PAYMENT_MODE back to "polar" (and set
 * NEXT_PUBLIC_POLAR_CHECKOUT_ENABLED=true) to restore the old flow.
 */
export type InternationalPaymentMode = "whatsapp" | "polar";

export const INTERNATIONAL_PAYMENT_MODE: InternationalPaymentMode = "whatsapp";

/** E.164 digits only, as required by wa.me links. */
export const INTERNATIONAL_WHATSAPP_PHONE = "5493813380751";
export const INTERNATIONAL_WHATSAPP_DISPLAY = "+54 9 381 338-0751";

const POLAR_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ENABLED === "true";

/** Whether the "Internacional" payment option should be offered at all. */
export function isInternationalPaymentsEnabled(): boolean {
  return INTERNATIONAL_PAYMENT_MODE === "whatsapp" || POLAR_CHECKOUT_ENABLED;
}

/** Whether international buyers are currently handled through WhatsApp. */
export function isWhatsAppInternationalMode(): boolean {
  return INTERNATIONAL_PAYMENT_MODE === "whatsapp";
}

type WhatsAppUrlOptions = {
  planName: string;
  priceUsd?: number;
};

/** wa.me deep link with a pre-filled plan/price message. */
export function buildInternationalWhatsAppUrl({
  planName,
  priceUsd,
}: WhatsAppUrlOptions): string {
  const price =
    typeof priceUsd === "number" && Number.isFinite(priceUsd)
      ? ` por USD ${priceUsd}`
      : "";
  const text = `Hola, quiero contratar el ${planName} de Zentt desde el exterior (pago internacional${price} cada 30 días). ¿Me pasás los datos para pagar?`;
  return `https://wa.me/${INTERNATIONAL_WHATSAPP_PHONE}?text=${encodeURIComponent(
    text
  )}`;
}
