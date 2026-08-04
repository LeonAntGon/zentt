"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessAvatar } from "@/components/dashboard/BusinessAvatar";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  Mail,
  LogOut,
  LayoutDashboard,
  Settings,
  CalendarDays,
  Menu,
  BarChart3,
  Globe,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  prefix?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Operación",
    items: [
      {
        href: "/dashboard",
        label: "Vista General",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/dashboard/cabanas",
        label: "Mis Alojamientos",
        icon: Home,
        prefix: "/dashboard/cabanas",
      },
      { href: "/dashboard/buzon", label: "Buzón", icon: Mail, exact: true },
      {
        href: "/dashboard/calendario",
        label: "Calendario",
        icon: CalendarDays,
        exact: true,
      },
    ],
  },
  {
    title: "Análisis",
    items: [
      {
        href: "/dashboard/reportes",
        label: "Reportes",
        icon: BarChart3,
        exact: true,
      },
      {
        href: "/dashboard/rendimiento-web",
        label: "Rendimiento web",
        icon: Globe,
        exact: true,
      },
    ],
  },
  {
    title: "Cuenta",
    items: [
      {
        href: "/dashboard/configuracion",
        label: "Configuración",
        icon: Settings,
        exact: true,
      },
    ],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (path: string) => pathname.startsWith(path);

  const navItemActive = (item: NavItem) => {
    if (item.exact) return isActive(item.href);
    if (item.prefix) return pathname.includes(item.prefix);
    return isActive(item.href);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const fotoPerfil = user?.profile?.foto_perfil;
  const nombreNegocio = user?.profile?.nombre_negocio;

  const brandBlock = (
    <div className="flex items-start gap-3">
      <BusinessAvatar
        fotoPerfil={fotoPerfil}
        nombreNegocio={nombreNegocio}
        size="sm"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="break-words text-sm font-black uppercase leading-snug tracking-tight text-foreground">
          {nombreNegocio || "Mi Complejo"}
        </h2>
        <div className="mt-1 flex items-center gap-1.5" aria-label="Panel Zentt">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Panel
          </span>
          <ZenttLogo className="aspect-[290/130] h-3.5 w-auto" />
        </div>
      </div>
    </div>
  );

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-5 overflow-y-auto p-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = navItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-primary/80 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footerBlock = (onNavigate?: () => void) => (
    <div className="space-y-3 border-t border-border p-4">
      <Link
        href="/dashboard/perfil"
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60 ${
          isActivePrefix("/dashboard/perfil") ? "bg-muted/60" : ""
        }`}
      >
        <UserAvatar
          firstName={user?.first_name}
          lastName={user?.last_name}
          email={user?.email}
          alt={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
          size="sm"
          brandTone
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <span className="truncate text-xs font-bold text-foreground">
            {user?.username || user?.first_name}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {user?.email}
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
      >
        <LogOut size={18} /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border bg-muted/40 p-5">{brandBlock}</div>
        {navLinks()}
        {footerBlock()}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(100%,20rem)] flex-col bg-card p-0"
        >
          <SheetHeader className="space-y-0 border-b border-border bg-muted/40 p-5 pr-14 text-left">
            <SheetTitle className="sr-only">Menú del panel</SheetTitle>
            {brandBlock}
          </SheetHeader>
          {navLinks(() => setMobileOpen(false))}
          {footerBlock(() => setMobileOpen(false))}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-sm font-black uppercase tracking-tight">
              {nombreNegocio || "Mi Complejo"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Panel Zentt
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
