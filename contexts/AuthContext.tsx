"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
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
  plan?: "gratis" | "pro" | "complejo";
  plan_expires_at?: string | null;
  mp_subscription_id?: string | null;
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
  checkCurrentUser: () => Promise<User | null>;
  waitForPlan: (plan: PaidPlan, attempts?: number) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return null;
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
  }, []);

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
    checkCurrentUser();
  }, [checkCurrentUser]);

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
  }, []);

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
