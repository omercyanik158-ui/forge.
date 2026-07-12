import { describe, expect, it } from 'vitest';
import { formatMessage, setRuntimeLocalization } from '@/services/localization';
import { getLocalizedMessage, messages } from '@/services/messages';
import { formatPersonName, repairText } from '@/services/textUtils';

describe('formatMessage', () => {
  it('runtime Türkçe iken tr değerini verir', () => {
    setRuntimeLocalization({
      languagePreference: 'auto', unitsPreference: 'auto', language: 'tr', measurementSystem: 'metric',
      localeTag: 'tr-TR', regionCode: 'TR', currencyCode: 'TRY', market: 'tr',
      firstWeekday: 2, uses24hourClock: true, timeZone: null,
    });
    expect(formatMessage({ tr: 'Merhaba', en: 'Hello' })).toBe('Merhaba');
  });

  it('runtime İngilizce iken en değerini verir', () => {
    setRuntimeLocalization({
      languagePreference: 'auto', unitsPreference: 'auto', language: 'en', measurementSystem: 'metric',
      localeTag: 'en-US', regionCode: 'US', currencyCode: 'USD', market: 'us',
      firstWeekday: 1, uses24hourClock: false, timeZone: null,
    });
    expect(formatMessage({ tr: 'Merhaba', en: 'Hello' })).toBe('Hello');
  });
});

describe('çeviri kataloğu bütünlüğü', () => {
  it('her anahtar hem tr hem en dolu içerir', () => {
    const entries = Object.entries(messages) as [string, { tr: string; en: string }][];
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, value] of entries) {
      expect(typeof value.tr).toBe('string');
      expect(typeof value.en).toBe('string');
      expect(value.tr.trim().length, `${key} tr boş`).toBeGreaterThan(0);
      expect(value.en.trim().length, `${key} en boş`).toBeGreaterThan(0);
    }
  });

  it('bilinen anahtarı döndürür, bilinmeyeni undefined', () => {
    expect(getLocalizedMessage('ai_hub.title')).toBeDefined();
    expect(getLocalizedMessage('olmayan.anahtar')).toBeUndefined();
  });
});

describe('metin onarımı', () => {
  it('doğru Türkçe ve İngilizce metinleri değiştirmez', () => {
    const values = [
      'Canlı',
      'Kalori ',
      'Başarımlar',
      'Bu haftaki ilerleyiş',
      'Choose from library',
      "This week's progress",
    ];

    for (const value of values) expect(repairText(value)).toBe(value);
  });

  it('metin parçalarının boşluklarını korur', () => {
    expect(`${repairText('Kalori ')}${repairText('0')}`).toBe('Kalori 0');
    expect(`${repairText('This week ')}${repairText('progress')}`).toBe('This week progress');
  });

  it('eski UTF-8 mojibake metinlerini güvenle düzeltir', () => {
    expect(repairText('BaÅŸarÄ±mlar')).toBe('Başarımlar');
    expect(repairText('Ã–ÄŸÃ¼n')).toBe('Öğün');
  });
});

describe('kisi adi bicimlendirme', () => {
  it('ilk harfi buyuk, gerisini kucuk yapar', () => {
    expect(formatPersonName('omer')).toBe('Omer');
    expect(formatPersonName('oMeR')).toBe('Omer');
    expect(formatPersonName('OMER')).toBe('Omer');
  });
  it('yabanci isimlerde Turkce i/İ tuzağına düşmez (irina -> Irina)', () => {
    expect(formatPersonName('irina')).toBe('Irina');
    expect(formatPersonName('IRINA')).toBe('Irina');
    expect(formatPersonName('irina')).not.toBe('İrina');
  });
  it('coklu kelime adlarinda her kelimeyi bicimlendirir', () => {
    expect(formatPersonName('ahmet yilmaz')).toBe('Ahmet Yilmaz');
  });
  it('bos veya tanimsiz giriste bos doner', () => {
    expect(formatPersonName('')).toBe('');
    expect(formatPersonName(null)).toBe('');
    expect(formatPersonName(undefined)).toBe('');
    expect(formatPersonName('   ')).toBe('');
  });
});
