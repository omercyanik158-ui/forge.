import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCalendars, useLocales } from 'expo-localization';
import {
  DEFAULT_APP_PREFERENCES,
  loadAppPreferences,
  saveAppPreferences,
  type AppLanguagePreference,
  type AppPreferences,
  type MeasurementPreference,
} from '@/services/appPreferencesStore';
import {
  formatMessage,
  resolveLocalization,
  setRuntimeLocalization,
  type ResolvedLocalization,
} from '@/services/localization';
import { getLocalizedMessage, type LocalizedMessage } from '@/services/messages';
import { repairText } from '@/services/textUtils';

type TranslationInput = string | LocalizedMessage;

type LocalizationContextValue = {
  preferences: AppPreferences;
  resolved: ResolvedLocalization;
  setLanguagePreference: (preference: AppLanguagePreference) => Promise<void>;
  setMeasurementPreference: (preference: MeasurementPreference) => Promise<void>;
  t: (input: TranslationInput) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const locales = useLocales();
  const calendars = useCalendars();
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_APP_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAppPreferences()
      .then(setPreferences)
      .catch(() => setPreferences(DEFAULT_APP_PREFERENCES))
      .finally(() => setReady(true));
  }, []);

  const resolved = useMemo(
    () =>
      resolveLocalization(preferences, {
        localeTag: locales[0]?.languageTag || 'tr-TR',
        regionCode: locales[0]?.regionCode || null,
        languageCode: locales[0]?.languageCode || null,
        currencyCode: locales[0]?.currencyCode || null,
        measurementSystem: locales[0]?.measurementSystem || null,
        uses24hourClock: calendars[0]?.uses24hourClock ?? null,
        timeZone: calendars[0]?.timeZone ?? null,
      }),
    [calendars, locales, preferences],
  );

  // Formatting services run outside React, so update them before children mount/render.
  setRuntimeLocalization(resolved);

  const setLanguagePreference = useCallback(async (preference: AppLanguagePreference) => {
    const next = { ...preferences, language: preference };
    setPreferences(next);
    await saveAppPreferences(next);
  }, [preferences]);

  const setMeasurementPreference = useCallback(async (preference: MeasurementPreference) => {
    const next = { ...preferences, units: preference };
    setPreferences(next);
    await saveAppPreferences(next);
  }, [preferences]);

  const value = useMemo<LocalizationContextValue>(
    () => ({
      preferences,
      resolved,
      setLanguagePreference,
      setMeasurementPreference,
      t: (input) => {
        if (typeof input === 'string') {
          const message = getLocalizedMessage(input);
          return repairText(message ? formatMessage(message, resolved) : input);
        }
        return repairText(formatMessage(input, resolved));
      },
    }),
    [preferences, resolved, setLanguagePreference, setMeasurementPreference],
  );

  if (!ready) return null;
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useAppLocalization(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error('useAppLocalization must be used within LocalizationProvider');
  return context;
}
