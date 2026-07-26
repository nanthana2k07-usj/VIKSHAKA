import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./rbac";

export interface Session {
  name: string;
  rank: string;
  role: Role;
  district: string;
  serviceId: string;
  badge: string;
  phone: string;
  email: string;
  station: string;
  loginAt: string;
  avatar: string; // initials
}

interface AuthCtx {
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
  hydrated: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "vk.session.v1";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const signIn = (s: Session) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  };
  const signOut = () => {
    localStorage.removeItem(KEY);
    setSession(null);
  };

  return <Ctx.Provider value={{ session, signIn, signOut, hydrated }}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
