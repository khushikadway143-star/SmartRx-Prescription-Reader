import { StyleSheet } from 'react-native';
import type { Palette } from '../types';

/** The scanner sits on top of the camera preview, so its panel uses a fixed dark overlay. */
export const createScannerStyles = (c: Palette, fs: (n: number) => number) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    panel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 12, backgroundColor: 'rgba(10,26,47,0.94)' },
    status: { color: '#fff', fontSize: fs(24), fontWeight: '700', textAlign: 'center' },
    list: { maxHeight: 340 },
    result: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 4 },
    resultTitle: { fontSize: fs(22), fontWeight: '800', color: '#0A1A2F' },
    resultMeta: { fontSize: fs(18), color: '#30425A' },
    warn: { color: '#B3261E', fontSize: fs(18), fontWeight: '700' },
    ghost: { minHeight: 56, borderRadius: 12, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ghostText: { color: '#fff', fontSize: fs(20), fontWeight: '700' },
  });
