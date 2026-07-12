import type { LocalizedMessage } from '@/services/messages';

export const PAYWALL_COPY = {
  heroTitle: {
    tr: 'Daha güçlü bir takip deneyimi',
    en: 'A stronger tracking experience',
  },
  heroBody: {
    tr: 'Programlar, AI araçları ve gelişim içgörülerini tek premium akışta birleştir.',
    en: 'Bring programs, AI tools, and deeper progress insights together in one premium flow.',
  },
  cta: {
    tr: 'Premium’u aç',
    en: 'Unlock premium',
  },
  restore: {
    tr: 'Satın almaları geri yükle',
    en: 'Restore purchases',
  },
  reassurance: {
    tr: 'Ödeme ve abonelik akışı app store bağlantıları tamamlandığında aktif olacak.',
    en: 'Purchasing goes live once the app-store connection is completed.',
  },
} as const satisfies Record<string, LocalizedMessage>;
