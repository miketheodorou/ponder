import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useColorScheme } from 'react-native';

import { ThemeDark, ThemeLight, type Theme } from './tokens';

/** User-chosen appearance preference. "system" follows the OS. */
export type Appearance = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'ponder.appearance';

interface AppearanceContextValue {
  appearance: Appearance;
  setAppearance: (next: Appearance) => void;
  /** False until the persisted value has been read from AsyncStorage. */
  ready: boolean;
}

const ThemeContext = createContext<Theme | null>(null);
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Owns the user's appearance preference and resolves it to the active Theme.
 *
 * The preference is loaded from AsyncStorage on mount; consumers can read
 * `useAppearance().ready` to gate boot rendering and avoid a flicker between
 * the default and the persisted value.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (cancelled) return;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setAppearanceState(stored);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    // Fire-and-forget: the in-memory value is the source of truth for the
    // session; persistence is for the next cold boot. A write failure
    // would just mean falling back to "system" next time the app starts.
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const theme = useMemo<Theme>(() => {
    const resolved = appearance === 'system' ? (systemScheme ?? 'dark') : appearance;
    return resolved === 'light' ? ThemeLight : ThemeDark;
  }, [appearance, systemScheme]);

  const appearanceValue = useMemo<AppearanceContextValue>(
    () => ({ appearance, setAppearance, ready }),
    [appearance, setAppearance, ready]
  );

  return (
    <AppearanceContext.Provider value={appearanceValue}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </AppearanceContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be called inside <ThemeProvider>');
  }
  return theme;
}

export function useAppearance(): AppearanceContextValue {
  const value = useContext(AppearanceContext);
  if (!value) {
    throw new Error('useAppearance must be called inside <ThemeProvider>');
  }
  return value;
}
