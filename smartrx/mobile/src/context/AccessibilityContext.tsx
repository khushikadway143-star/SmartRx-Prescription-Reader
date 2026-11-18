/** Display + vibration preferences, saved in the encrypted vault and shared with every screen. */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_VIBRATION_PREFS, setVibrationPrefs } from '../accessibility';
import { vault } from '../storage/vault';
import { PALETTES, TEXT_SCALE } from '../theme/palettes';
import type { HapticKind, Palette, Prefs } from '../types';

export const DEFAULT_PREFS: Prefs = { themeMode: 'auto', contrast: true, textSize: 'large', vibration: DEFAULT_VIBRATION_PREFS };

export interface A11y extends Prefs {
  isDark: boolean;
  c: Palette;
  fs: (n: number) => number;
  update(patch: Partial<Prefs>): void;
  setVibrationFor(slot: HapticKind, patternId: string): void;
}

const Ctx = createContext<A11y>(null as unknown as A11y);
export const useA11y = () => useContext(Ctx);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const ref = useRef<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    vault.get<Partial<Prefs>>('prefs', {}).then((p) => {
      const merged: Prefs = { ...DEFAULT_PREFS, ...p, vibration: { ...DEFAULT_VIBRATION_PREFS, ...(p.vibration ?? {}) } };
      ref.current = merged;
      setPrefs(merged);
      setVibrationPrefs(merged.vibration);
    });
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setPrefs(next);
    setVibrationPrefs(next.vibration);
    void vault.set('prefs', next);
  }, []);

  const value = useMemo<A11y>(() => {
    const isDark = prefs.themeMode === 'night' || (prefs.themeMode === 'auto' && system === 'dark');
    return {
      ...prefs,
      isDark,
      c: PALETTES[isDark ? 'night' : 'day'][prefs.contrast ? 'high' : 'standard'],
      fs: (n) => Math.round(n * TEXT_SCALE[prefs.textSize]),
      update,
      setVibrationFor: (slot, id) => update({ vibration: { ...ref.current.vibration, [slot]: id } }),
    };
  }, [prefs, system, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
