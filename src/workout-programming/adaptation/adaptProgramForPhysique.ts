import { FORGE_ADAPTATION_RULES } from '../generated/adaptationRules.generated';
import type { ProgramRequest } from '@/services/templateProgramEngine';
import { normalizePhysiqueFocusAreas, selectPhysiqueFocusAreas } from './physiqueFocusRules';

export function getEligiblePhysiqueFocusMuscles(request: ProgramRequest, compatibleFocusMuscles: readonly string[], maxFocusMuscles: number): string[] {
  const normalized = normalizePhysiqueFocusAreas({
    manualFocusMuscles: request.focusMuscles,
    physiqueFocus: request.physiqueFocus,
  });
  return selectPhysiqueFocusAreas({
    focusAreas: normalized.focusAreas,
    compatibleFocusMuscles,
    maxFocusMuscles,
  }).selected.map((item) => item.muscle);
}

export function getAdaptationRulesForFocus(goal: string, focusMuscle: string) {
  return FORGE_ADAPTATION_RULES.filter((rule) => rule.goal === goal && rule.focusMuscle === focusMuscle);
}
