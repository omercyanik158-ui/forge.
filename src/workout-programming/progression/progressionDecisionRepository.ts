import type {
  AppliedProgressionDecision,
  ExerciseProgressionState,
} from '@/types/aiProgramProgression';
import { loadStoredValue, removeStoredValue, saveStoredValue } from '@/services/safeStorage';
import { STORAGE_KEYS } from '@/services/storageRegistry';

export type ProgressionPersistenceSnapshot = {
  decisions: AppliedProgressionDecision[];
  states: ExerciseProgressionState[];
};

function isDecision(value: unknown): value is AppliedProgressionDecision {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AppliedProgressionDecision>;
  return (
    typeof candidate.decisionId === 'string' &&
    typeof candidate.progressionFingerprint === 'string' &&
    typeof candidate.programId === 'string' &&
    typeof candidate.exerciseId === 'string' &&
    !!candidate.previousState &&
    !!candidate.nextState &&
    !!candidate.decision
  );
}

function isState(value: unknown): value is ExerciseProgressionState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<ExerciseProgressionState>;
  return (
    typeof candidate.programId === 'string' &&
    typeof candidate.exerciseId === 'string' &&
    typeof candidate.ruleId === 'string' &&
    typeof candidate.targetSets === 'number' &&
    typeof candidate.targetReps === 'number'
  );
}

function isSnapshot(value: unknown): value is ProgressionPersistenceSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<ProgressionPersistenceSnapshot>;
  return (
    Array.isArray(candidate.decisions) &&
    Array.isArray(candidate.states) &&
    candidate.decisions.every(isDecision) &&
    candidate.states.every(isState)
  );
}

async function loadSnapshot(): Promise<ProgressionPersistenceSnapshot> {
  return loadStoredValue({
    key: STORAGE_KEYS.progressionDecisions,
    fallback: { decisions: [], states: [] },
    validate: isSnapshot,
  });
}

async function saveSnapshot(snapshot: ProgressionPersistenceSnapshot): Promise<ProgressionPersistenceSnapshot> {
  await saveStoredValue(STORAGE_KEYS.progressionDecisions, snapshot);
  return snapshot;
}

export async function loadProgressionDecisions(): Promise<AppliedProgressionDecision[]> {
  return (await loadSnapshot()).decisions;
}

export async function loadProgressionStates(): Promise<ExerciseProgressionState[]> {
  return (await loadSnapshot()).states;
}

export async function findProgressionDecisionByFingerprint(fingerprint: string): Promise<AppliedProgressionDecision | null> {
  const snapshot = await loadSnapshot();
  return snapshot.decisions.find((item) => item.progressionFingerprint === fingerprint) ?? null;
}

export async function loadExerciseProgressionState(programId: string, exerciseId: string): Promise<ExerciseProgressionState | null> {
  const snapshot = await loadSnapshot();
  return snapshot.states.find((item) => item.programId === programId && item.exerciseId === exerciseId) ?? null;
}

export async function persistProgressionDecision(decision: AppliedProgressionDecision): Promise<AppliedProgressionDecision> {
  if (!decision.validation.valid) {
    throw new Error(`Invalid progression decision cannot be persisted: ${decision.validation.errors.join(', ')}`);
  }
  const snapshot = await loadSnapshot();
  const existing = snapshot.decisions.find((item) => item.progressionFingerprint === decision.progressionFingerprint);
  if (existing) return { ...existing, reusedExisting: true };
  const persisted: AppliedProgressionDecision = {
    ...decision,
    persistedAt: new Date().toISOString(),
  };
  const decisions = [persisted, ...snapshot.decisions];
  const states = [
    { ...persisted.nextState, lastProcessedSessionId: persisted.sessionId, updatedAt: persisted.persistedAt },
    ...snapshot.states.filter((item) => !(item.programId === persisted.programId && item.exerciseId === persisted.exerciseId)),
  ];
  await saveSnapshot({ decisions, states });
  return persisted;
}

export async function clearProgressionDecisions(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.progressionDecisions);
}
