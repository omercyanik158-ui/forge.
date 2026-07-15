import {
  PROGRAM_TEMPLATES,
  type ProgramRequest,
  type TemplateMatchResult,
} from '@/services/templateProgramEngine';
import { filterCompatibleTemplates } from './filterTemplates';

export function scoreTemplate(templateId: string, request: ProgramRequest): TemplateMatchResult | null {
  if (!PROGRAM_TEMPLATES.some((template) => template.id === templateId)) return null;
  const { compatible, rejected } = filterCompatibleTemplates(request);
  return [...compatible, ...rejected].find((match) => match.templateId === templateId) ?? null;
}
