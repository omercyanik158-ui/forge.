import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { saveThemeMode } from '@/services/themeStore';
import { darkColors, getThemeMode, lightColors, setThemeMode, type AppColors, type ThemeMode } from './colors';

type AppThemeContextValue = {
  mode: ThemeMode;
  colors: AppColors;
  setMode: (mode: ThemeMode) => Promise<void>;
};

export const AppThemeContext = createContext<AppThemeContextValue>({
  mode: getThemeMode(),
  colors: lightColors,
  setMode: async () => {},
});

export function AppThemeProvider({ initialMode, children }: { initialMode: ThemeMode; children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setThemeMode(nextMode);
    setModeState(nextMode);
    await saveThemeMode(nextMode);
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      setMode,
    }),
    [mode, setMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}
