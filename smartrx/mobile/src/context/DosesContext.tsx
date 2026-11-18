/** The dose schedule. Every change is saved to the vault AND appended to the records log. */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { alertUser, describeNextDose, speak } from '../accessibility';
import { LIMITS } from '../config/env';
import { addRecord, ensureStarted } from '../records';
import { bus } from '../services/eventBus';
import { scheduleDoseAlarm, setupNotifications } from '../services/notifications.service';
import { vault } from '../storage/vault';
import type { Dose, DoseRef, MedicationCandidate } from '../types';
import { useServices } from './ServicesContext';

interface DosesCtx {
  doses: Dose[];
  nextText: string;
  savedAt: string | null;
  markTaken(id?: string): Promise<void>;
  addFromScan(m: MedicationCandidate): Promise<void>;
}

const Ctx = createContext<DosesCtx>(null as unknown as DosesCtx);
export const useDoses = () => useContext(Ctx);

export function DosesProvider({ children }: { children: React.ReactNode }) {
  const svc = useServices();
  const [doses, setDoses] = useState<Dose[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const ref = useRef<Dose[]>([]);

  const persist = useCallback(async (next: Dose[]) => {
    ref.current = next;
    setDoses(next);
    await vault.set('doses', next);
    setSavedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    (async () => {
      await ensureStarted(); // records exist from the very first launch
      const stored = await vault.get<Dose[]>('doses', []);
      // Doses that went unconfirmed while the app was closed are marked missed and recorded with their due time.
      const overdue = stored.filter((d) => d.status === 'pending' && new Date(d.time).getTime() + LIMITS.MISSED_DOSE_GRACE_MS < Date.now());
      for (const d of overdue) await addRecord({ type: 'dose_missed', doseId: d.id, drug: d.drug, ts: new Date(new Date(d.time).getTime() + LIMITS.MISSED_DOSE_GRACE_MS).toISOString() });
      const ids = new Set(overdue.map((d) => d.id));
      ref.current = stored.map((d) => (ids.has(d.id) ? { ...d, status: 'missed' as const } : d));
      setDoses(ref.current);
      if (ids.size) await persist(ref.current);
      else setSavedAt(await vault.lastSaved('doses'));
    })();
    setupNotifications(() => void speak('Dose reminder opened. Say: I took it, when you have taken it.'));
    // The guardian service announces a missed dose; the record itself is written by ServicesContext.
    return bus.on('dose_missed', (d: DoseRef) => void persist(ref.current.map((x) => (x.id === d.id && x.status === 'pending' ? { ...x, status: 'missed' as const } : x))));
  }, [persist]);

  const markTaken = useCallback(
    async (id?: string) => {
      const target =
        ref.current.find((d) => d.id === id) ??
        [...ref.current].filter((d) => d.status === 'pending').sort((a, b) => +new Date(a.time) - +new Date(b.time))[0];
      if (!target) return void (await speak('There is nothing to confirm right now.'));
      await persist(ref.current.map((d) => (d.id === target.id ? { ...d, status: 'taken' as const } : d)));
      await addRecord({ type: 'dose_taken', doseId: target.id, drug: target.drug });
      await svc.guardians.markTaken(target.id);
      svc.link.send({ type: 'dose_taken', doseId: target.id, at: new Date().toISOString() });
      await alertUser('success', `Recorded. ${target.drug} taken.`);
    },
    [persist, svc],
  );

  const addFromScan = useCallback(
    async (m: MedicationCandidate) => {
      // Placeholder scheduling (one hour from now). Show a dose editor before real use.
      const when = new Date(Date.now() + 60 * 60 * 1000);
      const dose: Dose = {
        id: `${m.rxcui}-${when.getTime()}`,
        drug: m.matchedName ?? m.rawText,
        strengthMg: m.strength ? parseFloat(m.strength) : undefined,
        time: when.toISOString(),
        period: when.getHours() < 12 ? 'morning' : when.getHours() < 17 ? 'afternoon' : 'evening',
        status: 'pending',
      };
      await persist([...ref.current, dose]);
      await addRecord({ type: 'dose_added', doseId: dose.id, drug: dose.drug });
      scheduleDoseAlarm(dose);
      void svc.guardians.armMissedDoseEscalation({ id: dose.id, drug: dose.drug, dueAt: dose.time });
      await alertUser('success', `${dose.drug} added to your schedule.`);
    },
    [persist, svc],
  );

  const value = useMemo(() => ({ doses, nextText: describeNextDose(doses), savedAt, markTaken, addFromScan }), [doses, savedAt, markTaken, addFromScan]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
