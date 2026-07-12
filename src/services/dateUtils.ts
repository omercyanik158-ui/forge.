import { formatRelativeDateLabel, getWeekStartKey } from './localization';

export function dateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function timestampForDateKey(key: string, clock: Date = new Date()): string {
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return clock.toISOString();
  const date = new Date(year, month - 1, day, clock.getHours(), clock.getMinutes(), clock.getSeconds(), clock.getMilliseconds());
  return Number.isNaN(date.getTime()) ? clock.toISOString() : date.toISOString();
}

// Converts an ISO timestamp to a LOCAL calendar-day key.
// Using toISOString().slice(0,10) would yield the UTC day, which drifts from
// the local day near midnight and breaks day-start based resets.
export function localDateKeyFromIso(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return dateKey(date);
}

export function addDays(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function isSameDateKey(isoDate: string, key: string): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return dateKey(date) === key;
}

export function formatDateLabel(key: string): string {
  return formatRelativeDateLabel(key);
}

export function weekStartKey(date: Date = new Date()): string {
  return getWeekStartKey(date);
}
