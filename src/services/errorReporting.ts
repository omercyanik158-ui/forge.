import { Platform } from 'react-native';
import { clientConfig } from '@/config/clientConfig';

export type ErrorReportingUser = {
  id?: string;
  username?: string;
  isPremium?: boolean;
};

export type ErrorContext = {
  level?: 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
};

type Breadcrumb = {
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  createdAt: string;
};

const RUNTIME_ENVIRONMENT = clientConfig.appEnvMarker;

const MAX_BREADCRUMBS = 50;

let initialized = false;
let reportingUser: ErrorReportingUser | null = null;
let breadcrumbs: Breadcrumb[] = [];

export function configureErrorReporting(): void {
  if (initialized) return;

  initialized = true;

  if (__DEV__) {
    console.info(
      '[errorReporting] Sentry kaldırıldı. Yerel konsol raporlama aktif.',
    );
  }
}

export function captureError(
  error: unknown,
  context?: ErrorContext,
): string | null {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  const payload = {
    name: normalizedError.name,
    message: normalizedError.message,
    stack: normalizedError.stack,
    level: context?.level ?? 'error',
    tags: context?.tags,
    extra: context?.extra,
    user: reportingUser,
    breadcrumbs: [...breadcrumbs],
    runtime: getRuntimeEnvironment(),
  };

  if (context?.level === 'info') {
    console.info('[errorReporting]', payload);
  } else if (context?.level === 'warning') {
    console.warn('[errorReporting]', payload);
  } else {
    console.error('[errorReporting]', payload);
  }

  /*
   * Sentry kaldırıldığı için uzaktaki bir hata kaydı kimliği üretilemiyor.
   * Mevcut çağrıları bozmamak için eski dönüş tipi korunuyor.
   */
  return null;
}

export function setReportingUser(user: ErrorReportingUser | null): void {
  reportingUser = user ? { ...user } : null;
}

export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>,
): void {
  breadcrumbs.push({
    message,
    category,
    data,
    createdAt: new Date().toISOString(),
  });

  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
  }

  if (__DEV__) {
    console.debug('[breadcrumb]', {
      message,
      category,
      data,
    });
  }
}

export function clearBreadcrumbs(): void {
  breadcrumbs = [];
}

export function isErrorReportingActive(): boolean {
  return initialized;
}

export function getRuntimeEnvironment(): string {
  return `${RUNTIME_ENVIRONMENT}:${Platform.OS}`;
}
