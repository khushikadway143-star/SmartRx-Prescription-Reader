export type { HapticKind, VibrationPrefs } from '../accessibility/vibrationLibrary';
import type { VibrationPrefs } from '../accessibility/vibrationLibrary';

export interface Dose {
  id: string;
  drug: string;
  strengthMg?: number;
  time: string; // ISO 8601
  period: 'morning' | 'afternoon' | 'evening';
  critical?: boolean;
  status: 'pending' | 'taken' | 'missed';
}

export interface DoseRef {
  id: string;
  drug: string;
  dueAt: string; // ISO
}

export interface Guardian {
  id: string;
  name: string;
  phone: string; // E.164
  email?: string;
  notifyOnMissedDose: boolean;
  notifyOnSOS: boolean;
}

export interface OcrLine {
  text: string;
  confidence: number;
}

export interface MedicationCandidate {
  rawText: string;
  strength?: string;
  frequency?: string;
  ocrConfidence: number;
  rxcui?: string;
  matchedName?: string;
  matchScore?: number;
  warning?: string;
  fdaVerified: boolean;
  lowConfidence: boolean;
}

/* ---- records ---- */
export type RecordType = 'started' | 'dose_added' | 'dose_taken' | 'dose_missed' | 'scan' | 'sos';

export interface RecordEvent {
  id: string;
  ts: string; // ISO timestamp
  type: RecordType;
  doseId?: string;
  drug?: string;
  detail?: string;
}

export interface MonthSummary {
  month: string; // 'YYYY-MM'
  taken: number;
  missed: number;
  scans: number;
  sos: number;
  adherencePct: number | null; // null when no doses were due
}

/* ---- preferences ---- */
export type ThemeMode = 'day' | 'night' | 'auto';
export type TextSize = 'normal' | 'large' | 'xl';

export interface Prefs {
  themeMode: ThemeMode;
  contrast: boolean;
  textSize: TextSize;
  vibration: VibrationPrefs;
}

export interface Palette {
  bg: string;
  fg: string;
  muted: string;
  card: string;
  border: string;
  accent: string;
  danger: string;
  onAccent: string;
}
