"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { normalizeUsername } from "@/lib/username";

interface UserProfile {
  telefono: string;
  foto_perfil: string | null;
  nombre_negocio: string | null;
  slug: string | null;
  metodo_contacto?: "WA" | "MAIL";
  email_contacto?: string | null;
  airbnb_url?: string | null;
  redes_url?: string | null;
  instagram_user?: string | null;
  tiktok_user?: string | null;
  youtube_user?: string | null;
  facebook_user?: string | null;
  design?: "claro" | "oscuro" | "elegante" | "atardecer" | "lanorita";
  plan?: "gratis" | "pro" | "complejo";
  plan_expires_at?: string | null;
  hide_billing?: boolean;
  custom_domain?: {
    domain: string;
    display_domain: string;
    status: string;
  } | null;
  mp_subscription_id?: string | null;
  email_verified_at?: string | null;
  onboarding_required?: boolean;
  onboarding_password_changed_at?: string | null;
  onboarding_completed_at?: string | null;
}

type PaidPlan = "pro" | "complejo";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: UserProfile;
  email_verified?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  /**
   * Pide /accounts/me/. Sin opciones siempre trae datos frescos (se usa
   * después de cambios). `maxAgeMs` permite reusar la copia cacheada.
   */
  checkCurrentUser: (options?: { maxAgeMs?: number }) => Promise<User | null>;
  waitForPlan: (plan: PaidPlan, attempts?: number) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** /accounts/me/ se reusa hasta 30 s (recargas, montajes repetidos). */
export const ME_CACHE_TTL_MS = 30_000;
const ME_CACHE_KEY = "zentt_me_cache";

type MeCache = { token: string; at: number; user: User };

function readMeCache(token: string, maxAgeMs: number): User | null {
  if (maxAgeMs <= 0) return null;
  try {
    const raw = sessionStorage.getItem(ME_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as MeCache;
    if (cached.token !== token || Date.now() - cached.at > maxAgeMs) return null;
    return cached.user;
  } catch {
    return null;
  }
}

/** Guarda el usuario actual (p. ej. el que trae /dashboard/bootstrap/). */
export function writeMeCache(user: User | null) {
  try {
    const token = localStorage.getItem("access_token");
    if (!user || !token) {
      sessionStorage.removeItem(ME_CACHE_KEY);
      return;
    }
    const entry: MeCache = { token, at: Date.now(), user };
    sessionStorage.setItem(ME_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage bloqueado (modo privado, etc.): se sigue sin caché.
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isHarnessRoute = pathname?.startsWith("/dev/components") ?? false;
  const isHarnessRouteRef = useRef(isHarnessRoute);
  isHarnessRouteRef.current = isHarnessRoute;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Toda actualización del usuario (PATCH en configuración, diseño, etc.)
  // refresca también la caché de 30 s.
  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    writeMeCache(next);
  }, []);

  const checkCurrentUser = useCallback(async (
    { maxAgeMs = 0 }: { maxAgeMs?: number } = {}
  ): Promise<User | null> => {
    if (isHarnessRouteRef.current) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }

    const cached = readMeCache(token, maxAgeMs);
    if (cached) {
      setUserState(cached);
      setIsAuthenticated(true);
      setLoading(false);
      return cached;
    }

    try {
      const { data } = await api.get<User>("/accounts/me/");
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const waitForPlan = useCallback(
    async (plan: PaidPlan, attempts = 15): Promise<boolean> => {
      const totalAttempts = Math.max(1, attempts);

      for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2_000));
        }

        const latest = await checkCurrentUser();
        if (latest?.profile?.plan === plan) return true;
      }

      return false;
    },
    [checkCurrentUser]
  );

  useEffect(() => {
    if (isHarnessRoute) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    void checkCurrentUser({ maxAgeMs: ME_CACHE_TTL_MS });
  }, [checkCurrentUser, isHarnessRoute]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { data } = await api.post("/token/", {
        username: normalizeUsername(username) || username.trim(),
        password,
      });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      await checkCurrentUser();
    },
    [checkCurrentUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  }, [setUser]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkCurrentUser,
        waitForPlan,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
