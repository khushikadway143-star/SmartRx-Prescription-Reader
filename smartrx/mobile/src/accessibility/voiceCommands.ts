/** Maps what the patient says to an app action. */

export type VoiceIntent =
  | 'READ_NEXT_DOSE'
  | 'SCAN_PRESCRIPTION'
  | 'READ_BATTERY'
  | 'SOS'
  | 'CONFIRM_DOSE'
  | 'HELP'
  | 'UNKNOWN';

const COMMANDS: Array<[VoiceIntent, RegExp]> = [
  ['SOS', /\b(emergency|sos|help me now|call (an )?ambulance)\b/i],
  ['READ_NEXT_DOSE', /\b(next|upcoming)\b.*\b(dose|pill|medicine|medication)\b|\bread my (dose|schedule)\b/i],
  ['SCAN_PRESCRIPTION', /\b(scan|read|capture)\b.*\b(prescription|label|medicine|paper)\b/i],
  ['CONFIRM_DOSE', /\b(i (took|have taken)|taken|mark (it )?(as )?(taken|done))\b/i],
  ['READ_BATTERY', /\bbattery\b/i],
  ['HELP', /\b(help|what can (i|you) (say|do)|instructions)\b/i],
];

export function parseVoiceCommand(transcript: string): VoiceIntent {
  for (const [intent, re] of COMMANDS) if (re.test(transcript)) return intent;
  return 'UNKNOWN';
}

export const VOICE_HELP_TEXT =
  'You can say: read my next dose, scan prescription, I took it, battery level, or emergency.';
