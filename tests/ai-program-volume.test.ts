import { describe, expect, it } from 'vitest';
import { buildSessionVolumeBlueprint, priorityMuscleToBucket } from '@/services/aiProgramVolumeEngine';
import type { VolumeEngineInput } from '@/types/aiProgramVolume';

function baseInput(overrides: Partial<VolumeEngineInput> = {}): VolumeEngineInput {
  return {
    volumeDirection: 'moderate',
    recommendedTrainingDays: 4,
    sessionDurationMin: 60,
    experience: 'intermediate',
    recoveryQuality: 'okay',
    priorityMuscles: [],
    ...overrides,
  };
}

describe('priority muscle bucket mapping', () => {
  it('maps a real muscle to its bucket', () => {
    expect(priorityMuscleToBucket('chest')).toBe('chest');
    expect(priorityMuscleToBucket('shoulders')).toBe('shoulders');
  });

  it('returns null for full body balance (no single bucket)', () => {
    expect(priorityMuscleToBucket('full_body_balance')).toBeNull();
  });
});

describe('volume direction', () => {
  it('keeps conservative direction near minimum effective volume', () => {
    const blueprint = buildSessionVolumeBlueprint(baseInput({ volumeDirection: 'conservative' }));
    const chest = blueprint.targets.find((t) => t.bucket === 'chest')!;
    expect(chest.weeklySets).toBeLessThanOrEqual(chest.band.mav);
    expect(chest.weeklySets).toBeGreaterThanOrEqual(chest.band.mev - 2);
  });

  it('pushes priority muscle toward MRV under specialization', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ volumeDirection: 'specialization', priorityMuscles: ['chest'] }),
    );
    const chest = blueprint.targets.find((t) => t.bucket === 'chest')!;
    expect(chest.isPriority).toBe(true);
    expect(chest.weeklySets).toBeGreaterThan(chest.band.mav);
  });

  it('does not over-allocate non-priority muscles under specialization', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ volumeDirection: 'specialization', priorityMuscles: ['chest'] }),
    );
    const core = blueprint.targets.find((t) => t.bucket === 'core')!;
    expect(core.weeklySets).toBeLessThanOrEqual(core.band.mav + 2);
  });
});

describe('experience and recovery modifiers', () => {
  it('reduces volume for beginners with poor recovery', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ experience: 'beginner', recoveryQuality: 'poor', volumeDirection: 'moderate' }),
    );
    const chest = blueprint.targets.find((t) => t.bucket === 'chest')!;
    // beginner (0.8) * poor (0.8) -> ciddi düşüş
    expect(chest.weeklySets).toBeLessThan(chest.band.mav);
  });

  it('gives advanced lifters extra volume only on priority muscles', () => {
    const intermediate = buildSessionVolumeBlueprint(
      baseInput({ experience: 'intermediate', priorityMuscles: ['quads'] }),
    );
    const advanced = buildSessionVolumeBlueprint(
      baseInput({ experience: 'advanced', priorityMuscles: ['quads'] }),
    );
    const intermediateQuads = intermediate.targets.find((t) => t.bucket === 'quads')!.weeklySets;
    const advancedQuads = advanced.targets.find((t) => t.bucket === 'quads')!.weeklySets;
    expect(advancedQuads).toBeGreaterThanOrEqual(intermediateQuads);

    // non-priority kas advanced bonus almamalı
    const intermediateCore = intermediate.targets.find((t) => t.bucket === 'core')!.weeklySets;
    const advancedCore = advanced.targets.find((t) => t.bucket === 'core')!.weeklySets;
    expect(advancedCore).toBe(intermediateCore);
  });
});

describe('effort ceiling', () => {
  it('sets beginner effort around RIR 2-4', () => {
    const blueprint = buildSessionVolumeBlueprint(baseInput({ experience: 'beginner' }));
    expect(blueprint.effort.rirMin).toBe(2);
    expect(blueprint.effort.rirMax).toBe(4);
  });

  it('raises RIR ceiling under poor recovery', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ experience: 'intermediate', recoveryQuality: 'poor' }),
    );
    expect(blueprint.effort.rirMin).toBe(2);
    expect(blueprint.effort.rirMax).toBe(4);
  });

  it('allows aggressive RIR for advanced lifters with good recovery', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ experience: 'advanced', recoveryQuality: 'great' }),
    );
    expect(blueprint.effort.rirMin).toBe(0);
    expect(blueprint.effort.rirMax).toBe(2);
  });
});

describe('fatigue budget', () => {
  it('scales per-session ceiling to session duration', () => {
    const short = buildSessionVolumeBlueprint(baseInput({ sessionDurationMin: 30 }));
    const long = buildSessionVolumeBlueprint(baseInput({ sessionDurationMin: 75 }));
    expect(short.fatigue.perSessionSetCeiling).toBeLessThan(long.fatigue.perSessionSetCeiling);
    // 60 dk -> ~20 set
    const sixty = buildSessionVolumeBlueprint(baseInput({ sessionDurationMin: 60 }));
    expect(sixty.fatigue.perSessionSetCeiling).toBe(20);
  });

  it('lowers weekly ceiling for beginners', () => {
    const blueprint = buildSessionVolumeBlueprint(baseInput({ experience: 'beginner' }));
    expect(blueprint.fatigue.weeklySetCeiling).toBe(40);
  });

  it('flags when total volume exceeds the weekly ceiling', () => {
    // advanced + great + specialization -> yüksek hacim
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ experience: 'advanced', recoveryQuality: 'great', volumeDirection: 'specialization', priorityMuscles: ['chest', 'quads', 'shoulders'] }),
    );
    const overBudget = blueprint.uncertaintyNotes.some((note) => note.includes('aşıyor'));
    if (blueprint.totalWeeklySets > blueprint.fatigue.weeklySetCeiling) {
      expect(overBudget).toBe(true);
    }
  });
});

describe('blueprint shape', () => {
  it('produces a target for every muscle bucket', () => {
    const blueprint = buildSessionVolumeBlueprint(baseInput());
    const buckets = blueprint.targets.map((t) => t.bucket);
    expect(buckets).toContain('chest');
    expect(buckets).toContain('quads');
    expect(buckets).toContain('core');
    expect(blueprint.targets.length).toBe(10);
  });

  it('carries uncertainty notes per constitution', () => {
    const blueprint = buildSessionVolumeBlueprint(baseInput());
    expect(blueprint.uncertaintyNotes.length).toBeGreaterThan(0);
    expect(blueprint.uncertaintyNotes.some((n) => n.includes('popülasyon ortalamasıdır'))).toBe(true);
  });

  it('gives priority muscles higher frequency', () => {
    const blueprint = buildSessionVolumeBlueprint(
      baseInput({ priorityMuscles: ['chest'], recommendedTrainingDays: 4 }),
    );
    const chest = blueprint.targets.find((t) => t.bucket === 'chest')!;
    const core = blueprint.targets.find((t) => t.bucket === 'core')!;
    expect(chest.frequency).toBeGreaterThan(core.frequency);
  });
});
