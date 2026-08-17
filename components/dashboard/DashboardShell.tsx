"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { BusinessAvatar } from "@/components/dashboard/BusinessAvatar";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { ZenttLogo } from "@/components/landing/ZenttLogo";
import {
  Home,
  Mail,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Globe,
  User,
  ExternalLink,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  prefix?: string;
};

const PRIMARY_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/calendario",
    label: "Agenda",
    icon: CalendarDays,
    exact: true,
  },
  {
    href: "__sitio__",
    label: "Sitio",
    icon: Globe,
  },
  {
    href: "/dashboard/buzon",
    label: "Buzón",
    icon: Mail,
    exact: true,
  },
  {
    href: "/dashboard/perfil",
    label: "Cuenta",
    icon: User,
    prefix: "/dashboard/perfil",
  },
];

const MORE_NAV: NavItem[] = [
  {
    href: "/dashboard/cabanas",
    label: "Alojamientos",
    icon: Home,
    prefix: "/dashboard/cabanas",
  },
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
];

function navItemActive(pathname: string, item: NavItem) {
  if (item.href === "__sitio__") return false;
  if (item.href === "/dashboard/perfil") {
    return (
      pathname.startsWith("/dashboard/perfil") ||
      pathname.startsWith("/dashboard/configuracion")
    );
  }
  if (item.exact) return pathname === item.href;
  if (item.prefix) return pathname.startsWith(item.prefix);
  return pathname === item.href;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const [mensajes, contacto] = await Promise.all([
          api.get<{ leido: boolean }[]>("/mensajes/"),
          api.get<{ leido: boolean }[]>("/contacto/"),
        ]);
        const count = [...(mensajes.data || []), ...(contacto.data || [])].filter(
          (m) => !m.leido
        ).length;
        setUnreadCount(count);
      } catch {
        // Keep last known count
      }
    };
    void loadUnread();
  }, [pathname]);

  const fotoPerfil = user?.profile?.foto_perfil;
  const nombreNegocio = user?.profile?.nombre_negocio;
  const slug = user?.profile?.slug || user?.username || "";
  const publicUrl = slug ? `/${slug}` : "";

  const brandBlock = (
    <div className="flex items-start gap-3">
      <BusinessAvatar
        fotoPerfil={fotoPerfil}
        nombreNegocio={nombreNegocio}
        size="sm"
        className="h-8 w-8 shrink-0 rounded-lg text-[10px]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2
          title={nombreNegocio || "Mi Complejo"}
          className="min-w-0 whitespace-normal break-words text-xs font-black uppercase leading-tight tracking-tight text-slate-900"
        >
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

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = navItemActive(pathname, item);
    const isSitio = item.href === "__sitio__";
    const showBuzonBadge = item.href === "/dashboard/buzon" && unreadCount > 0;
    const className = `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

    const inner = (
      <>
        <Icon size={18} />
        <span className="flex-1 truncate">{item.label}</span>
        {isSitio ? (
          <ExternalLink size={14} className="shrink-0 opacity-60" />
        ) : null}
        {showBuzonBadge ? (
          <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </>
    );

    if (isSitio) {
      if (publicUrl) {
        return (
          <a
            key={item.label}
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {inner}
          </a>
        );
      }
      return (
        <Link key={item.label} href="/dashboard/configuracion" className={className}>
          {inner}
        </Link>
      );
    }

    return (
      <Link key={item.href} href={item.href} className={className}>
        {inner}
      </Link>
    );
  };

  const renderTabItem = (item: NavItem, isCenter: boolean) => {
    const Icon = item.icon;
    const active = navItemActive(pathname, item);
    const isSitio = item.href === "__sitio__";
    const showBuzonBadge = item.href === "/dashboard/buzon" && unreadCount > 0;

    const label = (
      <span className="mt-0.5 text-[10px] font-bold leading-none">{item.label}</span>
    );

    if (isCenter) {
      const centerInner = (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
            <Icon size={22} />
          </span>
          <span className="mt-1 text-[10px] font-bold leading-none text-slate-700">
            {item.label}
          </span>
        </>
      );
      const centerClass =
        "relative -mt-5 flex flex-col items-center justify-end pb-1";
      if (publicUrl) {
        return (
          <a
            key={item.label}
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={centerClass}
            aria-label="Ver sitio público"
          >
            {centerInner}
          </a>
        );
      }
      return (
        <Link
          key={item.label}
          href="/dashboard/configuracion"
          className={centerClass}
          aria-label="Configurar sitio"
        >
          {centerInner}
        </Link>
      );
    }

    const tabClass = `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 ${
      active ? "text-primary" : "text-slate-500"
    }`;
    const tabInner = (
      <>
        <span className="relative">
          <Icon size={20} />
          {showBuzonBadge ? (
            <span className="absolute -right-2 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
        {label}
      </>
    );

    if (isSitio) {
      return null;
    }

    return (
      <Link key={item.href} href={item.href} className={tabClass}>
        {tabInner}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body text-foreground">
      <aside
        aria-label="Panel Zentt"
        className="hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-white md:flex"
      >
        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          {brandBlock}
        </div>
        <nav
          aria-label="Navegación del panel"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        >
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Principal
            </p>
            <div className="space-y-1">
              {PRIMARY_NAV.map((item) => renderNavLink(item))}
            </div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Más
            </p>
            <div className="space-y-1">
              {MORE_NAV.map((item) => renderNavLink(item))}
            </div>
          </div>
        </nav>
        <div className="space-y-3 border-t border-border px-4 py-3">
          <Link
            href="/dashboard/perfil"
            className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 ${
              pathname.startsWith("/dashboard/perfil") ||
              pathname.startsWith("/dashboard/configuracion")
                ? "text-primary"
                : ""
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
              <span className="truncate text-xs font-bold text-slate-900 group-hover:text-primary">
                {user?.username || user?.first_name}
              </span>
              <span className="truncate text-[10px] text-slate-500">
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <BusinessAvatar
            fotoPerfil={fotoPerfil}
            nombreNegocio={nombreNegocio}
            size="sm"
            className="h-8 w-8 shrink-0 rounded-lg text-[10px]"
          />
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-sm font-black uppercase tracking-tight text-slate-900">
              {nombreNegocio || "Mi Complejo"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Panel Zentt
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid h-16 grid-cols-5 px-1">
          {PRIMARY_NAV.map((item, index) => renderTabItem(item, index === 2))}
        </div>
      </nav>
    </div>
  );
}
