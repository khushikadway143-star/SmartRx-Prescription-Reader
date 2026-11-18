/** Unit tests for the pure logic. Run with Jest (`npx jest`). */
declare const jest: any;
jest.mock('../src/storage/vault', () => ({ vault: {} })); // keeps native encryption modules out of the tests

import { describeNextDose } from '../src/accessibility/status';
import { parseVoiceCommand } from '../src/accessibility/voiceCommands';
import { extractCandidates } from '../src/ocr/parser';
import { summarize } from '../src/records/recordsSummary';
import type { Dose, RecordEvent } from '../src/types';

const ev = (type: RecordEvent['type'], i: number): RecordEvent => ({ id: String(i), ts: '2026-10-0' + (i + 1) + 'T08:00:00', type });

test('prescription parser finds drug, strength and 1-0-1 frequency, skipping filler words', () => {
  const [c] = extractCandidates([{ text: 'Tab Amoxicillin 500 mg 1-0-1', confidence: 0.9 }]);
  expect(c.rawText).toBe('Amoxicillin');
  expect(c.strength).toBe('500 mg');
  expect(c.frequency).toBe('1-0-1');
});

test('parser understands BD and removes duplicates', () => {
  const out = extractCandidates([{ text: 'Paracetamol 650mg BD', confidence: 0.8 }, { text: 'paracetamol', confidence: 0.7 }]);
  expect(out.length).toBe(1);
  expect(out[0].frequency).toBe('BD');
});

test('month summary counts doses and computes adherence', () => {
  const s = summarize([ev('dose_taken', 0), ev('dose_taken', 1), ev('dose_missed', 2), ev('scan', 3), ev('sos', 4)], '2026-10');
  expect([s.taken, s.missed, s.scans, s.sos, s.adherencePct]).toEqual([2, 1, 1, 1, 67]);
});

test('month with no doses has null adherence, not 0 or NaN', () => {
  expect(summarize([ev('scan', 0)], '2026-10').adherencePct).toBeNull();
});

test('voice commands map to intents', () => {
  expect(parseVoiceCommand('Read my next dose')).toBe('READ_NEXT_DOSE');
  expect(parseVoiceCommand('scan prescription please')).toBe('SCAN_PRESCRIPTION');
  expect(parseVoiceCommand('I took it')).toBe('CONFIRM_DOSE');
  expect(parseVoiceCommand('this is an emergency')).toBe('SOS');
  expect(parseVoiceCommand('what is the weather')).toBe('UNKNOWN');
});

test('next dose is the earliest pending one in the future', () => {
  const t = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
  const doses: Dose[] = [
    { id: 'b', drug: 'Later', time: t(5), period: 'evening', status: 'pending' },
    { id: 'a', drug: 'Sooner', time: t(1), period: 'morning', status: 'pending' },
    { id: 'c', drug: 'Done', time: t(0.5), period: 'morning', status: 'taken' },
  ];
  expect(describeNextDose(doses)).toContain('Sooner');
  expect(describeNextDose([])).toContain('no more doses');
});
