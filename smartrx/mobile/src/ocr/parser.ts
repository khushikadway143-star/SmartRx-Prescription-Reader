import type { OcrLine } from '../types';

const STOPWORDS = new Set(
  'tab tabs tablet tablets cap caps capsule capsules syrup inj injection drops daily once twice thrice after before food meals with water morning night evening noon days day weeks week dose take rx dr patient name date age sig refill'.split(' '),
);

const DOSE_RE = /(\d+(?:\.\d+)?)\s?(mg|mcg|µg|g|ml|iu)\b/i;
// "1-0-1" (morning-noon-night) is the common Indian prescription shorthand.
const FREQ_RE = /\b([0-2]\s?-\s?[0-2]\s?-\s?[0-2](?:\s?-\s?[0-2])?)\b|\b(OD|BD|BID|TDS|TID|QID|HS|SOS|twice daily|once daily|thrice daily)\b/i;

export interface RawCandidate {
  rawText: string;
  strength?: string;
  frequency?: string;
  ocrConfidence: number;
}

export function extractCandidates(lines: OcrLine[], max = 8): RawCandidate[] {
  const seen = new Set<string>();
  const out: RawCandidate[] = [];
  for (const line of lines) {
    const strength = DOSE_RE.exec(line.text)?.[0];
    const frequency = (FREQ_RE.exec(line.text)?.[0] ?? '').replace(/\s/g, '') || undefined;
    for (const tok of line.text.match(/[A-Za-z][A-Za-z-]{3,}/g) ?? []) {
      const key = tok.toLowerCase();
      if (STOPWORDS.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push({ rawText: tok, strength, frequency, ocrConfidence: line.confidence });
    }
  }
  return out.slice(0, max);
}
