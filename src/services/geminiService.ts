import Constants from 'expo-constants';
import { fetch } from 'expo/fetch';
import { parseFoodAnalysisResult, parsePhysiqueAnalysisResult } from './aiHubValidation';
import type { AIHubLanguage, FoodAnalysisResult, PhysiqueAnalysisResult } from '@/types/aiHub';

type AnalyzeOptions = {
  language?: AIHubLanguage;
  signal?: AbortSignal;
  premium?: boolean;
  appUserId?: string;
  age?: number;
  requestId?: string;
};

type AIHubErrorDetails = {
  blockReason?: string;
  safetyCategories?: string[];
};

type AIHubApiResponse = {
  result?: unknown;
  error?: string;
  code?: string;
  details?: AIHubErrorDetails;
  quota?: {
    source?: 'premium' | 'free_quota' | 'rewarded_credit';
  };
};

export type AIQuotaSource = 'premium' | 'free_quota' | 'rewarded_credit';

export type AnalyzeResponse<T> = {
  result: T;
  quotaSource?: AIQuotaSource;
};

function normalizeHttpOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return null;
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  if (/^exps?:\/\//.test(trimmed)) {
    return trimmed.replace(/^exp:\/\//, 'http://').replace(/^exps:\/\//, 'https://');
  }
  return `http://${trimmed}`;
}

function developmentOrigin(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.experienceUrl,
    Constants.linkingUri,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeHttpOrigin(candidate);
    if (normalized) {
      return normalized.replace(/\/--(?:\/.*)?$/, '').replace(/\/$/, '');
    }
  }

  return null;
}

export class AIHubApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly details?: AIHubErrorDetails,
  ) {
    super(message);
    this.name = 'AIHubApiError';
  }
}

function endpoint(): string {
  const baseUrl = process.env.EXPO_PUBLIC_AI_API_URL?.replace(/\/$/, '');
  if (baseUrl) return `${baseUrl}/api/ai-analyze`;
  if (process.env.EXPO_OS === 'web') return '/api/ai-analyze';

  const origin = developmentOrigin();
  if (origin) return `${origin}/api/ai-analyze`;

  throw new AIHubApiError('AI API URL is not configured.', 'AI_NOT_CONFIGURED', 503);
}

async function postAnalysis(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<AnalyzeResponse<unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50_000);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as AIHubApiResponse;

    if (!response.ok || !payload.result) {
      throw new AIHubApiError(
        payload.error || 'AI analysis could not be completed.',
        payload.code || 'AI_REQUEST_FAILED',
        response.status,
        payload.details,
      );
    }

    return {
      result: payload.result,
      quotaSource: payload.quota?.source,
    };
  } catch (error) {
    if (error instanceof AIHubApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIHubApiError('AI analysis timed out.', 'TIMEOUT', 408);
    }
    throw new AIHubApiError('Network connection could not be established.', 'NETWORK_ERROR', 0);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function analyzeFood(
  base64Image: string,
  options: AnalyzeOptions = {},
): Promise<AnalyzeResponse<FoodAnalysisResult>> {
  const response = await postAnalysis({
    type: 'food',
    language: options.language ?? 'tr',
    premium: options.premium === true,
    appUserId: options.appUserId,
    requestId: options.requestId,
    images: [{ base64: base64Image, mimeType: 'image/jpeg' }],
  }, options.signal);

  return {
    result: parseFoodAnalysisResult(response.result),
    quotaSource: response.quotaSource,
  };
}

export async function analyzePhysique(
  frontBase64: string,
  backBase64: string,
  options: AnalyzeOptions = {},
): Promise<AnalyzeResponse<PhysiqueAnalysisResult>> {
  const response = await postAnalysis({
    type: 'physique',
    language: options.language ?? 'tr',
    premium: options.premium === true,
    appUserId: options.appUserId,
    age: options.age,
    requestId: options.requestId,
    confirmedAdultConsent: true,
    images: [
      { base64: frontBase64, mimeType: 'image/jpeg', pose: 'front' },
      { base64: backBase64, mimeType: 'image/jpeg', pose: 'back' },
    ],
  }, options.signal);

  return {
    result: parsePhysiqueAnalysisResult(response.result),
    quotaSource: response.quotaSource,
  };
}
