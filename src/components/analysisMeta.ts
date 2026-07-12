import { colors } from '@/theme';
import type { RegionStatus } from '@/services/trainingAnalysis';

type StatusMeta = {
  label: string;
  color: string;
};

export const REGION_STATUS_META: Record<RegionStatus, StatusMeta> = {
  eksik: { label: 'Eksik', color: colors.error },
  dusuk: { label: 'D\u00fc\u015f\u00fck', color: colors.tertiary },
  dengeli: { label: 'Dengeli', color: colors.success },
  yeterli: { label: 'Yeterli', color: colors.success },
  yogun: { label: 'Yo\u011fun', color: colors.primary },
};

export const REGION_FULL_VOLUME = 18;

export function regionStatusColor(status: RegionStatus): string {
  return REGION_STATUS_META[status].color;
}

export function regionStatusLabel(status: RegionStatus): string {
  return REGION_STATUS_META[status].label;
}
