/** OpenFDA drug label API (safety warnings). */
import { ENV } from '../config/env';
import { HttpError, http } from './http';

export async function fetchLabelWarning(name: string): Promise<{ verified: boolean; warning?: string }> {
  const q = `openfda.brand_name:"${name}" openfda.generic_name:"${name}"`;
  try {
    const r = await http<any>(`${ENV.OPENFDA_LABEL}?search=${encodeURIComponent(q)}&limit=1`);
    const label = r?.results?.[0];
    const text: string | undefined = label?.boxed_warning?.[0] ?? label?.warnings?.[0];
    return { verified: !!label, warning: text?.slice(0, 280) };
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return { verified: false }; // no match
    throw e;
  }
}
