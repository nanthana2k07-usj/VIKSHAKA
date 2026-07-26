import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeName = "bureau" | "tactical" | "graphite" | "ivory";

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "bureau", setTheme: () => {} });

const STORAGE_KEY = "vikshaka-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("bureau");

  // Load persisted theme client-side to avoid SSR hydration mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (saved && ["bureau", "tactical", "graphite", "ivory"].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove(
      "theme-bureau",
      "theme-tactical",
      "theme-graphite",
      "theme-ivory",
    );
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
