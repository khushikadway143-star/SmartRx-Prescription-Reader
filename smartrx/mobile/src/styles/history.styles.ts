import { StyleSheet } from 'react-native';
import type { Palette } from '../types';

export const createHistoryStyles = (c: Palette, fs: (n: number) => number) =>
  StyleSheet.create({
    yearBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    yearText: { color: c.fg, fontSize: fs(30), fontWeight: '800' },
    month: { gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border },
    monthName: { color: c.fg, fontSize: fs(22), fontWeight: '800' },
    monthStats: { color: c.fg, fontSize: fs(18) },
    bar: { height: 10, borderRadius: 5, backgroundColor: c.border, overflow: 'hidden' },
    barFill: { height: 10, backgroundColor: c.accent },
    barFillLow: { backgroundColor: c.danger },
    event: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
    eventTime: { color: c.muted, fontSize: fs(16), width: 92 },
    eventText: { color: c.fg, fontSize: fs(17), flex: 1 },
    empty: { color: c.muted, fontSize: fs(17) },
  });
