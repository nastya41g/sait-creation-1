import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "bestgames-theme";

const read = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(KEY) === "light" ? "light" : "dark";
};

const apply = (t: Theme) => {
  document.documentElement.classList.toggle("dark", t === "dark");
};

if (typeof window !== "undefined") apply(read());

/** Forces a theme while the calling page is mounted (used for the light version of the home page). */
export function useForcedTheme(forced?: Theme) {
  useLayoutEffect(() => {
    if (!forced) return;
    apply(forced);
    return () => apply(read());
  }, [forced]);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read());

  useEffect(() => {
    const onChange = () => setThemeState(read());
    window.addEventListener("bg-theme", onChange);
    return () => window.removeEventListener("bg-theme", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(KEY, t);
    apply(t);
    window.dispatchEvent(new Event("bg-theme"));
  }, []);

  const toggle = useCallback(() => setTheme(read() === "dark" ? "light" : "dark"), [setTheme]);

  return { theme, setTheme, toggle };
}
