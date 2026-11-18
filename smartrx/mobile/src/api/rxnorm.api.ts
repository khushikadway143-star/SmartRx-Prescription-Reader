/** NIH RxNorm REST API. */
import { ENV } from '../config/env';
import { http } from './http';

/** Fuzzy match: tolerates OCR typos. */
export async function approximateTerm(term: string, maxEntries = 3) {
  const r = await http<any>(`${ENV.RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=${maxEntries}`);
  return (r?.approximateGroup?.candidate ?? []) as Array<{ rxcui: string; score: string; rank: string }>;
}

export async function getRxcuiName(rxcui: string): Promise<string | undefined> {
  const r = await http<any>(`${ENV.RXNAV_BASE}/rxcui/${rxcui}/properties.json`);
  return r?.properties?.name;
}

export async function rxcuiByName(name: string): Promise<string[]> {
  const r = await http<any>(`${ENV.RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(name)}`);
  return r?.idGroup?.rxnormId ?? [];
}

let displayNamesCache: string[] | null = null;
/** Full list for autocomplete. Large download: cache it and filter locally. */
export async function getDisplayNames(): Promise<string[]> {
  if (!displayNamesCache) {
    const r = await http<any>(`${ENV.RXNAV_BASE}/displaynames.json`, { timeoutMs: 60000 });
    displayNamesCache = r?.displayTermsList?.term ?? [];
  }
  return displayNamesCache!;
}
