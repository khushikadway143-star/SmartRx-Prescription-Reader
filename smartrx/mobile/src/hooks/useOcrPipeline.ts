/** Image (camera frame or gallery photo) -> text lines -> medicine candidates -> verified results. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { alertUser, speak } from '../accessibility';
import { recognizeEncodedImage, recognizeGray } from '../api/ocr.api';
import { binarizeJpeg } from '../ocr/preprocess';
import { extractCandidates } from '../ocr/parser';
import { resolveCandidate } from '../ocr/resolver';
import { addRecord } from '../records';
import type { MedicationCandidate, OcrLine } from '../types';

export type OcrPhase = 'idle' | 'recognizing' | 'results' | 'error';
export type OcrSource =
  | { kind: 'binary'; bin: Uint8Array; width: number; height: number }
  | { kind: 'gallery'; base64: string; mime: string };

async function readLines(src: OcrSource): Promise<OcrLine[]> {
  if (src.kind === 'binary') return recognizeGray(src.bin, src.width, src.height);
  let decoded: ReturnType<typeof binarizeJpeg> | null = null;
  try {
    decoded = binarizeJpeg(src.base64); // JPEG: same pre-processing as the live camera
  } catch {
    /* PNG / HEIC / WebP: let the server pre-process */
  }
  return decoded ? recognizeGray(decoded.bin, decoded.width, decoded.height) : recognizeEncodedImage(src.base64, src.mime);
}

export function useOcrPipeline() {
  const [phase, setPhase] = useState<OcrPhase>('idle');
  const [results, setResults] = useState<MedicationCandidate[]>([]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (src: OcrSource) => {
    try {
      setPhase('recognizing');
      await speak('Reading. Please wait.', { interrupt: false });
      const cands = extractCandidates(await readLines(src));
      const resolved = (await Promise.all(cands.map((c) => resolveCandidate(c).catch(() => null)))).filter((x): x is MedicationCandidate => !!x);
      if (!mounted.current) return;
      setResults(resolved);
      setPhase('results');
      void addRecord({ type: 'scan', detail: `${resolved.length} found, ${src.kind === 'gallery' ? 'gallery' : 'camera'}` });
      if (!resolved.length) return void (await alertUser('critical', 'I could not recognise any medicine names. Try more light, or a clearer photo.'));
      await alertUser('success', `Found ${resolved.length} possible ${resolved.length === 1 ? 'medicine' : 'medicines'}.`);
      for (const m of resolved) {
        const caution = m.lowConfidence ? ' I am not sure about this one. Check it with your pharmacist.' : '';
        await speak(`${m.matchedName}${m.strength ? `, ${m.strength}` : ''}${m.frequency ? `, ${m.frequency}` : ''}.${caution}`, { interrupt: false });
      }
    } catch {
      if (!mounted.current) return;
      setPhase('error');
      await alertUser('critical', 'Scanning failed. Check your connection and try again.');
    }
  }, []);

  return { phase, results, run, busy: phase === 'recognizing' };
}
