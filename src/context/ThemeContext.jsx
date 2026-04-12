// src/context/ThemeContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const COLOR_MODE_KEY = "colorMode";
const LEGACY_THEME_KEY = "theme";

/** @typedef {'system' | 'light' | 'dark'} ColorMode */

function readStoredColorMode() {
  try {
    const cm = localStorage.getItem(COLOR_MODE_KEY);
    if (cm === "system" || cm === "light" || cm === "dark") return cm;
    const legacy = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy === "light" || legacy === "dark") return legacy;
    return "system";
  } catch {
    return "system";
  }
}

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [colorMode, setColorModeState] = useState(readStoredColorMode);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  const resolvedTheme = useMemo(() => {
    if (colorMode === "dark") return "dark";
    if (colorMode === "light") return "light";
    return systemDark ? "dark" : "light";
  }, [colorMode, systemDark]);

  useEffect(() => {
    if (colorMode !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [colorMode]);

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    }
    try {
      localStorage.setItem(COLOR_MODE_KEY, colorMode);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      /* private mode */
    }
  }, [colorMode, resolvedTheme]);

  const setColorMode = useCallback((mode) => {
    if (mode === "system" || mode === "light" || mode === "dark") {
      setColorModeState(mode);
    }
  }, []);

  /** Compact controls: cycle system → light → dark → system */
  const toggleTheme = useCallback(() => {
    setColorModeState((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  }, []);

  const value = useMemo(
    () => ({
      colorMode,
      setColorMode,
      resolvedTheme,
      /** @deprecated Prefer `resolvedTheme`; kept for existing `theme === 'dark'` checks */
      theme: resolvedTheme,
      toggleTheme,
    }),
    [colorMode, setColorMode, resolvedTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
