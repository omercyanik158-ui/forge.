import {
  loadAIProgramInstances,
  saveAIProgramInstance,
} from '@/services/aiProgramInstanceStore';
import type { ProgramRequest } from '@/services/templateProgramEngine';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { createProgramRequestFingerprint } from '../fingerprint/createProgramRequestFingerprint';

export async function findExistingProgramByFingerprint(request: ProgramRequest): Promise<AIProgramPlan | null> {
  if (request.forceNewVariation) return null;
  const fingerprint = createProgramRequestFingerprint(request);
  const instances = await loadAIProgramInstances();
  return instances.find((plan) =>
    plan.requestFingerprint === fingerprint &&
    plan.requestSnapshot?.userId === request.userId
  ) ?? null;
}

export async function persistValidProgramInstance(plan: AIProgramPlan): Promise<AIProgramPlan[]> {
  if (!plan.validation.isValid) {
    throw new Error(`Invalid program cannot be persisted: ${plan.validation.issues.map((issue) => issue.code).join(', ')}`);
  }
  return saveAIProgramInstance(plan);
}
