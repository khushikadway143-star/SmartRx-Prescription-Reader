/** Text-to-speech (react-native-tts / speechSynthesis) and combined haptic + voice alerts. */
import { AccessibilityInfo } from 'react-native';
import { getTts, isWeb } from './native';
import { vibrate } from './vibration';
import type { HapticKind } from './vibrationLibrary';

export interface SpeakOptions {
  lang?: string; // BCP-47, e.g. 'en-IN', 'hi-IN'
  rate?: number; // 0..1, 0.5 is a comfortable default
  interrupt?: boolean; // stop current speech first
  critical?: boolean; // always speak, even if a system screen reader is running
}

/**
 * Speaks text. If VoiceOver/TalkBack is active, non-critical text is routed to the
 * screen reader as an announcement so two voices never talk over each other.
 * Resolves when speech finishes.
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  const { lang = 'en-IN', rate = 0.5, interrupt = true, critical = false } = opts;
  if (!text?.trim()) return;

  if (!isWeb && !critical && (await AccessibilityInfo.isScreenReaderEnabled())) {
    AccessibilityInfo.announceForAccessibility(text);
    return;
  }

  if (isWeb) {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth) return;
    if (interrupt) synth.cancel();
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.5 + rate; // map 0..1 to 0.5..1.5
      u.onend = u.onerror = () => resolve();
      synth.speak(u);
    });
  }

  const Tts = getTts();
  try {
    if (interrupt) Tts.stop();
    await Tts.setDefaultLanguage(lang).catch(() => undefined);
    await Tts.setDefaultRate(rate);
  } catch {
    /* engine not ready; speak anyway */
  }
  return new Promise((resolve) => {
    const done = () => {
      Tts.removeEventListener('tts-finish', done);
      Tts.removeEventListener('tts-cancel', done);
      resolve();
    };
    Tts.addEventListener('tts-finish', done);
    Tts.addEventListener('tts-cancel', done);
    Tts.speak(text);
  });
}

export function stopSpeaking(): void {
  if (isWeb) window.speechSynthesis?.cancel();
  else getTts().stop();
}

/** Haptic + voice together. Use for anything the person must not miss. */
export async function alertUser(kind: HapticKind, message: string): Promise<void> {
  vibrate(kind);
  await speak(message, { critical: kind === 'critical', interrupt: kind === 'critical' });
}
