import type { AppLanguagePreference, AppPreferences, MeasurementPreference } from './appPreferencesStore';
import { repairText } from './textUtils';

export type AppLanguage = 'tr' | 'en';
export type MeasurementSystem = 'metric' | 'imperial';
export type PremiumMarketCode = 'tr' | 'eu' | 'uk' | 'us' | 'global';

type DeviceLocaleSnapshot = {
  localeTag: string;
  regionCode: string | null;
  languageCode: string | null;
  currencyCode: string | null;
  measurementSystem: string | null;
  uses24hourClock: boolean | null;
  timeZone: string | null;
};

export type ResolvedLocalization = {
  languagePreference: AppLanguagePreference;
  unitsPreference: MeasurementPreference;
  language: AppLanguage;
  measurementSystem: MeasurementSystem;
  localeTag: string;
  regionCode: string | null;
  currencyCode: string;
  market: PremiumMarketCode;
  firstWeekday: number;
  uses24hourClock: boolean;
  timeZone: string | null;
};

const EU_REGION_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const ENGLISH_LOCALE_BY_MARKET: Record<PremiumMarketCode, string> = {
  tr: 'en-US',
  eu: 'en-IE',
  uk: 'en-GB',
  us: 'en-US',
  global: 'en-US',
};

const DEFAULT_RESOLVED: ResolvedLocalization = {
  languagePreference: 'auto',
  unitsPreference: 'auto',
  language: 'tr',
  measurementSystem: 'metric',
  localeTag: 'tr-TR',
  regionCode: 'TR',
  currencyCode: 'TRY',
  market: 'tr',
  firstWeekday: 2,
  uses24hourClock: true,
  timeZone: null,
};

let runtimeLocalization: ResolvedLocalization = DEFAULT_RESOLVED;

type LocaleRecord = {
  languageTag?: string;
  regionCode?: string | null;
  languageCode?: string | null;
  currencyCode?: string | null;
  measurementSystem?: string | null;
};

type CalendarRecord = {
  uses24hourClock?: boolean | null;
  timeZone?: string | null;
};

function loadExpoLocalizationModule():
  | {
      getLocales: () => LocaleRecord[];
      getCalendars: () => CalendarRecord[];
    }
  | null {
  try {
    const req = Function('return typeof require !== "undefined" ? require : null')() as
      | ((name: string) => { getLocales: () => LocaleRecord[]; getCalendars: () => CalendarRecord[] })
      | null;
    return req ? req('expo-localization') : null;
  } catch {
    return null;
  }
}

