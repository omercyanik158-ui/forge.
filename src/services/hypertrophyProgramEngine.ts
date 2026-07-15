import { assembleSessionPlan } from './aiProgramAssemblyEngine';
import { buildProgressionPlan } from './aiProgramProgressionEngine';
import type { AssemblyEngineInput, SessionAssemblyPlan } from '@/types/aiProgramAssembly';
import type { ProgressionEngineInput, ProgressionPlan } from '@/types/aiProgramProgression';

export function assembleHypertrophyProgram(input: AssemblyEngineInput): SessionAssemblyPlan {
  const assembly = assembleSessionPlan(input);
  return {
    ...assembly,
    selectionNotes: [
      'Hypertrophy Programming Engine: öncelik kas blokları, bölgesel kapsama ve kaliteli haftalık set mantığıyla kuruldu.',
      ...assembly.selectionNotes,
    ],
  };
}

export function buildHypertrophyProgressionPlan(input: ProgressionEngineInput): ProgressionPlan {
  return buildProgressionPlan({
    ...input,
    family: input.family ?? 'hypertrophy',
  });
}
