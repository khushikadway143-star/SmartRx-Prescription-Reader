import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createCommonStyles } from '../styles/common.styles';

export default function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange(v: boolean): void }) {
  const s = useThemedStyles(createCommonStyles);
  return (
    <View style={s.row} accessible accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onAccessibilityTap={() => onChange(!value)}>
      <Text style={s.rowText}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
