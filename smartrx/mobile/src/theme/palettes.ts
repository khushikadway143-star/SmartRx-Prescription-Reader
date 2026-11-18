import type { Palette, TextSize } from '../types';

export const PALETTES: Record<'day' | 'night', Record<'standard' | 'high', Palette>> = {
  day: {
    standard: { bg: '#F2F5F8', fg: '#0A1A2F', muted: '#3B4D63', card: '#FFFFFF', border: '#C7D1DD', accent: '#0B57D0', danger: '#B3261E', onAccent: '#FFFFFF' },
    high: { bg: '#FFFFFF', fg: '#000000', muted: '#1A1A1A', card: '#FFFFFF', border: '#000000', accent: '#003C9E', danger: '#9B0000', onAccent: '#FFFFFF' },
  },
  night: {
    standard: { bg: '#0B1420', fg: '#E8EEF6', muted: '#A9B8CB', card: '#15233A', border: '#2B3E55', accent: '#8AB4FF', danger: '#FF8A80', onAccent: '#0B1420' },
    high: { bg: '#000000', fg: '#FFFFFF', muted: '#E0E0E0', card: '#0D0D0D', border: '#FFFFFF', accent: '#9CC2FF', danger: '#FF7A70', onAccent: '#000000' },
  },
};

export const TEXT_SCALE: Record<TextSize, number> = { normal: 1, large: 1.25, xl: 1.5 };
