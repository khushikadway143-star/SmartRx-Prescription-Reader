/**
 * Append-only record log, saved from the very first launch.
 * Events are stored per month ('records:YYYY-MM') inside the encrypted vault,
 * plus an index of months that have data. Nothing is ever deleted automatically.
 */
import { vault } from '../storage/vault';
import type { RecordEvent } from '../types';

export type NewRecord = Omit<RecordEvent, 'id' | 'ts'> & { ts?: string };

export const monthKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};

let queue: Promise<unknown> = Promise.resolve(); // serialise writes so two events never overwrite each other

export function addRecord(input: NewRecord): Promise<RecordEvent> {
  const rec: RecordEvent = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...input, ts: input.ts ?? new Date().toISOString() };
  const done = queue.then(async () => {
    const mk = monthKey(rec.ts);
    const events = await vault.get<RecordEvent[]>(`records:${mk}`, []);
    events.push(rec);
    await vault.set(`records:${mk}`, events);
    const index = await vault.get<string[]>('records:index', []);
    if (!index.includes(mk)) await vault.set('records:index', [...index, mk].sort());
  });
  queue = done.catch(() => undefined);
  return done.then(() => rec);
}

export const getMonthRecords = (month: string) => vault.get<RecordEvent[]>(`records:${month}`, []);
export const listMonths = () => vault.get<string[]>('records:index', []);

/** Writes a 'started' record exactly once, so the first-launch date is always known. */
export async function ensureStarted(): Promise<string> {
  const existing = await vault.get<string | null>('records:startedAt', null);
  if (existing) return existing;
  const rec = await addRecord({ type: 'started' });
  await vault.set('records:startedAt', rec.ts);
  return rec.ts;
}
export const getStartedAt = () => vault.get<string | null>('records:startedAt', null);
