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

const PHYSIQUE_REGION_ASSESSMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    region: { type: 'string' },
    developmentLevel: { type: 'string', enum: ['weak', 'average', 'strong'] },
    proportion: { type: 'string', enum: ['low', 'medium', 'high'] },
    symmetry: { type: 'string', enum: ['low', 'medium', 'high'] },
    aestheticImpact: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
    note: { type: 'string' },
  },
  required: ['region', 'developmentLevel', 'proportion', 'symmetry', 'aestheticImpact', 'priority', 'note'],
} as const;

const PHYSIQUE_OBSERVATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
  required: ['title', 'description', 'confidence'],
} as const;

const PHYSIQUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    analysisVersion: { type: 'number', enum: [2] },
    generalDurum: { type: 'string' },
    coachSummary: { type: 'string' },
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
    vTaper: {
      type: 'object',
      additionalProperties: false,
      properties: {
        shoulderWaistLook: { type: 'string', enum: ['weak', 'average', 'strong'] },
        latWidthLook: { type: 'string', enum: ['weak', 'average', 'strong'] },
        waistDominance: { type: 'string', enum: ['low', 'medium', 'high'] },
        impactLevel: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'] },
        comment: { type: 'string' },
      },
      required: ['shoulderWaistLook', 'latWidthLook', 'waistDominance', 'impactLevel', 'comment'],
    },
    muscleBalance: {
      type: 'object',
      additionalProperties: false,
      properties: {
        chest: { type: 'array', maxItems: 3, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
        shoulders: { type: 'array', maxItems: 3, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
        arms: { type: 'array', maxItems: 3, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
        back: { type: 'array', maxItems: 3, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
        legs: { type: 'array', maxItems: 4, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
        abs: { type: 'array', maxItems: 2, items: PHYSIQUE_REGION_ASSESSMENT_SCHEMA },
      },
      required: ['chest', 'shoulders', 'arms', 'back', 'legs', 'abs'],
    },
    symmetry: { type: 'array', maxItems: 4, items: PHYSIQUE_OBSERVATION_SCHEMA },
    proportion: { type: 'array', maxItems: 4, items: PHYSIQUE_OBSERVATION_SCHEMA },
    posture: { type: 'array', maxItems: 4, items: PHYSIQUE_OBSERVATION_SCHEMA },
    fatDistribution: { type: 'array', maxItems: 4, items: PHYSIQUE_OBSERVATION_SCHEMA },
    strengths: { type: 'array', maxItems: 5, items: { type: 'string' } },
    improvementAreas: { type: 'array', maxItems: 5, items: { type: 'string' } },
    priorityRoadmap: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          rank: { type: 'number', minimum: 1, maximum: 4 },
          targetArea: { type: 'string' },
          targetMuscle: { type: 'string', enum: ['chest', 'shoulders', 'lats', 'upper_back', 'arms', 'glutes', 'quads', 'hamstrings', 'calves', 'core'] },
          aestheticImpact: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'] },
          reason: { type: 'string' },
          exerciseEmphasis: { type: 'array', maxItems: 4, items: { type: 'string' } },
          volumeSignal: { type: 'string', enum: ['conservative', 'moderate', 'moderate_high'] },
        },
        required: ['rank', 'targetArea', 'targetMuscle', 'aestheticImpact', 'reason', 'exerciseEmphasis', 'volumeSignal'],
      },
    },
    programSignals: {
      type: 'object',
      additionalProperties: false,
      properties: {
        focusMuscles: {
          type: 'array',
          maxItems: 3,
          items: { type: 'string', enum: ['chest', 'shoulders', 'lats', 'upper_back', 'arms', 'glutes', 'quads', 'hamstrings', 'calves', 'core'] },
        },
        volumeBias: { type: 'string', enum: ['conservative', 'moderate', 'moderate_high'] },
        splitBiasHint: { type: 'string', enum: ['balanced', 'upper_focus', 'lower_focus', 'posterior_focus'] },
        exerciseEmphasis: { type: 'array', maxItems: 6, items: { type: 'string' } },
        postureCautions: { type: 'array', maxItems: 4, items: { type: 'string' } },
        confidenceLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['focusMuscles', 'volumeBias', 'splitBiasHint', 'exerciseEmphasis', 'postureCautions', 'confidenceLevel'],
    },
  },
  required: [
    'analysisVersion',
    'generalDurum',
    'coachSummary',
    'eksikBolgeler',
    'odaklanmasiGerekenHareketler',
    'tahminiYagOrani',
    'kasKutlesiYorumu',
    'guvenPuani',
    'pozKalitesiYorumu',
    'vTaper',
    'muscleBalance',
    'symmetry',
    'proportion',
    'posture',
    'fatDistribution',
    'strengths',
    'improvementAreas',
    'priorityRoadmap',
    'programSignals',
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
The analysis is not for finding flaws. It should guide training priorities for the next 8-12 weeks.
Return analysisVersion 2 and structure the report around: V-taper, muscle balance, symmetry, proportion, posture, visual fat distribution, strengths, improvement areas, and priority roadmap.
Use priorityRoadmap and programSignals to answer: which 1-3 areas would change the user's physique the most if trained next?
Never promise spot fat reduction. For fatDistribution, describe visible distribution only and recommend general consistency, not regional fat loss.
Use soft visual language for posture and symmetry, such as "appears" or "in the photo"; do not diagnose posture or medical conditions.
Also fill the legacy fields from the V2 interpretation: generalDurum=coachSummary, eksikBolgeler=top priorityRoadmap targetArea values, odaklanmasiGerekenHareketler=priority exercise emphasis.
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
