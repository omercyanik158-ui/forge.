import { generateFoodAnalysis, generatePhysiqueAnalysis } from '@/server/geminiServer';
import { authorizeAiQuota, finalizeAiQuota } from '@/server/aiMonetization';
import { verifyPremiumEntitlement } from '@/server/revenueCatVerification';
import { logServerError } from '@/server/serverLogger';
import type { AIHubLanguage } from '@/types/aiHub';

type RequestImage = {
  base64?: unknown;
  mimeType?: unknown;
  pose?: unknown;
};

type AnalysisRequest = {
  type?: unknown;
  language?: unknown;
  images?: unknown;
  confirmedAdultConsent?: unknown;
  premium?: unknown;
  appUserId?: unknown;
  age?: unknown;
  requestId?: unknown;
};

type ErrorDetails = {
  blockReason?: string;
  safetyCategories?: string[];
  blockedReason?: string;
  showRewardedAdOption?: boolean;
};

const MAX_BASE64_LENGTH = 8_000_000;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function parseImage(value: unknown): { base64: string; mimeType: string; pose?: string } {
  if (!value || typeof value !== 'object') throw new Error('INVALID_IMAGE');
  const image = value as RequestImage;
  if (typeof image.base64 !== 'string' || image.base64.length < 100 || image.base64.length > MAX_BASE64_LENGTH) {
    throw new Error('INVALID_IMAGE_SIZE');
  }
  if (typeof image.mimeType !== 'string' || !ALLOWED_MIME_TYPES.has(image.mimeType)) {
    throw new Error('INVALID_IMAGE_TYPE');
  }
  return {
    base64: image.base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, ''),
    mimeType: image.mimeType,
    pose: typeof image.pose === 'string' ? image.pose : undefined,
  };
}

function errorResponse(
  status: number,
  code: string,
  error: string,
  details?: ErrorDetails,
  headers?: Record<string, string>,
): Response {
  return Response.json({ code, error, details }, { status, headers });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 18_000_000) return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Görseller çok büyük.');

    const body = (await request.json()) as AnalysisRequest;
    const language: AIHubLanguage = body.language === 'en' ? 'en' : 'tr';
    if (!Array.isArray(body.images)) return errorResponse(400, 'IMAGES_REQUIRED', 'Görsel bulunamadı.');

    const appUserId = typeof body.appUserId === 'string' ? body.appUserId : undefined;
    const requestId = typeof body.requestId === 'string' && body.requestId.length <= 128 ? body.requestId : undefined;
    if (!requestId) return errorResponse(400, 'REQUEST_ID_REQUIRED', 'İstek kimliği gerekli.');
    const verifiedPremium = body.premium === true && await verifyPremiumEntitlement(appUserId);

    if (body.type === 'food') {
      if (body.images.length !== 1) return errorResponse(400, 'ONE_IMAGE_REQUIRED', 'Bir yemek görseli gerekli.');
      const quota = await authorizeAiQuota({
        appUserId,
        analysisType: 'food',
        verifiedPremium,
        requestId,
      });
      if (quota.finalized) return errorResponse(409, 'DUPLICATE_REQUEST', 'Bu analiz isteği zaten işlenmiş.');
      if (!quota.allowed) {
        return errorResponse(429, 'AI_QUOTA_BLOCKED', 'AI analiz kotası doldu.', {
          blockedReason: quota.blockedReason,
          showRewardedAdOption: quota.showRewardedAdOption,
        });
      }

      try {
        const result = await generateFoodAnalysis(parseImage(body.images[0]), language);
        await finalizeAiQuota({
          appUserId,
          analysisType: 'food',
          requestId,
          success: true,
        });
        return Response.json({ result, quota: { source: quota.source } });
      } catch (error) {
        await finalizeAiQuota({
          appUserId,
          analysisType: 'food',
          requestId,
          success: false,
        });
        throw error;
      }
    }

    if (body.type === 'physique') {
      if (body.confirmedAdultConsent !== true) {
        return errorResponse(400, 'ADULT_CONSENT_REQUIRED', 'Yetişkin onayı gerekli.');
      }
      if (typeof body.age !== 'number' || !Number.isFinite(body.age) || body.age < 18) {
        return errorResponse(403, 'ADULT_ONLY', 'Bu analiz yalnızca 18 yaş ve üzeri kullanıcılar içindir.');
      }
      if (body.images.length !== 2) {
        return errorResponse(400, 'TWO_IMAGES_REQUIRED', 'Ön ve arka poz görselleri gerekli.');
      }
      const front = parseImage(body.images[0]);
      const back = parseImage(body.images[1]);
      if (front.base64 === back.base64) {
        return errorResponse(400, 'DISTINCT_IMAGES_REQUIRED', 'Ön ve arka poz için farklı iki görsel gerekli.');
      }

      const quota = await authorizeAiQuota({
        appUserId,
        analysisType: 'physique',
        verifiedPremium,
        requestId,
      });
      if (quota.finalized) return errorResponse(409, 'DUPLICATE_REQUEST', 'Bu analiz isteği zaten işlenmiş.');
      if (!quota.allowed) {
        return errorResponse(429, 'AI_QUOTA_BLOCKED', 'AI analiz kotası doldu.', {
          blockedReason: quota.blockedReason,
          showRewardedAdOption: quota.showRewardedAdOption,
        });
      }

      try {
        const result = await generatePhysiqueAnalysis(front, back, language);
        await finalizeAiQuota({
          appUserId,
          analysisType: 'physique',
          requestId,
          success: true,
        });
        return Response.json({ result, quota: { source: quota.source } });
      } catch (error) {
        await finalizeAiQuota({
          appUserId,
          analysisType: 'physique',
          requestId,
          success: false,
        });
        throw error;
      }
    }

    return errorResponse(400, 'INVALID_ANALYSIS_TYPE', 'Geçersiz analiz türü.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    logServerError('AI Hub analysis failed', error);

    if (message === 'GEMINI_API_KEY_MISSING') {
      return errorResponse(503, 'AI_NOT_CONFIGURED', 'AI servisi henüz yapılandırılmadı.');
    }
    if (message.startsWith('INVALID_IMAGE')) {
      return errorResponse(400, 'INVALID_IMAGE', 'Görsel okunamadı veya boyutu uygun değil.');
    }
    if (message.startsWith('GEMINI_BLOCKED') && error instanceof Error) {
      const blockedError = error as Error & ErrorDetails & { safetyRatings?: { category?: string; blocked?: boolean }[] };
      return errorResponse(
        422,
        'CONTENT_BLOCKED',
        'Bu görsel güvenli biçimde analiz edilemedi.',
        {
          blockReason: blockedError.blockReason || message.replace('GEMINI_BLOCKED_', ''),
          safetyCategories: blockedError.safetyRatings
            ?.filter((rating) => rating.blocked !== false && typeof rating.category === 'string')
            .map((rating) => rating.category as string),
        },
      );
    }
    return errorResponse(502, 'AI_PROVIDER_ERROR', 'Analiz servisi geçici olarak yanıt veremiyor.');
  }
}
