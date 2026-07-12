export const layout = {
  referenceWidth: 430,
  referenceHeight: 932,
  maxContentWidth: 430,
  maxHeaderWidth: 430,
} as const;

export type LayoutKey = keyof typeof layout;
