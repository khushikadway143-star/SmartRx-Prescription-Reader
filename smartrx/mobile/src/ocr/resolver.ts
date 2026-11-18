/**
 * Turns a raw OCR word into a verified medicine: RxNorm fuzzy match, then OpenFDA label check.
 * RxNorm / OpenFDA cover US drugs. Add a local brand->generic table for your market and query it first.
 */
import { fetchLabelWarning } from '../api/openfda.api';
import { approximateTerm, getRxcuiName } from '../api/rxnorm.api';
import { LIMITS } from '../config/env';
import type { MedicationCandidate } from '../types';
import type { RawCandidate } from './parser';

export async function resolveCandidate(c: RawCandidate): Promise<MedicationCandidate | null> {
  const top = (await approximateTerm(c.rawText, 3))[0];
  if (!top?.rxcui) return null;
  const name = (await getRxcuiName(top.rxcui)) ?? c.rawText;
  const score = Number(top.score);
  const fda = await fetchLabelWarning(name.split(' ')[0]).catch(() => ({ verified: false, warning: undefined }));
  return {
    ...c,
    rxcui: top.rxcui,
    matchedName: name,
    matchScore: score,
    warning: fda.warning,
    fdaVerified: fda.verified,
    lowConfidence: score < LIMITS.MATCH_MIN_SCORE || c.ocrConfidence < LIMITS.OCR_MIN_CONF,
  };
}
