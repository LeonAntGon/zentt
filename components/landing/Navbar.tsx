"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WA_MESSAGES, waHref } from "@/components/landing/whatsapp";

const navLinks = [
  { label: "Clientes", href: "/#casos" },
  { label: "Funcionalidades", href: "/#funcionalidades" },
  { label: "Precios", href: "/#precios" },
  { label: "Blog", href: "/blog" },
];

const demoWhatsAppUrl = waHref(WA_MESSAGES.demo);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Zentt"
            className="inline-flex h-10 shrink-0 items-center leading-none"
          >
            <ZenttLogo className="h-10 w-auto aspect-[290/130]" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={demoWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pedí tu demo por WhatsApp"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-sm transition-colors hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-5 w-5" title="" />
          </a>
          <Button variant="nav-ghost" size="sm" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={demoWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pedí tu demo por WhatsApp"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-sm transition-colors hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-5 w-5" title="" />
          </a>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={`m-${link.label}`}
              href={link.href}
              className="flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-foreground/70 hover:bg-slate-50 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="whatsapp"
              className="h-11 font-heading font-semibold"
              asChild
            >
              <a
                href={demoWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                <WhatsAppIcon className="h-5 w-5" title="" />
                Pedí tu demo por WhatsApp
              </a>
            </Button>
            <Button variant="outline" className="h-11" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
