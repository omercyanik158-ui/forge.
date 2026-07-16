function normalizeString(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const serverConfig = {
  geminiApiKey: normalizeString(process.env.GEMINI_API_KEY),
  geminiModel: normalizeString(process.env.GEMINI_MODEL) ?? 'gemini-2.5-flash',
  revenueCatSecretApiKey: normalizeString(process.env.REVENUECAT_SECRET_API_KEY),
  upstashRedisRestUrl: normalizeString(process.env.UPSTASH_REDIS_REST_URL),
  upstashRedisRestToken: normalizeString(process.env.UPSTASH_REDIS_REST_TOKEN),
} as const;

export type ServerConfigIssue = {
  key: string;
  message: string;
};

export function getServerConfigIssues(): ServerConfigIssue[] {
  const issues: ServerConfigIssue[] = [];
  if (!serverConfig.geminiApiKey) {
    issues.push({ key: 'GEMINI_API_KEY', message: 'Gemini API key is missing.' });
  }
  if (!serverConfig.revenueCatSecretApiKey) {
    issues.push({ key: 'REVENUECAT_SECRET_API_KEY', message: 'RevenueCat secret API key is missing.' });
  }
  if (!serverConfig.upstashRedisRestUrl) {
    issues.push({ key: 'UPSTASH_REDIS_REST_URL', message: 'Upstash Redis REST URL is missing.' });
  }
  if (!serverConfig.upstashRedisRestToken) {
    issues.push({ key: 'UPSTASH_REDIS_REST_TOKEN', message: 'Upstash Redis REST token is missing.' });
  }
  return issues;
}