function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addLocalDays(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function normalizeRegion(regionCode: string | null | undefined): string | null {
  return regionCode ? regionCode.toUpperCase() : null;
}

function detectDeviceLocaleSnapshot(): DeviceLocaleSnapshot {
  const localization = loadExpoLocalizationModule();
  const [locale] = localization?.getLocales?.() ?? [];
  const [calendar] = localization?.getCalendars?.() ?? [];

  return {
    localeTag: locale?.languageTag || 'tr-TR',
    regionCode: normalizeRegion(locale?.regionCode),
    languageCode: locale?.languageCode?.toLowerCase() || null,
    currencyCode: locale?.currencyCode?.toUpperCase() || null,
    measurementSystem: locale?.measurementSystem || null,
    uses24hourClock: calendar?.uses24hourClock ?? null,
    timeZone: calendar?.timeZone ?? null,
  };
}

export function detectPremiumMarket(regionCode: string | null | undefined): PremiumMarketCode {
  const normalizedRegion = normalizeRegion(regionCode);
  if (normalizedRegion === 'TR') return 'tr';
  if (normalizedRegion === 'GB') return 'uk';
  if (normalizedRegion === 'US') return 'us';
  if (normalizedRegion && EU_REGION_CODES.has(normalizedRegion)) return 'eu';
  return 'global';
}

function resolveLanguage(
  preference: AppLanguagePreference,
  snapshot: DeviceLocaleSnapshot,
): AppLanguage {
  if (preference === 'tr' || preference === 'en') return preference;
  return snapshot.regionCode === 'TR' || snapshot.languageCode === 'tr' ? 'tr' : 'en';
}

function resolveMeasurementSystem(
  preference: MeasurementPreference,
  snapshot: DeviceLocaleSnapshot,
): MeasurementSystem {
  if (preference === 'metric' || preference === 'imperial') return preference;
  return snapshot.measurementSystem === 'us' || snapshot.measurementSystem === 'uk' ? 'imperial' : 'metric';
}

function resolveCurrencyCode(snapshot: DeviceLocaleSnapshot, market: PremiumMarketCode): string {
  if (snapshot.currencyCode) return snapshot.currencyCode;
  if (market === 'tr') return 'TRY';
  if (market === 'eu') return 'EUR';
  if (market === 'uk') return 'GBP';
  return 'USD';
}

function resolveLocaleTag(language: AppLanguage, snapshot: DeviceLocaleSnapshot, market: PremiumMarketCode): string {
  if (language === 'tr') return 'tr-TR';
  return snapshot.localeTag.startsWith('en-') ? snapshot.localeTag : ENGLISH_LOCALE_BY_MARKET[market];
}

export function resolveLocalization(preferences: AppPreferences, snapshot = detectDeviceLocaleSnapshot()): ResolvedLocalization {
  const market = detectPremiumMarket(snapshot.regionCode);
  const language = resolveLanguage(preferences.language, snapshot);
  const measurementSystem = resolveMeasurementSystem(preferences.units, snapshot);

  return {
    languagePreference: preferences.language,
    unitsPreference: preferences.units,
    language,
    measurementSystem,
    localeTag: resolveLocaleTag(language, snapshot, market),
    regionCode: snapshot.regionCode,
    currencyCode: resolveCurrencyCode(snapshot, market),
    market,
    firstWeekday: 2,
    uses24hourClock: snapshot.uses24hourClock ?? market !== 'us',
    timeZone: snapshot.timeZone,
  };
}

export function setRuntimeLocalization(localization: ResolvedLocalization): void {
  runtimeLocalization = localization;
}

export function getRuntimeLocalization(): ResolvedLocalization {
  return runtimeLocalization;
}

export function formatMessage(
  messages: { tr: string; en: string },
  localization = runtimeLocalization,
): string {
  return repairText(localization.language === 'tr' ? messages.tr : messages.en);
}

function normalizeDateInput(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions,
  localization = runtimeLocalization,
): string {
  const date = normalizeDateInput(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(localization.localeTag, options).format(date);
}

export function formatTime(
  hour: number,
  minute: number,
  localization = runtimeLocalization,
): string {
  const date = new Date(2000, 0, 1, hour, minute);
  return new Intl.DateTimeFormat(localization.localeTag, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: localization.uses24hourClock ? false : true,
  }).format(date);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  localization = runtimeLocalization,
): string {
  return new Intl.NumberFormat(localization.localeTag, options).format(value);
}

export function formatCurrency(
  value: number,
  currencyCode = runtimeLocalization.currencyCode,
  localization = runtimeLocalization,
): string {
  return new Intl.NumberFormat(localization.localeTag, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRelativeDateLabel(key: string, localization = runtimeLocalization): string {
  const today = localDateKey();
  if (key === today) return formatMessage({ tr: 'Bugün', en: 'Today' }, localization);
  if (key === addLocalDays(today, -1)) return formatMessage({ tr: 'Dün', en: 'Yesterday' }, localization);
  if (key === addLocalDays(today, 1)) return formatMessage({ tr: 'Yarın', en: 'Tomorrow' }, localization);
  return formatDate(`${key}T12:00:00`, { day: 'numeric', month: 'long' }, localization);
}

export function getWeekStartKey(date: Date = new Date(), localization = runtimeLocalization): string {
  const copy = new Date(date);
  const weekday = copy.getDay() + 1;
  const offset = (weekday - localization.firstWeekday + 7) % 7;
  copy.setDate(copy.getDate() - offset);
  return localDateKey(copy);
}

export function kgToLb(value: number): number {
  return value * 2.2046226218;
}

export function lbToKg(value: number): number {
  return value / 2.2046226218;
}

export function cmToIn(value: number): number {
  return value / 2.54;
}

export function inToCm(value: number): number {
  return value * 2.54;
}

export function mlToFluidOz(value: number): number {
  return value / 29.5735295625;
}

export function fluidOzToMl(value: number): number {
  return value * 29.5735295625;
}

export function weightUnitLabel(localization = runtimeLocalization): string {
  return localization.measurementSystem === 'imperial' ? 'lb' : 'kg';
}

export function heightUnitLabel(localization = runtimeLocalization): string {
  return localization.measurementSystem === 'imperial' ? 'in' : 'cm';
}

export function liquidUnitLabel(localization = runtimeLocalization): string {
  return localization.measurementSystem === 'imperial' ? 'fl oz' : 'L';
}

export function toDisplayWeight(weightKg: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? kgToLb(weightKg) : weightKg;
}

export function fromDisplayWeight(weight: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? lbToKg(weight) : weight;
}

export function toDisplayHeight(heightCm: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? cmToIn(heightCm) : heightCm;
}

export function fromDisplayHeight(height: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? inToCm(height) : height;
}

export function toDisplayLength(lengthCm: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? cmToIn(lengthCm) : lengthCm;
}

export function fromDisplayLength(length: number, localization = runtimeLocalization): number {
  return localization.measurementSystem === 'imperial' ? inToCm(length) : length;
}

export function formatWeightValue(weightKg: number, maximumFractionDigits = 1, localization = runtimeLocalization): string {
  return formatNumber(toDisplayWeight(weightKg, localization), { maximumFractionDigits }, localization);
}

export function formatHeightValue(heightCm: number, maximumFractionDigits = 1, localization = runtimeLocalization): string {
  return formatNumber(toDisplayHeight(heightCm, localization), { maximumFractionDigits }, localization);
}

export function formatLiquidValue(ml: number, maximumFractionDigits = 2, localization = runtimeLocalization): string {
  if (localization.measurementSystem === 'imperial') {
    return formatNumber(mlToFluidOz(ml), { maximumFractionDigits }, localization);
  }

  return formatNumber(ml / 1000, { maximumFractionDigits }, localization);
}
