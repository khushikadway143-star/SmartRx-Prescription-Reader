/** Data only: the patterns patients can choose from, the alarm slots, and the defaults. */
export interface VibrationOption {
  id: string;
  label: string;
  description: string;
  pattern: number[]; // [delay, buzz, pause, buzz, ...] in milliseconds
}

/** Every pattern a patient can pick from. The first four are the original SmartRx defaults. */
export const VIBRATION_LIBRARY: VibrationOption[] = [
  { id: 'double-pulse', label: 'Double pulse', description: 'Two quick buzzes', pattern: [0, 200, 100, 200] },
  { id: 'heavy-rumble', label: 'Heavy rumble', description: 'Two long, strong buzzes', pattern: [0, 500, 200, 500] },
  { id: 'triple-pulse', label: 'Triple pulse', description: 'Three rapid buzzes', pattern: [0, 100, 50, 100, 50, 100] },
  { id: 'single-tap', label: 'Single tap', description: 'One very short buzz', pattern: [0, 50] },
  { id: 'gentle-pulse', label: 'Gentle pulse', description: 'One medium buzz', pattern: [0, 300] },
  { id: 'long-buzz', label: 'Long buzz', description: 'One buzz, about one second', pattern: [0, 1000] },
  { id: 'heartbeat', label: 'Heartbeat', description: 'Two beats, a pause, two beats', pattern: [0, 120, 80, 220, 500, 120, 80, 220] },
  { id: 'rising-wave', label: 'Rising wave', description: 'Four buzzes that get longer', pattern: [0, 100, 100, 200, 100, 300, 100, 400] },
  { id: 'falling-wave', label: 'Falling wave', description: 'Four buzzes that get shorter', pattern: [0, 400, 100, 300, 100, 200, 100, 100] },
  { id: 'steady-beat', label: 'Steady beat', description: 'Five even, short buzzes', pattern: [0, 150, 150, 150, 150, 150, 150, 150, 150, 150] },
  { id: 'persistent', label: 'Persistent alarm', description: 'Five strong buzzes over about five seconds', pattern: [0, 600, 300, 600, 300, 600, 300, 600, 300, 600] },
];

/** The alarm and feedback types a patient can assign a pattern to. */
export const VIBRATION_SLOTS = [
  { key: 'morning', label: 'Morning alarm' },
  { key: 'afternoon', label: 'Afternoon alarm' },
  { key: 'evening', label: 'Evening alarm' },
  { key: 'critical', label: 'Critical alert' },
  { key: 'success', label: 'Confirmation' },
] as const;

export type HapticKind = (typeof VIBRATION_SLOTS)[number]['key'];
export type VibrationPrefs = Record<HapticKind, string>;

export const DEFAULT_VIBRATION_PREFS: VibrationPrefs = {
  morning: 'double-pulse', // high-frequency double pulse
  afternoon: 'gentle-pulse',
  evening: 'heavy-rumble', // sustained heavy rumble
  critical: 'triple-pulse', // rapid triple pulse
  success: 'single-tap', // short single pulse
};
