"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Para Quién", href: "#funcionalidades" },
  { label: "Precios", href: "#precios" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link
          href="/"
          aria-label="Zentt"
          className="inline-flex h-10 shrink-0 items-center leading-none"
        >
          <ZenttLogo className="h-10 w-auto aspect-[290/130]" />
        </Link>

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
          <Button variant="nav-ghost" size="sm" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button variant="nav-solid" size="sm" asChild>
            <Link href="/register">Comenzar Gratis</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={`m-${link.label}`}
              href={link.href}
              className="block px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button variant="nav-solid" size="sm" asChild>
              <Link href="/register">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
