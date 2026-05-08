import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { ThemeDark, ThemeLight, type Theme } from "./tokens";

type SchemeOverride = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  /** Force a scheme regardless of the OS setting. Defaults to 'system'. */
  scheme?: SchemeOverride;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children, scheme = "system" }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const theme = useMemo<Theme>(() => {
    const resolved = scheme === "system" ? (systemScheme ?? "dark") : scheme;
    return resolved === "light" ? ThemeLight : ThemeDark;
  }, [scheme, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be called inside <ThemeProvider>");
  }
  return theme;
}
