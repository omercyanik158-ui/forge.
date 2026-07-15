import {
  matchTemplates,
  PROGRAM_TEMPLATES,
  type ProgramRequest,
  type TemplateMatchResult,
} from '@/services/templateProgramEngine';
import { createProgramRequestFingerprint } from '../fingerprint/createProgramRequestFingerprint';

export type TemplateSelectionDebugReport = {
  request: ProgramRequest;
  fingerprint: string;
  compatibleTemplates: TemplateMatchResult[];
  rejectedTemplates: TemplateMatchResult[];
  selectedTemplateId?: string;
  existingProgramReuseEligible: boolean;
  newVariationRequested: boolean;
};

export function getTemplateSelectionDebugReport(request: ProgramRequest): TemplateSelectionDebugReport {
  const matches = matchTemplates(request);
  return {
    request: {
      ...request,
      availableEquipment: [...request.availableEquipment],
      focusMuscles: [...request.focusMuscles],
      physiqueFocus: [...request.physiqueFocus],
      restrictedExerciseIds: [...request.restrictedExerciseIds],
      limitations: [...request.limitations],
    },
    fingerprint: createProgramRequestFingerprint(request),
    compatibleTemplates: matches.compatible,
    rejectedTemplates: matches.rejected,
    selectedTemplateId: matches.compatible[0]?.templateId,
    existingProgramReuseEligible: !request.forceNewVariation && PROGRAM_TEMPLATES.some((template) => template.id === matches.compatible[0]?.templateId),
    newVariationRequested: !!request.forceNewVariation,
  };
}
