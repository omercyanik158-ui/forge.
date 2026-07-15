import {
  type ProgramRequest,
  type TemplateEngineResult,
} from '@/services/templateProgramEngine';
import { instantiateUserProgram } from '../instantiation/instantiateUserProgram';
import { findExistingProgramByFingerprint } from '../persistence/programInstanceRepository';

export async function createPersonalizedProgram(request: ProgramRequest): Promise<TemplateEngineResult> {
  const existingPlan = await findExistingProgramByFingerprint(request);
  const result = instantiateUserProgram({ request, existingPlan });
  if (!result.validation.valid) {
    throw new Error(`Instantiated program failed validation: ${result.validation.errors.map((issue) => issue.code).join(', ')}`);
  }
  return result;
}
