import { afterEach, describe, expect, it, vi } from 'vitest';
import { FORGE_PROGRAM_TEMPLATES_300 } from '@/workout-programming/generated/templates300.generated';
import { FORGE_CANONICAL_EXERCISES_300 } from '@/workout-programming/generated/exerciseCatalog300.generated';
import { FORGE_PROGRESSION_RULES_300 } from '@/workout-programming/generated/progressionRules300.generated';
import type { ForgeGeneratedExercise } from '@/workout-programming/types/csvWorkoutBrain';
import type { AIProgramAnswers } from '@/types/aiProgram';

const gymEquipment: AIProgramAnswers['equipment'] = ['barbells', 'dumbbells', 'machines', 'cables', 'bench'];

const baseAnswers: AIProgramAnswers = {
  mainGoal: 'general_fitness',
  preferredProgramStyle: 'auto',
  trainingDays: 3,
  sessionDurationMin: 45,
  location: 'gym',
  equipment: gymEquipment,
  experience: 'beginner',
  priorityMuscles: [],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

async function loadEngineWithLibrary(version?: '300') {
  vi.resetModules();
  if (version) {
    process.env.EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION = version;
  } else {
    delete process.env.EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION;
  }
  return import('@/services/templateProgramEngine');
}

describe('FORGE workout library 300 integration', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION;
  });

  it('loads generated library counts from the manifest package', () => {
    const exerciseRows: ForgeGeneratedExercise[] = [];
    for (const template of FORGE_PROGRAM_TEMPLATES_300) {
      for (const workout of template.workouts) {
        exerciseRows.push(...workout.exercises);
      }
    }
    expect(FORGE_PROGRAM_TEMPLATES_300).toHaveLength(300);
    expect(exerciseRows).toHaveLength(6565);
    expect(FORGE_CANONICAL_EXERCISES_300).toHaveLength(127);
    expect(FORGE_PROGRESSION_RULES_300).toHaveLength(7);
  });

  it('validates unique IDs, exercise references, progression rules and prescription types', () => {
    const templateIds = FORGE_PROGRAM_TEMPLATES_300.map((template) => template.templateId);
    const catalogIds = new Set(FORGE_CANONICAL_EXERCISES_300.map((exercise) => exercise.canonicalExerciseId));
    const progressionIds = new Set(FORGE_PROGRESSION_RULES_300.map((rule) => rule.progressionRuleId));
    const supportedPrescriptionTypes = new Set(['reps', 'duration', 'breaths', 'rounds']);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    for (const template of FORGE_PROGRAM_TEMPLATES_300) {
      expect(template.modality).toBeTruthy();
      for (const workout of template.workouts) {
        for (const exercise of workout.exercises) {
          expect(catalogIds.has(exercise.canonicalExerciseId), `${template.templateId}:${exercise.canonicalExerciseId}`).toBe(true);
          expect(progressionIds.has(exercise.progressionRuleId), `${template.templateId}:${exercise.progressionRuleId}`).toBe(true);
          expect(supportedPrescriptionTypes.has(exercise.prescriptionType ?? 'reps')).toBe(true);
        }
      }
    }
  });

  it('selects yoga and pilates as distinct modalities when the 300 library flag is enabled', async () => {
    const engine = await loadEngineWithLibrary('300');
    const yogaRequest = engine.createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        mainGoal: 'yoga',
        location: 'home',
        equipment: ['bodyweight_only'],
        trainingDays: 2,
        sessionDurationMin: 30,
      },
    });
    const pilatesRequest = engine.createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        mainGoal: 'pilates',
        location: 'home',
        equipment: ['bodyweight_only'],
        trainingDays: 2,
        sessionDurationMin: 30,
      },
    });
    const yoga = engine.buildTemplateProgram({ request: yogaRequest });
    const pilates = engine.buildTemplateProgram({ request: pilatesRequest });
    expect(yoga.plan.templateMatchMode).toBe('strict_match');
    expect(pilates.plan.templateMatchMode).toBe('strict_match');
    expect(yoga.effectiveRequest.modality).toBe('yoga');
    expect(pilates.effectiveRequest.modality).toBe('pilates');
    expect(yoga.selectedTemplateId).toContain('yoga');
    expect(pilates.selectedTemplateId).toContain('pilates');
    expect(yoga.requestFingerprint).not.toBe(pilates.requestFingerprint);
  });

  it('does not return yoga for generic general fitness or pilates for home workout', async () => {
    const engine = await loadEngineWithLibrary('300');
    const general = engine.buildTemplateProgram({
      request: engine.createProgramRequestFromAnswers({ answers: baseAnswers }),
    });
    const home = engine.buildTemplateProgram({
      request: engine.createProgramRequestFromAnswers({
        answers: {
          ...baseAnswers,
          mainGoal: 'home_workout',
          location: 'home',
          equipment: ['bodyweight_only', 'pullup_bar'],
          trainingDays: 3,
          sessionDurationMin: 30,
        },
      }),
    });
    expect(general.effectiveRequest.modality).toBe('general_fitness');
    expect(home.effectiveRequest.modality).toBe('home');
    expect(general.selectedTemplateId).not.toContain('yoga');
    expect(home.selectedTemplateId).not.toContain('pilates');
  });

  it('preserves duration and rounds prescriptions in instantiated programs without kilogram targets', async () => {
    const engine = await loadEngineWithLibrary('300');
    const result = engine.buildTemplateProgram({
      request: engine.createProgramRequestFromAnswers({
        answers: {
          ...baseAnswers,
          mainGoal: 'yoga',
          location: 'home',
          equipment: ['bodyweight_only'],
          trainingDays: 2,
          sessionDurationMin: 30,
        },
      }),
    });
    const exercises = result.plan.weeks[0]!.days.flatMap((day) => day.exercises);
    expect(exercises.some((exercise) => exercise.prescriptionType === 'duration')).toBe(true);
    expect(exercises.some((exercise) => exercise.prescriptionType === 'rounds')).toBe(true);
    expect(exercises.every((exercise) => exercise.repLabel.length > 0)).toBe(true);
  });

  it('derives supported builder options from actual 300-template coverage', async () => {
    const engine = await loadEngineWithLibrary('300');
    const yogaOptions = engine.getSupportedProgramOptions({ modality: 'yoga', goal: 'general_fitness', level: 'beginner' });
    const strengthOptions = engine.getSupportedProgramOptions({ modality: 'strength', goal: 'strength', level: 'beginner' });
    expect(yogaOptions.compatibleTemplateCount).toBeGreaterThan(0);
    expect(yogaOptions.supportedSplits).toEqual(['custom']);
    expect(strengthOptions.supportedDayCounts).toContain(2);
  });

  it('keeps the stable 26-template library as the fail-safe default', async () => {
    const engine = await loadEngineWithLibrary();
    expect(engine.WORKOUT_LIBRARY_VERSION).toBe('stable');
    expect(engine.PROGRAM_TEMPLATES).toHaveLength(26);
  });
});
