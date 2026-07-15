import {
  matchTemplatesWithRelaxation,
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
  matchMode: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  relaxationsApplied: string[];
  strictRejectedTemplates: TemplateMatchResult[];
  existingProgramReuseEligible: boolean;
  newVariationRequested: boolean;
};

export function getTemplateSelectionDebugReport(request: ProgramRequest): TemplateSelectionDebugReport {
  const matches = matchTemplatesWithRelaxation(request);
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
    matchMode: matches.matchMode,
    relaxationsApplied: matches.relaxationsApplied,
    strictRejectedTemplates: matches.strictRejected,
    existingProgramReuseEligible: !request.forceNewVariation && PROGRAM_TEMPLATES.some((template) => template.id === matches.compatible[0]?.templateId),
    newVariationRequested: !!request.forceNewVariation,
  };
}
