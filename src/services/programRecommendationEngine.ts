import type { AIProgramAnswers, AIProgramPhysiqueSummary } from '@/types/aiProgram';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { createPersonalizedProgram } from '@/workout-programming/engine/createPersonalizedProgram';
import { instantiateUserProgram } from '@/workout-programming/instantiation/instantiateUserProgram';
import { normalizeProgramRequest } from '@/workout-programming/selection/normalizeProgramRequest';
import {
  USE_TEMPLATE_PROGRAM_ENGINE,
  matchTemplates,
  type ProgramRequest,
  type TemplateEngineResult,
  type TemplateMatchResult,
} from './templateProgramEngine';

export type ProgramRecommendation = {
  templateId: string;
  score: number;
  reasons: string[];
  breakdown: TemplateMatchResult['breakdown'];
};

type RecommendationInput = {
  basePlan?: AIProgramPlan;
  draftId?: string;
  userId?: string;
  answers: AIProgramAnswers;
  physiqueSummary?: AIProgramPhysiqueSummary;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
};

function buildRequest(input: Omit<RecommendationInput, 'basePlan'>): ProgramRequest {
  return normalizeProgramRequest({
    userId: input.userId,
    answers: input.answers,
    physiqueSummary: input.physiqueSummary,
    forceNewVariation: input.forceNewVariation,
    previousTemplateId: input.previousTemplateId,
  });
}

export function recommendPrograms(input: Omit<RecommendationInput, 'basePlan' | 'draftId'>): ProgramRecommendation[] {
  const request = buildRequest(input);
  const { compatible } = matchTemplates(request);

  return compatible.slice(0, 3).map((match) => ({
    templateId: match.templateId,
    score: match.totalScore,
    breakdown: match.breakdown,
    reasons: [
      `Goal: ${match.breakdown.goal}`,
      `Days: ${match.breakdown.days}`,
      `Level: ${match.breakdown.level}`,
      ...(input.answers.useLatestPhysiqueAnalysis && input.physiqueSummary?.focusMuscles.length
        ? ['Vücut analizi odak kasları değerlendirmeye dahil edildi.']
        : []),
    ],
  }));
}

export function buildRecommendedAIProgram(input: RecommendationInput): AIProgramPlan {
  if (!USE_TEMPLATE_PROGRAM_ENGINE && input.basePlan) return input.basePlan;

  const request = buildRequest(input);
  const result = instantiateUserProgram({ request, existingPlan: null });

  if (!result.validation.valid) {
    throw new Error(`Template program validation failed: ${result.validation.errors.map((item) => item.code).join(', ')}`);
  }

  return result.plan;
}

export async function buildOrReuseRecommendedAIProgram(input: RecommendationInput): Promise<TemplateEngineResult> {
  const request = buildRequest(input);
  const result = await createPersonalizedProgram(request);

  if (!result.validation.valid) {
    throw new Error(`Template program validation failed: ${result.validation.errors.map((item) => item.code).join(', ')}`);
  }

  return result;
}
