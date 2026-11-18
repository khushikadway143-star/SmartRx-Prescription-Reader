import { useMemo } from 'react';
import { useA11y } from '../context/AccessibilityContext';
import type { Palette } from '../types';

/** Usage: const s = useThemedStyles(createHomeStyles). Style factories live in src/styles. */
export function useThemedStyles<T>(factory: (c: Palette, fs: (n: number) => number) => T): T {
  const { c, fs } = useA11y();
  return useMemo(() => factory(c, fs), [c, fs, factory]);
}
