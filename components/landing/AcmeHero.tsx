"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { DashboardHeroMockup } from "@/components/landing/DashboardHeroMockup";
import { PublicSitePhoneMockup } from "@/components/landing/PublicSitePhoneMockup";

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
            <motion.h1
              className="max-w-4xl text-3xl font-heading font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Más reservas directas.{" "}
              <span className="text-primary">Cero comisiones.</span>
            </motion.h1>
            <motion.p
              className="mx-auto max-w-2xl text-md text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Convertí el link de Instagram de tu alojamiento en una página
              donde tus huéspedes ven disponibilidad y tarifas, y te escriben
              por WhatsApp listos para cerrar.
            </motion.p>
            <motion.p
              className="text-sm font-heading font-semibold tracking-wide text-foreground/70 sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              Airbnb + Booking + WhatsApp
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                variant="hero"
                className="rounded-xl"
                size="lg"
                asChild
              >
                <Link href="/register">Empezá gratis</Link>
              </Button>
              <Button variant="hero-outline" className="rounded-xl" size="lg" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-col items-center space-y-3 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-sm text-muted-foreground">
                1 alojamiento
                <span className="text-muted-foreground/60"> · </span>
                Sin tarjeta
                <span className="text-muted-foreground/60"> · </span>
                Sin comisión por reserva
              </p>
            </motion.div>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="relative w-full">
                <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
                  <DashboardHeroMockup />
                  <div className="mx-auto max-w-[220px] lg:-ml-16 lg:z-10">
                    <PublicSitePhoneMockup />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-white to-transparent" />
              </div>
              <p className="relative z-10 mt-4 text-center text-xs text-muted-foreground">
                Así se ve tu panel
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
