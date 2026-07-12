import type { CycleTracking } from '@/types';
import { addDays, dateKey } from './dateUtils';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const DEFAULT_PERIOD_LENGTH_DAYS = 5;
const MIN_CYCLE_LENGTH_DAYS = 21;
const MAX_CYCLE_LENGTH_DAYS = 40;
const MIN_PERIOD_LENGTH_DAYS = 2;
const MAX_PERIOD_LENGTH_DAYS = 10;

export type CyclePhase = 'period' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';

export type CycleTrackingSummary = {
  cycleDay: number;
  currentCycleStartDate: string;
  nextPeriodStartDate: string;
  daysUntilNextPeriod: number;
  fertileWindowStartDate: string;
  fertileWindowEndDate: string;
  ovulationDate: string;
  phase: CyclePhase;
};

function createDefaultCycleTracking(): CycleTracking {
  return {
    lastPeriodStartDate: null,
    cycleLengthDays: DEFAULT_CYCLE_LENGTH_DAYS,
    periodLengthDays: DEFAULT_PERIOD_LENGTH_DAYS,
    updatedAt: new Date().toISOString(),
  };
}

function clampWholeNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}

function normalizeLastPeriodStartDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function normalizeCycleTracking(value: Partial<CycleTracking> | null | undefined): CycleTracking {
  const defaults = createDefaultCycleTracking();
  return {
    lastPeriodStartDate: normalizeLastPeriodStartDate(value?.lastPeriodStartDate),
    cycleLengthDays: clampWholeNumber(
      value?.cycleLengthDays,
      MIN_CYCLE_LENGTH_DAYS,
      MAX_CYCLE_LENGTH_DAYS,
      defaults.cycleLengthDays,
    ),
    periodLengthDays: clampWholeNumber(
      value?.periodLengthDays,
      MIN_PERIOD_LENGTH_DAYS,
      MAX_PERIOD_LENGTH_DAYS,
      defaults.periodLengthDays,
    ),
    updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : defaults.updatedAt,
  };
}

function isCycleTracking(value: unknown): value is CycleTracking {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CycleTracking>;
  return (
    (candidate.lastPeriodStartDate == null || typeof candidate.lastPeriodStartDate === 'string')
    && typeof candidate.updatedAt === 'string'
    && Number.isFinite(Number(candidate.cycleLengthDays))
    && Number.isFinite(Number(candidate.periodLengthDays))
  );
}

function toLocalNoonTimestamp(key: string): number {
  return new Date(`${key}T12:00:00`).getTime();
}

function diffDays(fromKey: string, toKey: string): number {
  const diff = toLocalNoonTimestamp(toKey) - toLocalNoonTimestamp(fromKey);
  return Math.round(diff / 86_400_000);
}

function phaseForCycleDay(
  cycleDay: number,
  periodLengthDays: number,
  fertileWindowStartDay: number,
  ovulationDay: number,
): CyclePhase {
  if (cycleDay <= periodLengthDays) return 'period';
  if (cycleDay === ovulationDay) return 'ovulation';
  if (cycleDay >= fertileWindowStartDay && cycleDay < ovulationDay) return 'fertile';
  if (cycleDay < fertileWindowStartDay) return 'follicular';
  return 'luteal';
}

export async function loadCycleTracking(): Promise<CycleTracking> {
  const fallback = createDefaultCycleTracking();
  const stored = await loadStoredValue<CycleTracking>({
    key: STORAGE_KEYS.cycleTracking,
    fallback,
    validate: isCycleTracking,
  });
  return normalizeCycleTracking(stored);
}

export async function saveCycleTracking(next: Partial<CycleTracking>): Promise<CycleTracking> {
  const current = await loadCycleTracking();
  const normalized = normalizeCycleTracking({
    ...current,
    ...next,
    updatedAt: new Date().toISOString(),
  });
  await saveStoredValue(STORAGE_KEYS.cycleTracking, normalized);
  return normalized;
}

export function summarizeCycleTracking(
  tracking: CycleTracking,
  todayKey = dateKey(),
): CycleTrackingSummary | null {
  const lastPeriodStartDate = normalizeLastPeriodStartDate(tracking.lastPeriodStartDate);
  if (!lastPeriodStartDate) return null;

  const cycleLengthDays = clampWholeNumber(
    tracking.cycleLengthDays,
    MIN_CYCLE_LENGTH_DAYS,
    MAX_CYCLE_LENGTH_DAYS,
    DEFAULT_CYCLE_LENGTH_DAYS,
  );
  const periodLengthDays = clampWholeNumber(
    tracking.periodLengthDays,
    MIN_PERIOD_LENGTH_DAYS,
    MAX_PERIOD_LENGTH_DAYS,
    DEFAULT_PERIOD_LENGTH_DAYS,
  );

  const elapsedDays = Math.max(0, diffDays(lastPeriodStartDate, todayKey));
  const cyclesElapsed = Math.floor(elapsedDays / cycleLengthDays);
  const currentCycleStartDate = addDays(lastPeriodStartDate, cyclesElapsed * cycleLengthDays);
  const cycleDay = (elapsedDays % cycleLengthDays) + 1;
  const nextPeriodStartDate = addDays(currentCycleStartDate, cycleLengthDays);
  const ovulationOffset = Math.max(1, cycleLengthDays - 14);
  const fertileWindowStartOffset = Math.max(periodLengthDays + 1, ovulationOffset - 4);
  const ovulationDate = addDays(currentCycleStartDate, ovulationOffset - 1);
  const fertileWindowStartDate = addDays(currentCycleStartDate, fertileWindowStartOffset - 1);
  const fertileWindowEndDate = addDays(ovulationDate, 1);

  return {
    cycleDay,
    currentCycleStartDate,
    nextPeriodStartDate,
    daysUntilNextPeriod: Math.max(0, diffDays(todayKey, nextPeriodStartDate)),
    fertileWindowStartDate,
    fertileWindowEndDate,
    ovulationDate,
    phase: phaseForCycleDay(cycleDay, periodLengthDays, fertileWindowStartOffset, ovulationOffset),
  };
}

export async function clearCycleTracking(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.cycleTracking);
}
