/**
 * Missed-dose escalation, SOS dispatch and report email.
 * Network calls go through api/backend.api.ts; this class holds the rules.
 */
import { Linking, Platform } from 'react-native';
import { alertUser } from '../accessibility';
import { backendApi } from '../api/backend.api';
import { ENV, LIMITS } from '../config/env';
import type { DoseRef, Guardian } from '../types';
import { bus } from './eventBus';

export interface ManagerConfig {
  patientName: string;
  /** Minimum-necessary rule: keep medicine names out of SMS unless the patient opts in. */
  includeDrugNameInSms: boolean;
  emergencyNumber?: string;
  getLocation?: () => Promise<{ lat: number; lng: number } | null>;
}

export type DeliveryResult = { ok: true; via: 'backend' } | { ok: false; via: 'native-composer' | 'none'; error?: string };

export class GuardianSMSManager {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private cfg: ManagerConfig, private guardians: Guardian[]) {}

  setGuardians(g: Guardian[]) {
    this.guardians = g;
  }
  setIncludeDrugName(v: boolean) {
    this.cfg.includeDrugNameInSms = v;
  }

  /** Backend (Twilio) first. Falls back to the native composer, where the person must tap Send. */
  async sendSms(phones: string[], body: string): Promise<DeliveryResult> {
    if (!phones.length) return { ok: false, via: 'none', error: 'No recipients' };
    try {
      await backendApi.sendSms(phones, body);
      return { ok: true, via: 'backend' };
    } catch (err) {
      try {
        const sep = Platform.OS === 'ios' ? '&' : '?';
        await Linking.openURL(`sms:${phones.join(',')}${sep}body=${encodeURIComponent(body)}`);
        return { ok: false, via: 'native-composer', error: String(err) };
      } catch (err2) {
        return { ok: false, via: 'none', error: String(err2) };
      }
    }
  }

  /**
   * Server holds the authoritative 30-minute timer (survives app kill and dead battery);
   * a local timer is a best-effort fallback because mobile OSes suspend JS timers.
   */
  async armMissedDoseEscalation(dose: DoseRef): Promise<void> {
    const deadlineAt = new Date(new Date(dose.dueAt).getTime() + LIMITS.MISSED_DOSE_GRACE_MS).toISOString();
    const targets = this.guardians.filter((g) => g.notifyOnMissedDose);
    backendApi.createEscalation({ doseId: dose.id, dueAt: dose.dueAt, deadlineAt, guardianIds: targets.map((g) => g.id) }).catch(() => undefined);
    this.disarm(dose.id, false);
    const delay = Math.max(0, new Date(deadlineAt).getTime() - Date.now());
    this.timers.set(dose.id, setTimeout(() => void this.fireMissedDose(dose), delay));
  }

  async markTaken(doseId: string) {
    this.disarm(doseId, true);
  }

  private disarm(doseId: string, notifyServer: boolean) {
    const t = this.timers.get(doseId);
    if (t) clearTimeout(t);
    this.timers.delete(doseId);
    if (notifyServer) backendApi.cancelEscalation(doseId).catch(() => undefined);
  }

  private async fireMissedDose(dose: DoseRef) {
    this.timers.delete(dose.id);
    bus.emit('dose_missed', dose); // records + guardian link + UI listen to this
    const due = new Date(dose.dueAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const what = this.cfg.includeDrugNameInSms ? dose.drug : 'a scheduled medicine';
    await this.sendSms(
      this.guardians.filter((g) => g.notifyOnMissedDose).map((g) => g.phone),
      `SmartRx: ${this.cfg.patientName} has not confirmed ${what} due at ${due}. Please check on them.`,
    );
    await alertUser('critical', 'Your guardians have been told you missed a dose. Please take it now if it is safe to, then say: I took it.');
  }

  async triggerSOS(options: { dial?: boolean } = { dial: true }) {
    bus.emit('sos');
    await alertUser('critical', 'Sending emergency alert.');
    const loc = (await this.cfg.getLocation?.().catch(() => null)) ?? null;
    const where = loc ? ` Location: https://maps.google.com/?q=${loc.lat},${loc.lng}` : ' Location unavailable.';
    const sms = this.sendSms(
      this.guardians.filter((g) => g.notifyOnSOS).map((g) => g.phone),
      `EMERGENCY: ${this.cfg.patientName} pressed SOS in SmartRx.${where}`,
    );
    if (options.dial !== false) await this.dialEmergency();
    await sms;
  }

  dialEmergency() {
    return Linking.openURL(`tel:${this.cfg.emergencyNumber ?? ENV.EMERGENCY_NUMBER}`);
  }

  async sendDailyReport(recipients: string[], s: { date: string; taken: number; missed: number; pending: number }) {
    const total = s.taken + s.missed + s.pending || 1;
    const html = `<h2>Medication report: ${s.date}</h2><p>Patient: ${this.cfg.patientName}</p><p>Taken: ${s.taken} Missed: ${s.missed} Pending: ${s.pending} Adherence: ${Math.round((s.taken / total) * 100)}%</p>`;
    await backendApi.sendEmail(recipients, `SmartRx daily report, ${s.date}`, html);
  }
}
