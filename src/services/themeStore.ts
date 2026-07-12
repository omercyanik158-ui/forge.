import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@/theme/colors';

const STORAGE_KEY = '@forge/theme-mode';

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, mode);
}

export async function clearThemeMode(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
