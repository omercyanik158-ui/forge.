import { formatCurrency, formatMessage, getRuntimeLocalization, type PremiumMarketCode, type ResolvedLocalization } from './localization';

export type PremiumPlanId = 'monthly' | 'annual';

export type PremiumPlanView = {
  id: PremiumPlanId;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  title: string;
  priceLabel: string;
  sublabel: string;
  badge?: string;
  accent?: string;
};

export type PremiumMarketSnapshot = {
  market: PremiumMarketCode;
  locale: string;
  regionCode?: string | null;
  languageCode?: string | null;
  currencyCode: 'TRY' | 'USD' | 'EUR' | 'GBP';
  monthly: PremiumPlanView;
  annual: PremiumPlanView;
  annualMonthlyEquivalentLabel: string;
  heroTitle: string;
  heroBody: string;
  reassurance: string;
  valueComparison: string;
  footnote: string;
};

type PremiumPlanSeed = {
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
};

const PLAN_SEEDS: Record<PremiumMarketCode, Record<PremiumPlanId, PremiumPlanSeed>> = {
  tr: {
    monthly: { amount: 149.99, currency: 'TRY' },
    annual: { amount: 899.99, currency: 'TRY' },
  },
  eu: {
    monthly: { amount: 6.99, currency: 'EUR' },
    annual: { amount: 39.99, currency: 'EUR' },
  },
  uk: {
    monthly: { amount: 5.99, currency: 'GBP' },
    annual: { amount: 34.99, currency: 'GBP' },
  },
  us: {
    monthly: { amount: 7.99, currency: 'USD' },
    annual: { amount: 44.99, currency: 'USD' },
  },
  global: {
    monthly: { amount: 7.99, currency: 'USD' },
    annual: { amount: 44.99, currency: 'USD' },
  },
};

export function getPremiumMarketSnapshot(localization: ResolvedLocalization = getRuntimeLocalization()): PremiumMarketSnapshot {
  const pricing = PLAN_SEEDS[localization.market];
  const annualMonthlyEquivalent = pricing.annual.amount / 12;
  const annualEquivalentLabel = formatCurrency(annualMonthlyEquivalent, pricing.annual.currency, localization);

  return {
    market: localization.market,
    locale: localization.localeTag,
    regionCode: localization.regionCode,
    languageCode: localization.language,
    currencyCode: pricing.monthly.currency,
    monthly: {
      id: 'monthly',
      amount: pricing.monthly.amount,
      currency: pricing.monthly.currency,
      title: formatMessage({ tr: 'Aylık Premium', en: 'Monthly Premium' }, localization),
      priceLabel: formatCurrency(pricing.monthly.amount, pricing.monthly.currency, localization),
      sublabel: formatMessage({ tr: 'Esnek başlangıç planı', en: 'Flexible starter plan' }, localization),
    },
    annual: {
      id: 'annual',
      amount: pricing.annual.amount,
      currency: pricing.annual.currency,
      title: formatMessage({ tr: 'Yıllık Premium', en: 'Annual Premium' }, localization),
      priceLabel: formatCurrency(pricing.annual.amount, pricing.annual.currency, localization),
      sublabel: formatMessage(
        { tr: `Ay başına yaklaşık ${annualEquivalentLabel}`, en: `About ${annualEquivalentLabel} per month` },
        localization,
      ),
      badge: formatMessage({ tr: 'En avantajlı plan', en: 'Best value' }, localization),
      accent: 'highlight',
    },
    annualMonthlyEquivalentLabel: annualEquivalentLabel,
    heroTitle: formatMessage(
      { tr: 'Daha güçlü antrenman akışını aç', en: 'Unlock a stronger training flow' },
      localization,
    ),
    heroBody: formatMessage(
      {
        tr: 'Premium programlar, gelişmiş besin arama ve daha akıcı takip deneyimi tek üyelikte birleşir.',
        en: 'Premium programs, advanced food search, and a smoother tracking experience come together in one membership.',
      },
      localization,
    ),
    reassurance: formatMessage(
      {
        tr: 'Küçük bir aylık harcamayla tüm premium akış açılır.',
        en: 'A small monthly spend unlocks the full premium experience.',
      },
      localization,
    ),
    valueComparison: formatMessage(
      {
        tr: `Yıllık plan ile ay başına yaklaşık ${annualEquivalentLabel} ödersin.`,
        en: `With the annual plan, you pay about ${annualEquivalentLabel} per month.`,
      },
      localization,
    ),
    footnote: formatMessage(
      {
        tr: 'Gösterilen fiyatlar referans amaçlıdır. Nihai ödeme fiyatı App Store veya Google Play mağaza bölgesine göre değişebilir.',
        en: 'Shown prices are reference values. Final billing may vary based on your App Store or Google Play region.',
      },
      localization,
    ),
  };
}
