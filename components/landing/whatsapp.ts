/**
 * Contacto público de WhatsApp para la landing.
 *
 * Es el mismo número que usa el flujo de pagos internacionales
 * (`lib/internationalPayments.ts`), pero se declara aparte para que el
 * marketing no dependa de la configuración de cobros.
 */
export const WHATSAPP_NUMBER = "5493813380751";
export const WHATSAPP_DISPLAY = "+54 9 381 338-0751";

/** Link de WhatsApp con mensaje precargado opcional. */
export function waHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Mensajes de apertura por tipo de CTA. */
export const WA_MESSAGES = {
  demo: "Hola Leonardo, vi la web de Zentt y quiero ver la demo de la página de reservas para mi alojamiento.",
  cupo: "Hola Leonardo, quiero reservar mi cupo de la web de reservas directas (plan Temporada, pago único).",
  presupuesto:
    "Hola Leonardo, tengo un complejo / varias unidades y quiero pedir un presupuesto a medida.",
} as const;
