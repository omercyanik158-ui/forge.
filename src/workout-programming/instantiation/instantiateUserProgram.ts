import {
  buildTemplateProgram,
  type ProgramRequest,
  type TemplateEngineResult,
} from '@/services/templateProgramEngine';
import type { AIProgramPlan } from '@/types/aiProgramPlan';

export function instantiateUserProgram(input: {
  request: ProgramRequest;
  existingPlan?: AIProgramPlan | null;
}): TemplateEngineResult {
  return buildTemplateProgram(input);
}
