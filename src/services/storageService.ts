import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { parseFoodAnalysisResult, parsePhysiqueAnalysisResult } from './aiHubValidation';
import type { AIHubLog, AIHubMode, SaveAIHubLogInput } from '@/types/aiHub';

type AIHubLogRow = {
  id: string;
  type: AIHubMode;
  created_at: string;
  primary_image_uri: string;
  secondary_image_uri: string | null;
  result_json: string;
};

const mediaDirectory = new Directory(Paths.document, 'ai_hub_media');
const databasePromise = SQLite.openDatabaseAsync('ai-hub.db');
let initializationPromise: Promise<void> | null = null;

function createId(type: AIHubMode): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function initializeStorage(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      mediaDirectory.create({ idempotent: true, intermediates: true });
      const database = await databasePromise;
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ai_hub_logs (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('food', 'physique')),
          created_at TEXT NOT NULL,
          primary_image_uri TEXT NOT NULL,
          secondary_image_uri TEXT,
          result_json TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ai_hub_logs_type_date
          ON ai_hub_logs(type, created_at DESC);
      `);
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
}

function persistImage(sourceUri: string, id: string, role: 'primary' | 'secondary'): string {
  const source = new File(sourceUri);
  if (!source.exists) throw new Error('AI_HUB_SOURCE_IMAGE_MISSING');

  const destination = new File(mediaDirectory, `${id}-${role}.jpg`);
  if (destination.exists) destination.delete();
  source.copy(destination);
  return destination.uri;
}

function deleteOwnedFile(uri: string | null | undefined): void {
  if (!uri || !uri.startsWith(mediaDirectory.uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

function rowToLog(row: AIHubLogRow): AIHubLog | null {
  try {
    const parsed = JSON.parse(row.result_json) as unknown;
    if (row.type === 'food') {
      return {
        id: row.id,
        type: 'food',
        createdAt: row.created_at,
        primaryImageUri: row.primary_image_uri,
        result: parseFoodAnalysisResult(parsed),
      };
    }
    return {
      id: row.id,
      type: 'physique',
      createdAt: row.created_at,
      primaryImageUri: row.primary_image_uri || undefined,
      secondaryImageUri: row.secondary_image_uri || undefined,
      result: parsePhysiqueAnalysisResult(parsed),
    };
  } catch {
    return null;
  }
}

export async function saveLog(input: SaveAIHubLogInput): Promise<AIHubLog> {
  await initializeStorage();
  const database = await databasePromise;
  const id = createId(input.type);
  const createdAt = new Date().toISOString();
  let primaryImageUri: string | null = null;
  let secondaryImageUri: string | null = null;

  try {
    if (input.retainMedia) primaryImageUri = persistImage(input.primaryImageUri, id, 'primary');
    if (input.type === 'physique' && input.retainMedia) {
      secondaryImageUri = persistImage(input.secondaryImageUri, id, 'secondary');
    }

    if (input.type === 'food') {
      const result = parseFoodAnalysisResult(input.result);
      await database.runAsync(
        `INSERT INTO ai_hub_logs
          (id, type, created_at, primary_image_uri, secondary_image_uri, result_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id, input.type, createdAt, primaryImageUri ?? '', null, JSON.stringify(result),
      );
      return { id, type: 'food', createdAt, primaryImageUri: primaryImageUri ?? undefined, result };
    }
    const result = parsePhysiqueAnalysisResult(input.result);
    await database.runAsync(
      `INSERT INTO ai_hub_logs
        (id, type, created_at, primary_image_uri, secondary_image_uri, result_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id, input.type, createdAt, primaryImageUri ?? '', secondaryImageUri, JSON.stringify(result),
    );
    return { id, type: 'physique', createdAt, primaryImageUri: primaryImageUri ?? undefined, secondaryImageUri: secondaryImageUri ?? undefined, result };
  } catch (error) {
    deleteOwnedFile(primaryImageUri);
    deleteOwnedFile(secondaryImageUri);
    throw error;
  }
}

export async function getLogs(type?: AIHubMode, limit = 100, offset = 0): Promise<AIHubLog[]> {
  await initializeStorage();
  const database = await databasePromise;
  const safeLimit = Math.min(250, Math.max(1, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const rows = type
    ? await database.getAllAsync<AIHubLogRow>(
        'SELECT * FROM ai_hub_logs WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        type,
        safeLimit,
        safeOffset,
      )
    : await database.getAllAsync<AIHubLogRow>(
        'SELECT * FROM ai_hub_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
        safeLimit,
        safeOffset,
      );

  return rows.map(rowToLog).filter((log): log is AIHubLog => log !== null);
}

export async function deleteLog(id: string): Promise<void> {
  await initializeStorage();
  const database = await databasePromise;
  const row = await database.getFirstAsync<AIHubLogRow>('SELECT * FROM ai_hub_logs WHERE id = ?', id);
  if (!row) return;

  await database.runAsync('DELETE FROM ai_hub_logs WHERE id = ?', id);
  deleteOwnedFile(row.primary_image_uri);
  deleteOwnedFile(row.secondary_image_uri);
}

export async function clearAIHubLogs(): Promise<void> {
  await initializeStorage();
  const database = await databasePromise;
  await database.runAsync('DELETE FROM ai_hub_logs');
  if (mediaDirectory.exists) {
    for (const entry of mediaDirectory.list()) {
      if (entry instanceof File && entry.exists) entry.delete();
    }
  }
}
