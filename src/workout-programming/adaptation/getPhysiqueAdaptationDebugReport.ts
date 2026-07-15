import {
  buildTemplateProgram,
  type ProgramRequest,
  type TemplateEngineResult,
} from '@/services/templateProgramEngine';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { normalizePhysiqueFocusAreas, selectPhysiqueFocusAreas, type PhysiqueFocusArea } from './physiqueFocusRules';

export type PhysiqueAdaptationProposal = {
  currentProgramId: string;
  adaptationFingerprint: string;
  selectedFocusAreas: PhysiqueFocusArea[];
  proposedChanges: NonNullable<AIProgramPlan['appliedAdaptations']>;
  estimatedWeeklySetDelta: number;
  affectedWorkoutDays: string[];
  warnings: string[];
  requiresConfirmation: true;
};

export type PhysiqueAdaptationDebugReport = {
  rawFocusInput: ProgramRequest['physiqueFocus'];
  normalizedFocusInput: PhysiqueFocusArea[];
  selectedFocusAreas: PhysiqueFocusArea[];
  ignoredFocusAreas: TemplateEngineResult['ignoredPhysiqueFocus'];
  adaptationFingerprint?: string;
  appliedAdaptations: TemplateEngineResult['adaptations'];
  weeklySetDelta: number;
  validation: TemplateEngineResult['validation'];
  reusedExisting: boolean;
};

export function getPhysiqueAdaptationDebugReport(input: {
  request: ProgramRequest;
  existingPlan?: AIProgramPlan | null;
}): PhysiqueAdaptationDebugReport {
  const normalized = normalizePhysiqueFocusAreas({
    manualFocusMuscles: input.request.focusMuscles,
    physiqueFocus: input.request.physiqueFocus,
  });
  const result = buildTemplateProgram({ request: input.request, existingPlan: input.existingPlan });
  return {
    rawFocusInput: input.request.physiqueFocus,
    normalizedFocusInput: normalized.focusAreas,
    selectedFocusAreas: result.adaptations
      .filter((item) => item.focusMuscle)
      .map((item) => item.focusMuscle!)
      .filter((muscle, index, list) => list.indexOf(muscle) === index)
      .map((muscle) => normalized.focusAreas.find((area) => area.muscle === muscle))
      .filter((area): area is PhysiqueFocusArea => !!area),
    ignoredFocusAreas: result.ignoredPhysiqueFocus,
    adaptationFingerprint: result.adaptationFingerprint,
    appliedAdaptations: result.adaptations,
    weeklySetDelta: result.adaptations.reduce((sum, item) => sum + (item.type === 'volume_added' ? (item.setsChanged ?? 0) : 0), 0),
    validation: result.validation,
    reusedExisting: result.reusedExisting,
  };
}

export function createPhysiqueAdaptationProposal(input: {
  currentProgram: AIProgramPlan;
  request: ProgramRequest;
}): PhysiqueAdaptationProposal {
  const result = buildTemplateProgram({ request: input.request });
  const selected = normalizePhysiqueFocusAreas({
    manualFocusMuscles: input.request.focusMuscles,
    physiqueFocus: input.request.physiqueFocus,
  });
  const compatibleFocusMuscles = input.currentProgram.requestSnapshot?.focusMuscles ?? input.request.focusMuscles;
  const selectedFocusAreas = selectPhysiqueFocusAreas({
    focusAreas: selected.focusAreas,
    compatibleFocusMuscles,
    maxFocusMuscles: 2,
  }).selected;
  return {
    currentProgramId: input.currentProgram.id,
    adaptationFingerprint: result.adaptationFingerprint ?? '',
    selectedFocusAreas,
    proposedChanges: result.adaptations,
    estimatedWeeklySetDelta: result.adaptations.reduce((sum, item) => sum + (item.type === 'volume_added' ? (item.setsChanged ?? 0) : 0), 0),
    affectedWorkoutDays: [...new Set(result.adaptations.map((item) => item.dayIndex).filter((dayIndex): dayIndex is number => typeof dayIndex === 'number').map((dayIndex) => String(dayIndex)))],
    warnings: result.validation.warnings.map((item) => item.message),
    requiresConfirmation: true,
  };
}

