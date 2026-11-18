import { StyleSheet } from 'react-native';
import type { Palette } from '../types';

export const createHomeStyles = (c: Palette, fs: (n: number) => number) =>
  StyleSheet.create({
    nextDose: { color: c.fg, fontSize: fs(20) },
    privacyLine: { color: c.fg, fontSize: fs(18) },
  });
