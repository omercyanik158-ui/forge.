export type ThemeMode = "light" | "dark";

export type AppColors = {
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  surfaceBright: string;
  surfaceDim: string;
  surfaceContainerLowest: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  tertiary: string;
  tertiaryContainer: string;
  onTertiary: string;
  success: string;
  successContainer: string;
  onSuccess: string;
  error: string;
  onError: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inversePrimary: string;
  inverseSurface: string;
  inverseOnSurface: string;
  white: string;
  whiteAlpha5: string;
  whiteAlpha10: string;
  whiteAlpha20: string;
  whiteAlpha60: string;
  blackAlpha80: string;
  overlay: string;
  overlayBorder: string;
  shadow: string;
};

export const lightColors: AppColors = {
  background: "#F5F6F8",
  surface: "#FFFFFF",
  surfaceContainer: "#F1F3F6",
  surfaceContainerLow: "#F8F9FB",
  surfaceContainerHigh: "#ECEFF3",
  surfaceContainerHighest: "#E4E9F0",
  surfaceVariant: "#E8EDF3",
  surfaceBright: "#FFFFFF",
  surfaceDim: "#EEF2F6",
  surfaceContainerLowest: "#FFFFFF",
  primary: "#0F766E",
  primaryContainer: "#0A5B55",
  onPrimary: "#FFFFFF",
  secondary: "#4C6B88",
  secondaryContainer: "#E6EDF4",
  onSecondary: "#FFFFFF",
  tertiary: "#C46A4A",
  tertiaryContainer: "#F8E2D8",
  onTertiary: "#3F1608",
  success: "#1F8A5B",
  successContainer: "#DCF2E5",
  onSuccess: "#FFFFFF",
  error: "#C85C5C",
  onError: "#FFFFFF",
  onBackground: "#111827",
  onSurface: "#111827",
  onSurfaceVariant: "#667085",
  outline: "#98A2B3",
  outlineVariant: "#D8DFE7",
  inversePrimary: "#7DDED3",
  inverseSurface: "#121923",
  inverseOnSurface: "#F8FAFC",
  white: "#FFFFFF",
  whiteAlpha5: "rgba(255, 255, 255, 0.05)",
  whiteAlpha10: "rgba(255, 255, 255, 0.1)",
  whiteAlpha20: "rgba(255, 255, 255, 0.2)",
  whiteAlpha60: "rgba(255, 255, 255, 0.6)",
  blackAlpha80: "rgba(0, 0, 0, 0.8)",
  overlay: "rgba(250, 251, 252, 0.84)",
  overlayBorder: "rgba(216, 223, 231, 0.92)",
  shadow: "rgba(15, 23, 42, 0.12)",
};

export const darkColors: AppColors = {
  background: "#090B0F",
  surface: "#0F1217",
  surfaceContainer: "#131921",
  surfaceContainerLow: "#10161D",
  surfaceContainerHigh: "#1A212B",
  surfaceContainerHighest: "#212B37",
  surfaceVariant: "#293341",
  surfaceBright: "#242E3B",
  surfaceDim: "#080A0D",
  surfaceContainerLowest: "#05070A",
  primary: "#79D9CE",
  primaryContainer: "#0F5C55",
  onPrimary: "#05211D",
  secondary: "#9CB7D2",
  secondaryContainer: "#253444",
  onSecondary: "#091725",
  tertiary: "#F1A07F",
  tertiaryContainer: "#683B28",
  onTertiary: "#2B0D04",
  success: "#7BDCAB",
  successContainer: "#153F2C",
  onSuccess: "#061A12",
  error: "#FFB3B3",
  onError: "#5B1010",
  onBackground: "#F3F5F8",
  onSurface: "#F3F5F8",
  onSurfaceVariant: "#ABB4C3",
  outline: "#8B96A8",
  outlineVariant: "#2D3745",
  inversePrimary: "#0F766E",
  inverseSurface: "#E8EDF3",
  inverseOnSurface: "#0F172A",
  white: "#FFFFFF",
  whiteAlpha5: "rgba(255, 255, 255, 0.05)",
  whiteAlpha10: "rgba(255, 255, 255, 0.1)",
  whiteAlpha20: "rgba(255, 255, 255, 0.2)",
  whiteAlpha60: "rgba(255, 255, 255, 0.6)",
  blackAlpha80: "rgba(0, 0, 0, 0.8)",
  overlay: "rgba(9, 11, 15, 0.82)",
  overlayBorder: "rgba(45, 55, 69, 0.86)",
  shadow: "rgba(0, 0, 0, 0.42)",
};

let currentThemeMode: ThemeMode = "light";
let activeColors: AppColors = { ...lightColors };

export function setThemeMode(mode: ThemeMode) {
  currentThemeMode = mode;
  activeColors = { ...(mode === "dark" ? darkColors : lightColors) };
}

export function getThemeMode(): ThemeMode {
  return currentThemeMode;
}

export const colors = new Proxy({} as AppColors, {
  get(_target, key: keyof AppColors) {
    return activeColors[key];
  },
});
