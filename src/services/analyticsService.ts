import { ANALYTICS_EVENTS, type AnalyticsEventName } from '@/config/analyticsEvents';
import { clientConfig } from '@/config/clientConfig';
import { addBreadcrumb, captureError } from './errorReporting';
import type { ResolvedLocalization } from './localization';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

type AnalyticsUser = {
  id?: string;
  name?: string;
  premium?: boolean;
  language?: string;
  market?: string;
};

type AnalyticsAdapter = {
  identify?: (userId: string, properties?: AnalyticsProperties) => Promise<void> | void;
  reset?: () => Promise<void> | void;
  capture?: (eventName: string, properties?: AnalyticsProperties) => Promise<void> | void;
  screen?: (screenName: string, properties?: AnalyticsProperties) => Promise<void> | void;
};

let adapterPromise: Promise<AnalyticsAdapter | null> | null = null;
let currentUser: AnalyticsUser | null = null;
let runtimeContext: AnalyticsProperties = {};

const POSTHOG_KEY = clientConfig.analytics.posthogKey;
const POSTHOG_HOST = clientConfig.analytics.posthogHost;
const ANALYTICS_ENABLED = clientConfig.analytics.enabled;

async function loadAdapter(): Promise<AnalyticsAdapter | null> {
  if (!ANALYTICS_ENABLED || !POSTHOG_KEY) return null;

  if (!adapterPromise) {
    adapterPromise = (async () => {
      try {
        const posthogModuleId = 'posthog-react-native';
        type PostHogModule = {
          PostHog?: new (key: string, options?: Record<string, unknown>) => unknown;
          default?: { PostHog?: new (key: string, options?: Record<string, unknown>) => unknown };
        };
        const module = (await import(posthogModuleId)) as PostHogModule;
        const PostHog = module.PostHog ?? module.default?.PostHog;
        if (!PostHog) return null;

        const client = new PostHog(POSTHOG_KEY, {
          host: POSTHOG_HOST,
          flushAt: 1,
          flushInterval: 10_000,
        }) as {
          identify?: (userId: string, properties?: AnalyticsProperties) => Promise<void> | void;
          reset?: () => Promise<void> | void;
          capture?: (eventName: string, properties?: AnalyticsProperties) => Promise<void> | void;
          screen?: (screenName: string, properties?: AnalyticsProperties) => Promise<void> | void;
        };

        return {
          identify: client.identify?.bind(client),
          reset: client.reset?.bind(client),
          capture: client.capture?.bind(client),
          screen: client.screen?.bind(client),
        } satisfies AnalyticsAdapter;
      } catch (error) {
        captureError(error, {
          level: 'warning',
          tags: { source: 'analytics', stage: 'adapter_load' },
        });
        return null;
      }
    })();
  }

  return adapterPromise;
}

function mergeContext(properties?: AnalyticsProperties): AnalyticsProperties {
  return {
    ...runtimeContext,
    ...properties,
    premium: properties?.premium ?? currentUser?.premium ?? runtimeContext.premium,
    language: properties?.language ?? currentUser?.language ?? runtimeContext.language,
    market: properties?.market ?? currentUser?.market ?? runtimeContext.market,
  };
}

export async function configureAnalytics(localization?: ResolvedLocalization): Promise<void> {
  if (localization) {
    runtimeContext = {
      ...runtimeContext,
      locale: localization.localeTag,
      language: localization.language,
      market: localization.market,
      currency: localization.currencyCode,
      measurementSystem: localization.measurementSystem,
    };
  }

  await loadAdapter();
}

export function setAnalyticsContext(properties: AnalyticsProperties): void {
  runtimeContext = {
    ...runtimeContext,
    ...properties,
  };
}

export async function identifyAnalyticsUser(user: AnalyticsUser | null): Promise<void> {
  currentUser = user;
  const adapter = await loadAdapter();
  if (!adapter) return;

  try {
    if (!user?.id) {
      await adapter.reset?.();
      return;
    }

    await adapter.identify?.(user.id, mergeContext({
      name: user.name,
      premium: user.premium ?? false,
      language: user.language,
      market: user.market,
    }));
  } catch (error) {
    captureError(error, {
      level: 'warning',
      tags: { source: 'analytics', stage: 'identify' },
    });
  }
}

export async function resetAnalytics(): Promise<void> {
  currentUser = null;
  const adapter = await loadAdapter();
  await adapter?.reset?.();
}

export async function trackEvent(eventName: AnalyticsEventName, properties?: AnalyticsProperties): Promise<void> {
  addBreadcrumb(`analytics:${eventName}`, 'analytics', properties);

  const adapter = await loadAdapter();
  if (!adapter) return;

  try {
    await adapter.capture?.(eventName, mergeContext(properties));
  } catch (error) {
    captureError(error, {
      level: 'warning',
      tags: { source: 'analytics', stage: 'capture', eventName },
      extra: { properties },
    });
  }
}

export async function trackScreen(screenName: string, properties?: AnalyticsProperties): Promise<void> {
  addBreadcrumb(`screen:${screenName}`, 'analytics', properties);

  const adapter = await loadAdapter();
  if (!adapter) return;

  try {
    await adapter.screen?.(screenName, mergeContext(properties));
  } catch (error) {
    captureError(error, {
      level: 'warning',
      tags: { source: 'analytics', stage: 'screen', screenName },
      extra: { properties },
    });
  }
}

export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_ENABLED && !!POSTHOG_KEY;
}

export { ANALYTICS_EVENTS };
