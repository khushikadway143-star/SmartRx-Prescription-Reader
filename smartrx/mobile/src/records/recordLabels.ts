import type { MonthSummary, RecordEvent } from '../types';

export function describeRecord(e: RecordEvent): string {
  switch (e.type) {
    case 'started': return 'SmartRx records started';
    case 'dose_added': return `Added ${e.drug ?? 'a medicine'} to the schedule`;
    case 'dose_taken': return `Took ${e.drug ?? 'a dose'}`;
    case 'dose_missed': return `Missed ${e.drug ?? 'a dose'}`;
    case 'scan': return `Scanned a prescription${e.detail ? ` (${e.detail})` : ''}`;
    case 'sos': return 'Pressed SOS';
  }
}

export const monthName = (month: string, long = true) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: long ? 'long' : 'short' });
};

export function speakSummary(s: MonthSummary): string {
  if (!s.taken && !s.missed && !s.scans && !s.sos) return `${monthName(s.month)}: no records.`;
  const pct = s.adherencePct === null ? '' : ` Adherence ${s.adherencePct} percent.`;
  return `${monthName(s.month)}: ${s.taken} taken, ${s.missed} missed.${pct}${s.sos ? ` SOS pressed ${s.sos} times.` : ''}`;
}
