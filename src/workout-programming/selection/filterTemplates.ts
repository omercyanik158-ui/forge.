import {
  matchTemplates,
  type ProgramRequest,
  type TemplateMatchResult,
} from '@/services/templateProgramEngine';

export type FilterTemplatesResult = {
  compatible: TemplateMatchResult[];
  rejected: TemplateMatchResult[];
};

export function filterCompatibleTemplates(request: ProgramRequest): FilterTemplatesResult {
  return matchTemplates(request);
}
