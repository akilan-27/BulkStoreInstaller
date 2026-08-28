"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  prefersReducedMotion: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
  prefersReducedMotion: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Monotonically-increasing ID so older transition.finished handlers
  // cannot remove data-theme-changing while a newer transition is running.
  const transitionIdRef = useRef(0);

  // Hydrate from localStorage after mount to avoid SSR flash
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) setThemeState(stored);
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document synchronously before paint
  React.useLayoutEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let resolved: "dark" | "light";
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      const resolved = e.matches ? "dark" : "light";
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);

    const root = document.documentElement;

    // Fallback: no View Transitions API support — change theme immediately.
    if (!document.startViewTransition) {
      try {
        setThemeState(newTheme);
      } finally {
        root.removeAttribute("data-theme-changing");
      }
      return;
    }

    // Assign a new ID for this transition so that only the latest
    // transition.finished handler will remove the attribute.
    const currentId = ++transitionIdRef.current;
    root.setAttribute("data-theme-changing", "");

    const transition = document.startViewTransition(() => {
      // flushSync forces React to commit the state update synchronously
      // inside the View Transition callback, so the browser captures the
      // correct new-theme snapshot.
      flushSync(() => {
        setThemeState(newTheme);
      });
    });

    // Guaranteed cleanup: runs whether transition completes, is skipped,
    // or is interrupted by the browser.
    transition.finished.finally(() => {
      // Only remove if this is still the latest transition.
      if (transitionIdRef.current === currentId) {
        root.removeAttribute("data-theme-changing");
      }
    });
  };

  // Prevent flash: render nothing until mounted
  // The CSS handles the initial theme via :root
  return (
    <ThemeProviderContext.Provider
      value={{ theme, resolvedTheme, setTheme, prefersReducedMotion }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
