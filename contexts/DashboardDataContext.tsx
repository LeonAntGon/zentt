"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "@/lib/api";
import { useAuth, type User } from "@/contexts/AuthContext";
import type { MessageOrigen } from "@/types/cabin";

/** Respuesta de GET /api/dashboard/bootstrap/. */
export interface DashboardUnread {
  mensajes: number;
  contactos: number;
  total: number;
}

export interface DashboardMensaje {
  id: number;
  _tipo: "cabanas" | "general";
  nombre_turista?: string;
  nombre?: string;
  cabana_nombre?: string;
  contenido?: string;
  mensaje?: string;
  telefono_turista?: string | null;
  telefono?: string | null;
  origen?: MessageOrigen;
  fecha_envio: string;
  leido: boolean;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
  total_estimado?: string | number | null;
  adultos?: number | null;
  ninos?: number | null;
  mascotas?: boolean | null;
  mascotas_detalle?: string | null;
  motivo_viaje?: string | null;
}

export interface DashboardReserva {
  id: number;
  estado: string;
  total_reserva: string | number;
  check_in: string;
  check_out: string;
  cabana?: number;
  cabana_nombre?: string;
  nombre_turista?: string;
  email_turista?: string | null;
  telefono_turista?: string | null;
  adultos?: number | null;
  ninos?: number | null;
  mascotas?: boolean | null;
  mascotas_detalle?: string | null;
  motivo_viaje?: string | null;
  notas?: string | null;
  created_at: string;
}

export interface DashboardBootstrap {
  user: User;
  unread: DashboardUnread;
  ultimos_mensajes: DashboardMensaje[];
  proximas_reservas: DashboardReserva[];
  reservas_pendientes: DashboardReserva[];
  stats: {
    total_cabanas: number;
    ingresos_del_mes: string;
    ingresos_pendientes: string;
    proximos_check_ins: number;
    ocupacion_pct: number;
  };
}

interface DashboardDataContextValue {
  data: DashboardBootstrap | null;
  loading: boolean;
  error: boolean;
  unread: DashboardUnread;
  /** Vuelve a pedir el bootstrap completo. */
  refresh: () => Promise<void>;
  /** Refresca solo los contadores de no leídos (liviano). */
  refreshCounts: () => Promise<void>;
}

const EMPTY_UNREAD: DashboardUnread = { mensajes: 0, contactos: 0, total: 0 };
const COUNTS_INTERVAL_MS = 60_000;

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}

/**
 * Datos compartidos del panel. Se piden UNA vez al entrar al dashboard (no en
 * cada cambio de ruta). Los contadores de no leídos se refrescan cada 60 s y
 * al volver el foco a la pestaña.
 */
export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { setUser } = useAuth();
  const [data, setData] = useState<DashboardBootstrap | null>(null);
  const [unread, setUnread] = useState<DashboardUnread>(EMPTY_UNREAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastCountsAt = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const { data: next } = await api.get<DashboardBootstrap>("/dashboard/bootstrap/");
      setData(next);
      setUnread(next.unread);
      setUser(next.user); // también renueva la caché de /accounts/me/
      lastCountsAt.current = Date.now();
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const refreshCounts = useCallback(async () => {
    try {
      const { data: next } = await api.get<{ unread: DashboardUnread }>(
        "/dashboard/bootstrap/",
        { params: { only: "counts" } }
      );
      setUnread(next.unread);
      lastCountsAt.current = Date.now();
    } catch {
      // Se mantiene el último valor conocido.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshCounts();
    }, COUNTS_INTERVAL_MS);

    // Al volver a la pestaña: refresca si pasaron más de 10 s.
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCountsAt.current > 10_000) void refreshCounts();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCounts]);

  return (
    <DashboardDataContext.Provider
      value={{ data, loading, error, unread, refresh, refreshCounts }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}
