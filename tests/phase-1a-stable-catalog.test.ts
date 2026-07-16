import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTemplateProgram, createProgramRequestFromAnswers, PROGRAM_TEMPLATES, READ_COMPAT_PROGRAM_TEMPLATES, resolveSavedTemplate } from '@/services/templateProgramEngine';
import { recommendPrograms } from '@/services/programRecommendationEngine';
import { getSearchableExercises } from '@/services/exerciseCatalog';
import type { AIProgramAnswers } from '@/types/aiProgram';

const projectRoot = path.resolve(__dirname, '..');

const runtimeModules = [
  'src/services/templateProgramEngine.ts',
  'src/services/exerciseCatalog.ts',
  'src/workout-programming/progression/progressionUtils.ts',
  'app/ai-program-builder.tsx',
];

const stableTemplateIds = new Set(PROGRAM_TEMPLATES.map((template) => template.id));

const baseAnswers: AIProgramAnswers = {
  mainGoal: 'general_fitness',
  preferredProgramStyle: 'auto',
  trainingDays: 4,
  sessionDurationMin: 45,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'beginner',
  priorityMuscles: [],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

describe('Phase 1A stable production catalog boundaries', () => {
  it('keeps production runtime on the stable 26-template catalog with unique IDs', () => {
    expect(PROGRAM_TEMPLATES).toHaveLength(26);
    expect(new Set(PROGRAM_TEMPLATES.map((template) => template.id)).size).toBe(PROGRAM_TEMPLATES.length);
    expect(PROGRAM_TEMPLATES.every((template) => template.modality !== 'yoga' && template.modality !== 'pilates')).toBe(true);
    expect(READ_COMPAT_PROGRAM_TEMPLATES).toHaveLength(26);
  });

  it('does not keep 300 generated template imports in production runtime modules', () => {
    for (const relativePath of runtimeModules) {
      const source = readFileSync(path.join(projectRoot, relativePath), 'utf8');
      expect(source, relativePath).not.toContain('templates300.generated');
      expect(source, relativePath).not.toContain('exerciseIdMap300');
      expect(source, relativePath).not.toContain('progressionRules300.generated');
      expect(source, relativePath).not.toContain('reviewed_generated');
    }
  });

  it('keeps runtime exercise IDs unique', () => {
    const exerciseIds = getSearchableExercises().map((entry) => entry.exercise.id);
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
  });

  it('returns only stable template IDs from recommendations and deterministic selection', () => {
    const first = recommendPrograms({ answers: baseAnswers });
    const second = recommendPrograms({ answers: baseAnswers });
    expect(first.map((item) => item.templateId)).toEqual(second.map((item) => item.templateId));
    expect(first.length).toBeGreaterThan(0);
    expect(first.every((item) => stableTemplateIds.has(item.templateId))).toBe(true);

    const selection = buildTemplateProgram({
      request: createProgramRequestFromAnswers({ answers: baseAnswers }),
    });
    expect(stableTemplateIds.has(selection.selectedTemplateId)).toBe(true);
  });

  it('keeps unknown legacy template IDs safe without remapping them randomly', () => {
    const seededRequest = createProgramRequestFromAnswers({ answers: baseAnswers });
    const seededPlan = buildTemplateProgram({ request: seededRequest }).plan;
    const legacyPlan = {
      ...seededPlan,
      requestFingerprint: 'mismatched-fingerprint',
      selectedTemplateId: 'legacy-yoga-template',
      selectedTemplateVersion: 1,
    };

    const first = buildTemplateProgram({
      request: seededRequest,
      existingPlan: legacyPlan,
    });
    const second = buildTemplateProgram({
      request: seededRequest,
      existingPlan: legacyPlan,
    });

    expect(first.reusedExisting).toBe(false);
    expect(second.reusedExisting).toBe(false);
    expect(first.selectedTemplateId).not.toBe('legacy-yoga-template');
    expect(second.selectedTemplateId).toBe(first.selectedTemplateId);
    expect(stableTemplateIds.has(first.selectedTemplateId)).toBe(true);
  });

  it('returns explicit unsupported status for removed or unknown saved template IDs', () => {
    expect(resolveSavedTemplate(undefined)).toEqual({ status: 'missing' });
    expect(resolveSavedTemplate('forge_strength_fullbody_beginner_3d_v1').status).toBe('supported');
    expect(resolveSavedTemplate('legacy-yoga-template')).toEqual({
      status: 'unsupported',
      templateId: 'legacy-yoga-template',
    });
  });
});
