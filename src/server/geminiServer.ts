import { buildPrompt, getPromptSchema } from '@/services/ai/promptRegistry';
import { parseFoodAnalysisResult, parsePhysiqueAnalysisResult } from '@/services/aiHubValidation';
import { serverConfig } from './serverConfig';
import type { AIHubLanguage, FoodAnalysisResult, PhysiqueAnalysisResult } from '@/types/aiHub';

type InlineImage = {
  base64: string;
  mimeType: string;
};

type GeminiSafetySetting = {
  category:
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_CIVIC_INTEGRITY';
  threshold:
    | 'OFF'
    | 'BLOCK_NONE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_LOW_AND_ABOVE'
    | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
};

type GeminiSafetyRating = {
  category?: string;
  probability?: string;
  blocked?: boolean;
};

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
    safetyRatings?: GeminiSafetyRating[];
  }[];
  error?: { message?: string };
  promptFeedback?: { blockReason?: string; safetyRatings?: GeminiSafetyRating[] };
};

class GeminiBlockedError extends Error {
  constructor(
    readonly blockReason: string,
    readonly safetyRatings: GeminiSafetyRating[] = [],
  ) {
    super(`GEMINI_BLOCKED_${blockReason}`);
    this.name = 'GeminiBlockedError';
  }
}

const relaxedVisionSafetySettings: GeminiSafetySetting[] = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

async function requestGemini(
  prompt: string,
  images: InlineImage[],
  responseJsonSchema: Record<string, unknown>,
  options?: { safetySettings?: GeminiSafetySetting[]; imageLabels?: string[] },
): Promise<unknown> {
  const apiKey = serverConfig.geminiApiKey;
  if (!apiKey) throw new Error('GEMINI_API_KEY_MISSING');

  const model = serverConfig.geminiModel;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            ...images.flatMap((image, index) => {
              const label = options?.imageLabels?.[index];
              return [
                ...(label ? [{ text: label }] : []),
                { inlineData: { mimeType: image.mimeType, data: image.base64 } },
              ];
            }),
          ],
        }],
        safetySettings: options?.safetySettings,
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema,
          temperature: 0.2,
          maxOutputTokens: 2200,
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) throw new Error(payload.error?.message || `GEMINI_HTTP_${response.status}`);
  if (payload.promptFeedback?.blockReason) {
    throw new GeminiBlockedError(payload.promptFeedback.blockReason, payload.promptFeedback.safetyRatings);
  }

  const blockedCandidate = payload.candidates?.find((candidate) => candidate.finishReason === 'SAFETY');
  if (blockedCandidate) {
    throw new GeminiBlockedError(blockedCandidate.finishReason || 'SAFETY', blockedCandidate.safetyRatings);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw new Error('GEMINI_EMPTY_RESPONSE');

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('GEMINI_INVALID_JSON');
  }
}

export async function generateFoodAnalysis(
  image: InlineImage,
  language: AIHubLanguage,
): Promise<FoodAnalysisResult> {
  return parseFoodAnalysisResult(
    await requestGemini(buildPrompt('food', language), [image], getPromptSchema('food')),
  );
}

export async function generatePhysiqueAnalysis(
  frontImage: InlineImage,
  backImage: InlineImage,
  language: AIHubLanguage,
): Promise<PhysiqueAnalysisResult> {
  return parsePhysiqueAnalysisResult(
    await requestGemini(buildPrompt('physique', language), [frontImage, backImage], getPromptSchema('physique'), {
      safetySettings: relaxedVisionSafetySettings,
      imageLabels: [
        'Image 1: Front pose of the same consenting adult for non-sexual fitness physique analysis.',
        'Image 2: Back pose of the same consenting adult for non-sexual fitness physique analysis.',
      ],
    }),
  );
}
