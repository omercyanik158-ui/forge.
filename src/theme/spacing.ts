export const spacing = {
  none: 0,
  unit: 4,
  xs: 8,
  sm: 12,
  smPlus: 14,
  md: 16,
  mdPlus: 18,
  lg: 20,
  xl: 24,
  section: 28,
  cardPadding: 18,
  containerMargin: 20,
  gutter: 20,
  sectionGap: 28,
  tabContentBottom: 24,
  screenHeaderOffset: 76,
} as const;

export type SpacingKey = keyof typeof spacing;
