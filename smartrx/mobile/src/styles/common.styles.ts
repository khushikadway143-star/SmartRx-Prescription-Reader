import { StyleSheet } from 'react-native';
import type { Palette } from '../types';

type FS = (n: number) => number;

/** Shared building blocks. Screen-specific styles live in their own *.styles.ts file. */
export const createCommonStyles = (c: Palette, fs: FS) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: 16, gap: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24, backgroundColor: c.bg },
    h1: { fontWeight: '800', color: c.fg, fontSize: fs(26) },
    h2: { fontWeight: '800', color: c.fg, fontSize: fs(22), marginBottom: 6 },
    body: { color: c.fg, fontSize: fs(18) },
    muted: { color: c.muted, fontSize: fs(18) },
    card: { backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },

    btn: { minHeight: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: c.accent },
    btnDanger: { backgroundColor: c.danger },
    btnText: { fontWeight: '800', textAlign: 'center', color: c.onAccent, fontSize: fs(22) },
    pressed: { opacity: 0.7 },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, gap: 12 },
    rowText: { flex: 1, color: c.fg, fontSize: fs(18) },

    opt: { minHeight: 56, borderRadius: 12, borderWidth: 2, borderColor: c.border, backgroundColor: c.card, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
    optSelected: { borderColor: c.accent, backgroundColor: c.accent },
    optText: { color: c.fg, fontSize: fs(20), fontWeight: '700' },
    optTextSelected: { color: c.onAccent },
    optSub: { color: c.muted, fontSize: fs(16) },
    optSubSelected: { color: c.onAccent },

    pill: { minHeight: 56, minWidth: 88, borderRadius: 12, borderWidth: 2, borderColor: c.accent, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
    pillWide: { minWidth: 120 },
    pillDanger: { borderColor: c.danger },
    pillText: { color: c.fg, fontSize: fs(18), fontWeight: '700' },
    pillTextDanger: { color: c.danger },
  });
