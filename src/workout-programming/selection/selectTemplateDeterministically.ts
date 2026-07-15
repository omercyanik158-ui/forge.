import {
  PROGRAM_TEMPLATES,
  type ProgramTemplate,
  type ProgramRequest,
  type TemplateMatchResult,
} from '@/services/templateProgramEngine';
import { filterCompatibleTemplates } from './filterTemplates';

export type DeterministicTemplateSelection = {
  template: ProgramTemplate;
  match: TemplateMatchResult;
  rejected: TemplateMatchResult[];
  compatible: TemplateMatchResult[];
};

export function selectTemplateDeterministically(request: ProgramRequest): DeterministicTemplateSelection {
  const { compatible, rejected } = filterCompatibleTemplates(request);
  let pool = compatible;
  if (request.forceNewVariation && request.previousTemplateId && compatible.length > 1) {
    const alternativePool = compatible.filter((item) => item.templateId !== request.previousTemplateId && item.totalScore >= compatible[0]!.totalScore - 12);
    if (alternativePool.length > 0) pool = alternativePool;
  }
  const match = pool[0];
  if (!match) {
    throw new Error(`No compatible template for normalized request. Rejections: ${rejected.map((item) => `${item.templateId}:${item.rejectionReasons?.join('/')}`).join(', ')}`);
  }
  const template = PROGRAM_TEMPLATES.find((item) => item.id === match.templateId);
  if (!template) throw new Error(`Template ${match.templateId} not found.`);
  return { template, match, rejected, compatible };
}
