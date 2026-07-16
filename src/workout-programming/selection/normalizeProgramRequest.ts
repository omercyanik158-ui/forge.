import {
  createProgramRequestFromAnswers,
  type ProgramRequest,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers, AIProgramPhysiqueSummary } from '@/types/aiProgram';

export type NormalizeProgramRequestInput = {
  userId?: string;
  answers: AIProgramAnswers;
  physiqueSummary?: AIProgramPhysiqueSummary;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
  selectedTemplateId?: string;
};

export function normalizeProgramRequest(input: NormalizeProgramRequestInput): ProgramRequest {
  return createProgramRequestFromAnswers(input);
}
