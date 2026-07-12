import type { LocalizedMessage } from '@/services/messages';
import { PREMIUM_FEATURE_KEYS, type PremiumFeatureKey } from '@/config/premium';

export type PremiumFeatureDefinition = {
  key: PremiumFeatureKey;
  title: LocalizedMessage;
  summary: LocalizedMessage;
};

export const PREMIUM_FEATURES: PremiumFeatureDefinition[] = [
  {
    key: PREMIUM_FEATURE_KEYS.premiumPrograms,
    title: { tr: 'Premium programlar', en: 'Premium programs' },
    summary: {
      tr: 'Daha uzun planlar, daha net haftalık akış ve ileri seviye program kütüphanesi.',
      en: 'Longer plans, clearer weekly structure, and a deeper advanced training library.',
    },
  },
  {
    key: PREMIUM_FEATURE_KEYS.foodAi,
    title: { tr: 'Yemek fotoğrafı analizi', en: 'Food photo analysis' },
    summary: {
      tr: 'Fotoğraftan kalori ve makro tahmini al, sonucu düzenle ve günlüğe hızlı kaydet.',
      en: 'Get calorie and macro estimates from a photo, refine the result, and save it fast.',
    },
  },
  {
    key: PREMIUM_FEATURE_KEYS.physiqueAi,
    title: { tr: 'Sınırsız fizik analizi', en: 'Unlimited physique analysis' },
    summary: {
      tr: 'Yeni koç raporları, metinsel değişim özeti ve daha güçlü gelişim takibi açılır.',
      en: 'Unlock new coach reports, text-based change summaries, and stronger progress tracking.',
    },
  },
  {
    key: PREMIUM_FEATURE_KEYS.trainingInsights,
    title: { tr: 'Antrenman değerlendirmesi', en: 'Training analysis' },
    summary: {
      tr: 'Haftalık kas dağılımı, eksik kalan bölgeler ve itiş/çekiş dengesi daha net görünür.',
      en: 'Weekly muscle balance, lagging areas, and push/pull balance become much clearer.',
    },
  },
];

export function getPremiumFeatureDefinition(key: PremiumFeatureKey): PremiumFeatureDefinition {
  return PREMIUM_FEATURES.find((item) => item.key === key) ?? PREMIUM_FEATURES[0];
}
