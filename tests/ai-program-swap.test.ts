import { describe, expect, it } from 'vitest';
import { canSwap, getSwapOptions, getSourceExerciseContext } from '@/services/aiProgramSwapService';

describe('swap service', () => {
  it('returns same-pattern alternatives filtered by equipment and pain', () => {
    const options = getSwapOptions({
      exerciseId: 'Barbell_Squat',
      availableEquipment: ['leg_press', 'machines'],
      limitations: ['lower_back'],
    });
    const ids = options.map((o) => o.exerciseId);
    expect(ids).toContain('Leg_Press');
    expect(ids).not.toContain('Front_Barbell_Squat');
  });

  it('marks preferred alternatives for the reported limitation', () => {
    const options = getSwapOptions({
      exerciseId: 'Barbell_Squat',
      availableEquipment: ['leg_press', 'machines'],
      limitations: ['lower_back'],
    });
    const legPress = options.find((o) => o.exerciseId === 'Leg_Press');
    expect(legPress?.isPreferredForLimitation).toBe(true);
  });

  it('provides a why rationale for each option', () => {
    const options = getSwapOptions({
      exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
      availableEquipment: ['dumbbells', 'bench'],
      limitations: ['none'],
    });
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(option.why.length).toBeGreaterThan(0);
      expect(option.displayName.length).toBeGreaterThan(0);
    }
  });

  it('does not suggest upper or lower chest angles for a flat mid-chest press', () => {
    const options = getSwapOptions({
      exerciseId: 'Dumbbell_Bench_Press',
      availableEquipment: ['dumbbells', 'bench'],
      limitations: ['none'],
    });
    const ids = options.map((o) => o.exerciseId);
    expect(ids).not.toContain('Incline_Dumbbell_Press');
    expect(ids).not.toContain('Decline_Dumbbell_Bench_Press');
    expect(options.every((option) => option.targetLabel.length > 0)).toBe(true);
  });

  it('returns empty when no replacement group exists for the pattern', () => {
    const options = getSwapOptions({
      exerciseId: 'Side_Lateral_Raise',
      availableEquipment: ['dumbbells'],
      limitations: ['none'],
    });
    expect(options).toEqual([]);
  });

  it('reports canSwap accurately', () => {
    expect(canSwap({ exerciseId: 'Barbell_Squat', availableEquipment: ['leg_press'], limitations: ['none'] })).toBe(true);
    expect(canSwap({ exerciseId: 'Side_Lateral_Raise', availableEquipment: ['dumbbells'], limitations: ['none'] })).toBe(false);
  });

  it('resolves source exercise context for display', () => {
    const context = getSourceExerciseContext('Barbell_Squat');
    expect(context.displayName.length).toBeGreaterThan(0);
    expect(context.pattern).toBe('squat_pattern');
  });
});

describe('swap pain safety', () => {
  it('never suggests an unsafe replacement for the reported limitation', () => {
    // Barbell_Row lower_back 'avoid'; swap from Seated_Cable_Rows should not suggest barbell row
    const options = getSwapOptions({
      exerciseId: 'Seated_Cable_Rows',
      availableEquipment: ['cables', 'barbells'],
      limitations: ['lower_back'],
    });
    const ids = options.map((o) => o.exerciseId);
    expect(ids).not.toContain('Bent_Over_Barbell_Row');
  });

  it('keeps back-safe alternatives when lower back pain is reported', () => {
    const options = getSwapOptions({
      exerciseId: 'Bent_Over_Barbell_Row',
      availableEquipment: ['cables'],
      limitations: ['lower_back'],
    });
    // barbell row'un replacement grubu row ailesi; cable row preferred kalır
    const ids = options.map((o) => o.exerciseId);
    expect(ids).toContain('Seated_Cable_Rows');
  });
});
