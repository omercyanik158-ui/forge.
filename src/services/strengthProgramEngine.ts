import { assembleSessionPlan } from './aiProgramAssemblyEngine';
import { buildProgressionPlan } from './aiProgramProgressionEngine';
import type { AssemblyEngineInput, SessionAssemblyPlan } from '@/types/aiProgramAssembly';
import type { ProgressionEngineInput, ProgressionPlan } from '@/types/aiProgramProgression';

export function assembleStrengthProgram(input: AssemblyEngineInput): SessionAssemblyPlan {
  const assembly = assembleSessionPlan(input);
  return {
    ...assembly,
    selectionNotes: [
      'Strength Programming Engine: günler ana kaldırış, varyasyon ve sınırlı assistance mantığıyla kuruldu.',
      ...assembly.selectionNotes,
    ],
  };
}

export function buildStrengthProgressionPlan(input: ProgressionEngineInput): ProgressionPlan {
  return buildProgressionPlan({
    ...input,
    family: 'strength',
  });
}
