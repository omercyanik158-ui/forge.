// Decode only known legacy UTF-8 artifacts. Decoding every string corrupts
// valid Turkish characters such as dotless i and s with cedilla.
const MOJIBAKE_MARKER = /(?:\u00c3|\u00c4|\u00c5|\u00c2|\u00e2)/u;
const DEFAULT_TEXT_LOCALE = 'tr-TR';

const LEGACY_UTF8_REPLACEMENTS: readonly (readonly [RegExp, string])[] = [
  [/\u00c3\u00bc/g, '\u00fc'],
  [/\u00c3\u009c/g, '\u00dc'],
  [/\u00c3\u0153/g, '\u00dc'],
  [/\u00c4\u00b1/g, '\u0131'],
  [/\u00c4\u00b0/g, '\u0130'],
  [/\u00c5\u0178/g, '\u015f'],
  [/\u00c5\u009e/g, '\u015e'],
  [/\u00c5\u017e/g, '\u015e'],
  [/\u00c3\u00a7/g, '\u00e7'],
  [/\u00c3\u0087/g, '\u00c7'],
  [/\u00c3\u00b6/g, '\u00f6'],
  [/\u00c3\u0096/g, '\u00d6'],
  [/\u00c3\u2013/g, '\u00d6'],
  [/\u00c4\u0178/g, '\u011f'],
  [/\u00c4\u009e/g, '\u011e'],
  [/\u00c4\u017e/g, '\u011e'],
  [/\u00c2\u00b7/g, '\u00b7'],
  [/\u00c2/g, ''],
];

function decodeUtf8Mojibake(value: string): string {
  try {
    const encoded = Array.from(value, (character) => {
      const codePoint = character.codePointAt(0);
      if (codePoint == null || codePoint > 0xff) return character;
      return `%${codePoint.toString(16).padStart(2, '0')}`;
    }).join('');

    return decodeURIComponent(encoded);
  } catch {
    return value;
  }
}

export function repairText(value: string): string {
  let current = value;

  for (let pass = 0; pass < 2 && MOJIBAKE_MARKER.test(current); pass += 1) {
    const replaced = LEGACY_UTF8_REPLACEMENTS.reduce(
      (next, [pattern, replacement]) => next.replace(pattern, replacement),
      current,
    );
    const decoded = MOJIBAKE_MARKER.test(replaced) ? decodeUtf8Mojibake(replaced) : replaced;
    if (decoded === current) break;
    current = decoded;
  }

  return current;
}

export function normalizeProgramText(value: string): string {
  return repairText(value)
    .replace(/\bG\u00f6vde\b/g, '\u00dcst V\u00fccut')
    .replace(/\b\u00dcst G\u00f6vde\b/g, '\u00dcst V\u00fccut')
    .replace(/\bAlt G\u00f6vde\b/g, 'Alt V\u00fccut')
    .replace(/\bEkstremite\b/g, 'Alt V\u00fccut')
    .replace(/\bekstremite\b/g, 'alt v\u00fccut')
    .replace(/\bust govde\b/g, '\u00fcst v\u00fccut')
    .replace(/\balt govde\b/g, 'alt v\u00fccut')
    .replace(/\bUst Govde\b/g, '\u00dcst V\u00fccut')
    .replace(/\bAlt Govde\b/g, 'Alt V\u00fccut')
    .replace(/\btam vucut\b/g, 't\u00fcm v\u00fccut')
    .replace(/\bTam Vucut\b/g, 'T\u00fcm V\u00fccut')
    .replace(/\bTam v\u00fccut\b/g, 'T\u00fcm v\u00fccut')
    .replace(/\btam v\u00fccut\b/g, 't\u00fcm v\u00fccut')
    .replace(/\bTam V\u00fccut\b/g, 'T\u00fcm V\u00fccut')
    .replace(/\btam V\u00fccut\b/g, 't\u00fcm V\u00fccut');
}

export function formatPersonName(value?: string | null): string {
  const cleaned = repairText(value ?? '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  return cleaned
    .split(' ')
    .map((part) => {
      // Locale-bagimsiz casing (toUpperCase/toLowerCase): toLocale* Turkce cihazda yabanci
      // isimleri bozar (ornegin irina -> Irina). Sadece ilk harf buyuk, gerisi kucuk.
      const [first = '', ...rest] = Array.from(part);
      return `${first.toUpperCase()}${rest.join('').toLowerCase()}`;
    })
    .join(' ');
}

export function repairTextArray(values: string[]): string[] {
  return values.map(repairText);
}

export function normalizedText(value: string, locale: string = DEFAULT_TEXT_LOCALE): string {
  return repairText(value).toLocaleLowerCase(locale);
}

export function formatSourceLabel(
  source?: 'exercise' | 'program' | 'custom' | 'ai_program',
  language: 'tr' | 'en' = 'tr',
): string {
  if (source === 'program') return 'Program';
  if (source === 'ai_program') return 'AI Signature';
  if (source === 'custom') return language === 'tr' ? 'Ki\u015fisel plan' : 'Custom plan';
  return language === 'tr' ? 'Egzersiz' : 'Exercise';
}
