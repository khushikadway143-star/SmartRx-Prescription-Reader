import React from 'react';
import { Pressable, Text } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createCommonStyles } from '../styles/common.styles';

interface Props {
  label: string;
  onPress(): void;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
}

export default function BigButton({ label, onPress, hint, danger, disabled }: Props) {
  const s = useThemedStyles(createCommonStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [s.btn, danger && s.btnDanger, (pressed || disabled) && s.pressed]}
    >
      <Text style={s.btnText}>{label}</Text>
    </Pressable>
  );
}
