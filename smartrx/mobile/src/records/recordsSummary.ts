import type { MonthSummary, RecordEvent } from '../types';
import { getMonthRecords } from './recordsStore';

export function summarize(events: RecordEvent[], month: string): MonthSummary {
  const count = (t: RecordEvent['type']) => events.filter((e) => e.type === t).length;
  const taken = count('dose_taken');
  const missed = count('dose_missed');
  return {
    month,
    taken,
    missed,
    scans: count('scan'),
    sos: count('sos'),
    adherencePct: taken + missed ? Math.round((taken / (taken + missed)) * 100) : null,
  };
}

export async function summarizeMonth(month: string) {
  return summarize(await getMonthRecords(month), month);
}

/** Twelve entries, January to December, for the year view. */
export async function summarizeYear(year: number): Promise<MonthSummary[]> {
  return Promise.all(Array.from({ length: 12 }, (_, i) => summarizeMonth(`${year}-${String(i + 1).padStart(2, '0')}`)));
}

export function sumYear(months: MonthSummary[]): MonthSummary {
  const t = months.reduce((a, m) => ({ ...a, taken: a.taken + m.taken, missed: a.missed + m.missed, scans: a.scans + m.scans, sos: a.sos + m.sos }), { month: 'year', taken: 0, missed: 0, scans: 0, sos: 0, adherencePct: null as number | null });
  return { ...t, adherencePct: t.taken + t.missed ? Math.round((t.taken / (t.taken + t.missed)) * 100) : null };
}
