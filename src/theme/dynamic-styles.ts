import { StyleSheet } from 'react-native';
import { getThemeMode, type ThemeMode } from './colors';

export function createDynamicStyles<T extends StyleSheet.NamedStyles<T>>(factory: () => T): T {
  let cachedMode: ThemeMode | null = null;
  let cachedStyles: T | null = null;

  return new Proxy({} as T, {
    get(_target, property: string | symbol) {
      const mode = getThemeMode();
      if (!cachedStyles || cachedMode !== mode) {
        cachedMode = mode;
        cachedStyles = StyleSheet.create(factory());
      }
      return cachedStyles[property as keyof T];
    },
  });
}
