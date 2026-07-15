import type {
  ProgramValidationResult,
  TemplateEngineResult,
} from '@/services/templateProgramEngine';

export function validateInstantiatedProgram(result: TemplateEngineResult): ProgramValidationResult {
  return result.validation;
}
