"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { SaasVideoShowcase } from "@/components/landing/SaasVideoShowcase";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WA_MESSAGES, waHref } from "@/components/landing/whatsapp";

export function AcmeHero() {
  return (
    <div className="bg-white pt-16">
      <main className="relative container max-w-5xl mx-auto px-4">
        <section className="w-full py-12 md:py-20 lg:py-28">
          <motion.div
            className="flex flex-col items-center space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-sm sm:text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Por Leonardo González
            </motion.div>
            <motion.h1
              className="max-w-4xl text-3xl font-heading font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Dejá de regalarle comisiones{" "}
              <span className="text-primary">a Booking y Airbnb.</span>
            </motion.h1>
            <motion.p
              className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Te armo la página de reservas directas de tu alojamiento,
              conectada a WhatsApp y lista para la temporada. Pago único. Vos no
              tocás nada.
            </motion.p>
            <motion.div
              className="flex flex-col items-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                variant="whatsapp"
                className="h-12 rounded-xl px-6 font-heading text-base font-semibold shadow-lg"
                size="lg"
                asChild
              >
                <a
                  href={waHref(WA_MESSAGES.demo)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="h-5 w-5" title="" />
                  Pedí tu demo por WhatsApp
                </a>
              </Button>
            </motion.div>

            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Llave en mano
              <span className="text-muted-foreground/60"> · </span>
              Pago único
              <span className="text-muted-foreground/60"> · </span>
              Sin comisión por reserva
            </motion.p>

            <motion.div
              className="w-full pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <SaasVideoShowcase />
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
