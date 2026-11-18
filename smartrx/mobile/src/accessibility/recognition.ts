/** Speech-to-text: listens for one utterance. */
import { getVoice, isWeb } from './native';

/** Listens for one utterance and resolves with the transcript ('' on timeout). */
export function listenOnce(lang = 'en-IN', timeoutMs = 8000): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    let cleanup = () => {};
    const finish = (text: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(text.trim());
    };
    const timer = setTimeout(() => finish(''), timeoutMs);

    if (isWeb) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return finish('');
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e: any) => finish(e.results?.[0]?.[0]?.transcript ?? '');
      rec.onerror = rec.onend = () => finish('');
      cleanup = () => rec.stop?.();
      rec.start();
      return;
    }

    const Voice = getVoice();
    Voice.onSpeechResults = (e: { value?: string[] }) => finish(e.value?.[0] ?? '');
    Voice.onSpeechError = () => finish('');
    cleanup = () => {
      Voice.stop().catch(() => undefined);
      Voice.destroy().then(Voice.removeAllListeners).catch(() => undefined);
    };
    Voice.start(lang).catch(() => finish(''));
  });
}
