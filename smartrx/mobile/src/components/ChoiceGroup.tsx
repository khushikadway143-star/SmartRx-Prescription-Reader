import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { speak } from '../accessibility';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createCommonStyles } from '../styles/common.styles';

interface Props<T extends string> {
  label: string;
  options: { v: T; t: string }[];
  value: T;
  onChange(v: T): void;
}

/** A radio group of large tappable options. Announces the choice aloud. */
export default function ChoiceGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  const s = useThemedStyles(createCommonStyles);
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ gap: 8 }}>
      <Text style={s.h2} accessibilityRole="header">{label}</Text>
      {options.map((o) => {
        const sel = o.v === value;
        return (
          <Pressable
            key={o.v}
            onPress={() => {
              onChange(o.v);
              void speak(`${o.t} selected.`);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            accessibilityLabel={o.t}
            style={[s.opt, sel && s.optSelected]}
          >
            <Text style={[s.optText, sel && s.optTextSelected]}>{sel ? '✓ ' : ''}{o.t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
