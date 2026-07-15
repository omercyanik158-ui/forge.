import { FORGE_ADAPTATION_RULES } from '../generated/adaptationRules.generated';
import type { ProgramRequest } from '@/services/templateProgramEngine';

export function getEligiblePhysiqueFocusMuscles(request: ProgramRequest, compatibleFocusMuscles: readonly string[], maxFocusMuscles: number): string[] {
  const seen = new Set<string>();
  return [
    ...request.physiqueFocus
      .filter((item) => item.confidence >= 0.6)
      .map((item) => item.muscle),
    ...request.focusMuscles,
  ]
    .filter((muscle) => compatibleFocusMuscles.includes(muscle))
    .filter((muscle) => {
      if (seen.has(muscle)) return false;
      seen.add(muscle);
      return true;
    })
    .slice(0, maxFocusMuscles);
}

export function getAdaptationRulesForFocus(goal: string, focusMuscle: string) {
  return FORGE_ADAPTATION_RULES.filter((rule) => rule.goal === goal && rule.focusMuscle === focusMuscle);
}
