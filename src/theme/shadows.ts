import type { ViewStyle } from 'react-native';
import { colors } from './colors';

export type ShadowLevel = 'sm' | 'md' | 'lg' | 'floating';

export function shadowStyle(level: ShadowLevel = 'md'): ViewStyle {
  const shadowColor = colors.shadow;

  if (level === 'sm') {
    return {
      shadowColor,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    };
  }

  if (level === 'lg') {
    return {
      shadowColor,
      shadowOpacity: 0.16,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 14 },
      elevation: 8,
    };
  }

  if (level === 'floating') {
    return {
      shadowColor,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    };
  }

  return {
    shadowColor,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  };
}
