"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function AcmeHero() {
  return (
    <div className="bg-background pt-16">
      <main className="relative container max-w-5xl mx-auto px-4">
        <section className="w-full py-12 md:py-20 lg:py-28">
          <motion.div
            className="flex flex-col items-center space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-4xl font-heading font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Tu negocio, gestionado de{" "}
              <span className="text-primary">forma inteligente</span>.
            </motion.h1>
            <motion.p
              className="mx-auto max-w-2xl text-md sm:text-2xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              La plataforma todo-en-uno para recibir reservas 24/7, organizar tus
              servicios y automatizar la comunicación con tus clientes.
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
                <Link href="/register">Comienza gratis</Link>
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
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                <span className="text-primary">Pagina web incluida</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground/60">
                  Panel de gestión
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-primary">Sin comisiones</span>
              </div>
              <p className="text-sm text-muted-foreground/60">
                Configuración en minutos. Empieza gratis.
              </p>
            </motion.div>
            <motion.div
              className="w-full border p-2 rounded-3xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="relative w-full">
                <div className="relative w-full rounded-3xl overflow-hidden border shadow-2xl">
                  <img
                    src="https://ui.shadcn.com/examples/dashboard-dark.png"
                    alt="Vista previa del panel Zentt"
                    className="w-full h-full object-center hidden dark:block rounded-3xl"
                  />
                  <img
                    src="https://ui.shadcn.com/examples/dashboard-light.png"
                    alt="Vista previa del panel Zentt"
                    className="w-full h-full object-center dark:hidden block rounded-3xl"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-background to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
