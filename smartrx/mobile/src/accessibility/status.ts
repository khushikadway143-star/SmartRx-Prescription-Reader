/** Spoken descriptions of doses and battery level. */
import { isWeb } from './native';
import type { Dose } from '../types';

export function describeDose(d: Dose): string {
  const when = new Date(d.time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const strength = d.strengthMg ? `, ${d.strengthMg} milligrams` : '';
  return `${d.drug}${strength}, at ${when}.`;
}

export function describeNextDose(doses: Dose[], now = new Date()): string {
  const next = doses
    .filter((d) => d.status === 'pending' && new Date(d.time) >= now)
    .sort((a, b) => +new Date(a.time) - +new Date(b.time))[0];
  return next ? `Your next dose is ${describeDose(next)}` : 'You have no more doses scheduled today.';
}

/** Battery of this device as 0..100, or null when unavailable. */
export async function readBatteryPercent(): Promise<number | null> {
  try {
    if (isWeb) {
      const b = await (navigator as any).getBattery?.();
      return b ? Math.round(b.level * 100) : null;
    }
    const DeviceInfo = require('react-native-device-info').default;
    return Math.round((await DeviceInfo.getBatteryLevel()) * 100);
  } catch {
    return null;
  }
}

export async function describeBattery(label = 'Phone'): Promise<string> {
  const pct = await readBatteryPercent();
  return pct === null ? `${label} battery level is not available.` : `${label} battery is at ${pct} percent.`;
}
