import { use } from 'react';
import { AppThemeContext } from './theme-context';

export function useAppTheme() {
  return use(AppThemeContext);
}
