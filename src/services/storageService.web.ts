import { parseFoodAnalysisResult, parsePhysiqueAnalysisResult } from './aiHubValidation';
import type { AIHubLog, AIHubMode, SaveAIHubLogInput } from '@/types/aiHub';

const STORAGE_KEY = '@forge/ai-hub-web-logs';
let memoryLogs: AIHubLog[] = [];

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function readLogs(): AIHubLog[] {
  const persisted = storage()?.getItem(STORAGE_KEY);
  if (!persisted) return memoryLogs;
  try {
    const value = JSON.parse(persisted) as unknown;
    if (!Array.isArray(value)) return [];
    return value.flatMap((item): AIHubLog[] => {
      if (!item || typeof item !== 'object') return [];
      const candidate = item as AIHubLog;
      try {
        if (candidate.type === 'food') return [{ ...candidate, result: parseFoodAnalysisResult(candidate.result) }];
        if (candidate.type === 'physique') return [{ ...candidate, result: parsePhysiqueAnalysisResult(candidate.result) }];
      } catch {
        return [];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function writeLogs(logs: AIHubLog[]): void {
  memoryLogs = logs;
  storage()?.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export async function saveLog(input: SaveAIHubLogInput): Promise<AIHubLog> {
  const id = `${input.type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const log: AIHubLog = input.type === 'food'
    ? { id, type: 'food', createdAt, primaryImageUri: input.retainMedia ? input.primaryImageUri : undefined, result: parseFoodAnalysisResult(input.result) }
    : { id, type: 'physique', createdAt, primaryImageUri: input.retainMedia ? input.primaryImageUri : undefined, secondaryImageUri: input.retainMedia ? input.secondaryImageUri : undefined, result: parsePhysiqueAnalysisResult(input.result) };
  writeLogs([log, ...readLogs()]);
  return log;
}

export async function getLogs(type?: AIHubMode, limit = 100, offset = 0): Promise<AIHubLog[]> {
  const logs = type ? readLogs().filter((log) => log.type === type) : readLogs();
  return logs.slice(Math.max(0, offset), Math.max(0, offset) + Math.max(1, limit));
}

export async function deleteLog(id: string): Promise<void> {
  writeLogs(readLogs().filter((log) => log.id !== id));
}

export async function clearAIHubLogs(): Promise<void> {
  memoryLogs = [];
  storage()?.removeItem(STORAGE_KEY);
}
