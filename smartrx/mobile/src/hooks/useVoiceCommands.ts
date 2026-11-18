import { describeBattery, listenOnce, parseVoiceCommand, speak, VOICE_HELP_TEXT, vibrate } from '../accessibility';

interface Actions {
  nextText: string;
  markTaken(): Promise<void>;
  onScan(): void;
  onSos(): void;
}

/** Returns a function that listens once and runs the matching action. */
export function useVoiceCommands(a: Actions) {
  return async () => {
    vibrate('success');
    await speak('Listening.', { critical: true });
    const heard = await listenOnce();
    switch (parseVoiceCommand(heard)) {
      case 'READ_NEXT_DOSE': return speak(a.nextText, { critical: true });
      case 'SCAN_PRESCRIPTION': return a.onScan();
      case 'CONFIRM_DOSE': return a.markTaken();
      case 'READ_BATTERY': return speak(await describeBattery('Phone'), { critical: true });
      case 'SOS': return a.onSos();
      case 'HELP': return speak(VOICE_HELP_TEXT, { critical: true });
      default:
        return speak(heard ? `I did not understand "${heard}". ${VOICE_HELP_TEXT}` : 'I did not hear anything. Try again.', { critical: true });
    }
  };
}
