export const radius = {
  none: 0,
  sm: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
