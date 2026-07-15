import type { ForgePhysiqueFocus } from '@/workout-programming/types/csvWorkoutBrain';

export type CanonicalFocusMuscle =
  | 'upper_chest'
  | 'chest'
  | 'lats'
  | 'upper_back'
  | 'rear_delts'
  | 'side_delts'
  | 'front_delts'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs';

export type PhysiqueFocusSeverity = 'minor' | 'moderate' | 'high';
export type PhysiqueFocusSource = 'physique_analysis' | 'manual_user_choice';

export type PhysiqueFocusArea = {
  muscle: CanonicalFocusMuscle;
  confidence: number;
  severity: PhysiqueFocusSeverity;
  source: PhysiqueFocusSource;
};

export type IgnoredPhysiqueFocusArea = {
  rawMuscle: string;
  reason: 'INVALID_MUSCLE' | 'LOW_CONFIDENCE' | 'TEMPLATE_INCOMPATIBLE' | 'FOCUS_LIMIT';
};

const FOCUS_ORDER: CanonicalFocusMuscle[] = [
  'upper_chest',
  'chest',
  'lats',
  'upper_back',
  'rear_delts',
  'side_delts',
  'front_delts',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
];

const SEVERITY_SCORE: Record<PhysiqueFocusSeverity, number> = {
  high: 3,
  moderate: 2,
  minor: 1,
};

const FOCUS_ALIASES: Record<string, CanonicalFocusMuscle> = {
  upper_chest: 'upper_chest',
  'upper chest': 'upper_chest',
  'üst göğüs': 'upper_chest',
  'ust gogus': 'upper_chest',
  chest: 'chest',
  göğüs: 'chest',
  gogus: 'chest',
  lats: 'lats',
  lat: 'lats',
  kanat: 'lats',
  upper_back: 'upper_back',
  'upper back': 'upper_back',
  'üst sırt': 'upper_back',
  'ust sirt': 'upper_back',
  rear_delts: 'rear_delts',
  rear_delt: 'rear_delts',
  'arka omuz': 'rear_delts',
  side_delts: 'side_delts',
  shoulders: 'side_delts',
  shoulder: 'side_delts',
  'yan omuz': 'side_delts',
  front_delts: 'front_delts',
  'ön omuz': 'front_delts',
  biceps: 'biceps',
  arms: 'biceps',
  triceps: 'triceps',
  quads: 'quads',
  quadriceps: 'quads',
  'ön bacak': 'quads',
  'on bacak': 'quads',
  hamstrings: 'hamstrings',
  hamstring: 'hamstrings',
  'arka bacak': 'hamstrings',
  glutes: 'glutes',
  glute: 'glutes',
  kalça: 'glutes',
  kalca: 'glutes',
  calves: 'calves',
  calf: 'calves',
  baldır: 'calves',
  baldir: 'calves',
  core: 'abs',
  abs: 'abs',
  karın: 'abs',
  karin: 'abs',
};

export function normalizeFocusMuscleValue(value: string): CanonicalFocusMuscle | null {
  return FOCUS_ALIASES[value.trim().toLowerCase().replace(/\s+/g, ' ')] ?? null;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function severityFromPriority(priority?: ForgePhysiqueFocus['priority']): PhysiqueFocusSeverity {
  if (priority === 'high') return 'high';
  if (priority === 'low') return 'minor';
  return 'moderate';
}

export function normalizePhysiqueFocusAreas(input: {
  manualFocusMuscles: string[];
  physiqueFocus: ForgePhysiqueFocus[];
}): { focusAreas: PhysiqueFocusArea[]; ignored: IgnoredPhysiqueFocusArea[] } {
  const ignored: IgnoredPhysiqueFocusArea[] = [];
  const candidates: (PhysiqueFocusArea & { rawMuscle: string })[] = [];

  for (const muscle of input.manualFocusMuscles) {
    const normalized = normalizeFocusMuscleValue(muscle);
    if (!normalized) {
      ignored.push({ rawMuscle: muscle, reason: 'INVALID_MUSCLE' });
      continue;
    }
    candidates.push({ rawMuscle: muscle, muscle: normalized, confidence: 1, severity: 'moderate', source: 'manual_user_choice' });
  }

  for (const focus of input.physiqueFocus) {
    const normalized = normalizeFocusMuscleValue(focus.muscle);
    if (!normalized) {
      ignored.push({ rawMuscle: focus.muscle, reason: 'INVALID_MUSCLE' });
      continue;
    }
    const confidence = clampConfidence(focus.confidence);
    if (confidence < 0.6) {
      ignored.push({ rawMuscle: focus.muscle, reason: 'LOW_CONFIDENCE' });
      continue;
    }
    candidates.push({
      rawMuscle: focus.muscle,
      muscle: normalized,
      confidence,
      severity: severityFromPriority(focus.priority),
      source: 'physique_analysis',
    });
  }

  const byMuscle = new Map<CanonicalFocusMuscle, PhysiqueFocusArea>();
  for (const candidate of candidates) {
    const existing = byMuscle.get(candidate.muscle);
    if (
      !existing
      || (candidate.source === 'manual_user_choice' && existing.source !== 'manual_user_choice')
      || candidate.confidence > existing.confidence
      || (candidate.confidence === existing.confidence && SEVERITY_SCORE[candidate.severity] > SEVERITY_SCORE[existing.severity])
    ) {
      byMuscle.set(candidate.muscle, {
        muscle: candidate.muscle,
        confidence: candidate.confidence,
        severity: candidate.severity,
        source: candidate.source,
      });
    }
  }

  return {
    focusAreas: [...byMuscle.values()].sort((left, right) => {
      if (left.source !== right.source) return left.source === 'manual_user_choice' ? -1 : 1;
      if (right.confidence !== left.confidence) return right.confidence - left.confidence;
      if (SEVERITY_SCORE[right.severity] !== SEVERITY_SCORE[left.severity]) return SEVERITY_SCORE[right.severity] - SEVERITY_SCORE[left.severity];
      return FOCUS_ORDER.indexOf(left.muscle) - FOCUS_ORDER.indexOf(right.muscle);
    }),
    ignored,
  };
}

export function selectPhysiqueFocusAreas(input: {
  focusAreas: PhysiqueFocusArea[];
  compatibleFocusMuscles: readonly string[];
  maxFocusMuscles: number;
}): { selected: PhysiqueFocusArea[]; ignored: IgnoredPhysiqueFocusArea[] } {
  const compatible = new Set(input.compatibleFocusMuscles.map((item) => normalizeFocusMuscleValue(item)).filter((item): item is CanonicalFocusMuscle => item !== null));
  const selected: PhysiqueFocusArea[] = [];
  const ignored: IgnoredPhysiqueFocusArea[] = [];
  for (const area of input.focusAreas) {
    if (!compatible.has(area.muscle)) {
      ignored.push({ rawMuscle: area.muscle, reason: 'TEMPLATE_INCOMPATIBLE' });
      continue;
    }
    if (selected.length >= Math.min(2, input.maxFocusMuscles)) {
      ignored.push({ rawMuscle: area.muscle, reason: 'FOCUS_LIMIT' });
      continue;
    }
    selected.push(area);
  }
  return { selected, ignored };
}

export function focusAreaAllowsVolume(area: PhysiqueFocusArea): boolean {
  return area.source === 'manual_user_choice' || area.confidence >= 0.75;
}
