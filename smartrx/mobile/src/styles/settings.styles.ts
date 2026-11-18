import { StyleSheet } from 'react-native';
import type { Palette } from '../types';

export const createSettingsStyles = (c: Palette, fs: (n: number) => number) =>
  StyleSheet.create({
    section: { gap: 16 },
    slot: { gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.border },
    slotTitle: { color: c.fg, fontSize: fs(22), fontWeight: '800' },
    slotCurrent: { color: c.fg, fontSize: fs(18) },
    buttons: { flexDirection: 'row', gap: 8 },
    optionRow: { flexDirection: 'row', gap: 8 },
    optionGrow: { flex: 1 },
    stat: { color: c.fg, fontSize: fs(20), fontWeight: '700' },
  });
