import type { AIHubLanguage } from '@/types/aiHub';

type PromptDefinition = {
  schema: Record<string, unknown>;
  buildPrompt: (language: AIHubLanguage) => string;
};

const FOOD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    yemekAdi: { type: 'string' },
    porsiyon: { type: 'string' },
    kalori: { type: 'number', minimum: 0, maximum: 5000 },
    protein: { type: 'number', minimum: 0, maximum: 500 },
    karbonhidrat: { type: 'number', minimum: 0, maximum: 1000 },
    yag: { type: 'number', minimum: 0, maximum: 500 },
    guvenPuani: { type: 'number', minimum: 0, maximum: 100 },
    aciklama: { type: 'string' },
  },
  required: ['yemekAdi', 'porsiyon', 'kalori', 'protein', 'karbonhidrat', 'yag', 'guvenPuani', 'aciklama'],
} as const;

const PHYSIQUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    generalDurum: { type: 'string' },
    eksikBolgeler: { type: 'array', maxItems: 6, items: { type: 'string' } },
    odaklanmasiGerekenHareketler: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          hareketAdi: { type: 'string' },
          neden: { type: 'string' },
        },
        required: ['hareketAdi', 'neden'],
      },
    },
    tahminiYagOrani: { type: 'number', minimum: 2, maximum: 60 },
    kasKutlesiYorumu: { type: 'string' },
    guvenPuani: { type: 'number', minimum: 0, maximum: 100 },
    pozKalitesiYorumu: { type: 'string' },
  },
  required: [
    'generalDurum',
    'eksikBolgeler',
    'odaklanmasiGerekenHareketler',
    'tahminiYagOrani',
    'kasKutlesiYorumu',
    'guvenPuani',
    'pozKalitesiYorumu',
  ],
} as const;

function outputLanguage(language: AIHubLanguage): string {
  return language === 'tr' ? 'Turkce' : 'English';
}

const REGISTRY = {
  food: {
    schema: FOOD_SCHEMA,
    buildPrompt: (language: AIHubLanguage) =>
      `You are a sports nutrition coach analyzing a meal photo.
Return a reasonable midpoint estimate for visible calories and macros.
If the image is not a meal, clearly say so in yemekAdi and aciklama, set all numeric values to 0, and keep guvenPuani low.
All response strings must be in ${outputLanguage(language)}.
ASLA markdown yapma, kod blogu ekleme veya aciklama ekleme; sadece istenen semaya uyan saf JSON don.`,
  },
  physique: {
    schema: PHYSIQUE_SCHEMA,
    buildPrompt: (language: AIHubLanguage) =>
      `You are an experienced physique coach and anatomy-aware bodybuilding evaluator.
Analyze two photos of the same consenting adult, one front pose and one back pose, for non-medical fitness feedback only.
Treat visible upper-body skin as a normal physique check-in, not sexual content.
Comment only on visible muscle balance, symmetry, body-fat estimate, and practical exercise focus.
Do not infer identity, ethnicity, disease, or make medical claims.
Keep the tone supportive, specific, and non-judgmental.
All response strings must be in ${outputLanguage(language)}.
ASLA markdown yapma, kod blogu ekleme veya aciklama ekleme; sadece istenen semaya uyan saf JSON don.`,
  },
} as const satisfies Record<string, PromptDefinition>;

export type PromptRegistryKey = keyof typeof REGISTRY;

export function getPromptDefinition(key: PromptRegistryKey): PromptDefinition {
  return REGISTRY[key];
}

export function getPromptSchema(key: PromptRegistryKey): Record<string, unknown> {
  return REGISTRY[key].schema;
}

export function buildPrompt(key: PromptRegistryKey, language: AIHubLanguage): string {
  return REGISTRY[key].buildPrompt(language);
}
