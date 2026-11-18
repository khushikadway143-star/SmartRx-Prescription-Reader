/** Playing vibrations and remembering which pattern each alarm slot uses. */
import { Vibration } from 'react-native';
import { isWeb } from './native';
import { DEFAULT_VIBRATION_PREFS, HapticKind, VIBRATION_LIBRARY, VibrationPrefs } from './vibrationLibrary';

let activePrefs: VibrationPrefs = { ...DEFAULT_VIBRATION_PREFS };

/** Called by the settings provider whenever the patient changes a choice. */
export function setVibrationPrefs(p: Partial<VibrationPrefs>): void {
  activePrefs = { ...DEFAULT_VIBRATION_PREFS, ...p };
}

export function getPatternById(id: string): number[] {
  return (VIBRATION_LIBRARY.find((v) => v.id === id) ?? VIBRATION_LIBRARY[0]).pattern;
}

/** Plays a library pattern so the patient can feel it before choosing it. */
export function previewVibration(id: string): void {
  cancelVibration();
  vibratePattern(getPatternById(id));
}

/**
 * Android and web honour the full pattern. iOS ignores pattern durations
 * (fixed ~400 ms buzz), so patterns are distinguishable there by rhythm only.
 * For richer iOS haptics add a Core Haptics bridge (e.g. react-native-haptic-feedback).
 * Safari on iOS has no navigator.vibrate, so web haptics are a no-op there.
 */
export function vibrate(kind: HapticKind): void {
  vibratePattern(getPatternById(activePrefs[kind]));
}

export function vibratePattern(pattern: number[]): void {
  try {
    if (isWeb) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
    } else {
      Vibration.vibrate(pattern);
    }
  } catch {
    /* device without a vibration motor */
  }
}

export function cancelVibration(): void {
  try {
    if (isWeb) navigator.vibrate?.(0);
    else Vibration.cancel();
  } catch {
    /* ignore */
  }
}
