/** Guardian SMS manager + realtime link, and the bridge that turns their events into saved records. */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthToken } from '../api/auth';
import { ENV } from '../config/env';
import { addRecord } from '../records';
import { bus } from '../services/eventBus';
import { GuardianLink } from '../services/guardianLink.service';
import { GuardianSMSManager } from '../services/guardianSms.service';
import { getLocation } from '../services/location.service';
import { vault } from '../storage/vault';
import type { DoseRef, Guardian } from '../types';

interface Services {
  guardians: GuardianSMSManager;
  link: GuardianLink;
  strictPrivacy: boolean;
  setStrictPrivacy(v: boolean): void;
}

const Ctx = createContext<Services>(null as unknown as Services);
export const useServices = () => useContext(Ctx);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [strict, setStrict] = useState(true);
  const manager = useMemo(() => new GuardianSMSManager({ patientName: 'Patient', includeDrugNameInSms: false, getLocation }, []), []);
  const link = useMemo(() => new GuardianLink(ENV.WS_URL, getAuthToken), []);

  useEffect(() => {
    vault.get<Guardian[]>('guardians', []).then((g) => manager.setGuardians(g));
    vault.get<boolean>('strictPrivacy', true).then((v) => {
      setStrict(v);
      manager.setIncludeDrugName(!v);
    });
    void link.connect();
    const offMissed = bus.on('dose_missed', (d: DoseRef) => {
      void addRecord({ type: 'dose_missed', doseId: d.id, drug: d.drug });
      link.send({ type: 'dose_missed', doseId: d.id, at: new Date().toISOString() });
    });
    const offSos = bus.on('sos', () => {
      void addRecord({ type: 'sos' });
      link.send({ type: 'sos', at: new Date().toISOString() });
    });
    return () => {
      offMissed();
      offSos();
      link.close();
    };
  }, [manager, link]);

  const value = useMemo<Services>(
    () => ({
      guardians: manager,
      link,
      strictPrivacy: strict,
      setStrictPrivacy: (v) => {
        setStrict(v);
        manager.setIncludeDrugName(!v);
        void vault.set('strictPrivacy', v);
      },
    }),
    [manager, link, strict],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
