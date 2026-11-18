import React from 'react';
import { Pressable, Text } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createCommonStyles } from '../styles/common.styles';

interface Props {
  label: string;
  a11yLabel: string;
  onPress(): void;
  wide?: boolean;
  danger?: boolean;
}

export default function PillButton({ label, a11yLabel, onPress, wide, danger }: Props) {
  const s = useThemedStyles(createCommonStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11yLabel} style={[s.pill, wide && s.pillWide, danger && s.pillDanger]}>
      <Text style={[s.pillText, danger && s.pillTextDanger]}>{label}</Text>
    </Pressable>
  );
}
