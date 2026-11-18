import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { DEFAULT_VIBRATION_PREFS, VIBRATION_LIBRARY, VIBRATION_SLOTS, previewVibration, speak } from '../accessibility';
import { useA11y } from '../context/AccessibilityContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createCommonStyles } from '../styles/common.styles';
import { createSettingsStyles } from '../styles/settings.styles';
import type { HapticKind } from '../types';
import PillButton from './PillButton';

/** One card per alarm slot; "Change" opens the full pattern list, every pattern can be tried first. */
export default function VibrationPicker() {
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createSettingsStyles);
  const { vibration, setVibrationFor, update } = useA11y();
  const [editing, setEditing] = useState<HapticKind | null>(null);
  const info = (id: string) => VIBRATION_LIBRARY.find((v) => v.id === id) ?? VIBRATION_LIBRARY[0];

  return (
    <View style={s.section}>
      <Text style={c.h1} accessibilityRole="header">Alarm vibrations</Text>
      <Text style={c.muted}>
        Pick how your phone buzzes for each kind of alarm. Choosing a pattern also plays it.
        {Platform.OS === 'ios' ? ' On iPhone every buzz has the same strength, so patterns differ by rhythm.' : ''}
      </Text>

      {VIBRATION_SLOTS.map((slot) => {
        const cur = info(vibration[slot.key]);
        const open = editing === slot.key;
        return (
          <View key={slot.key} style={s.slot}>
            <Text style={s.slotTitle} accessibilityRole="header">{slot.label}</Text>
            <Text style={s.slotCurrent}>{cur.label}: {cur.description}</Text>
            <View style={s.buttons}>
              <PillButton label="Try" a11yLabel={`Try ${cur.label} for ${slot.label}`} onPress={() => previewVibration(cur.id)} />
              <PillButton wide label={open ? 'Done' : 'Change'} a11yLabel={`${open ? 'Close list' : 'Change pattern for'} ${slot.label}`} onPress={() => setEditing(open ? null : slot.key)} />
            </View>

            {open &&
              VIBRATION_LIBRARY.map((o) => {
                const sel = o.id === vibration[slot.key];
                return (
                  <View key={o.id} style={s.optionRow}>
                    <Pressable
                      onPress={() => {
                        setVibrationFor(slot.key, o.id);
                        previewVibration(o.id);
                        void speak(`${o.label} selected for ${slot.label}.`);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: sel }}
                      accessibilityLabel={`${o.label}. ${o.description}`}
                      style={[c.opt, s.optionGrow, sel && c.optSelected]}
                    >
                      <Text style={[c.optText, sel && c.optTextSelected]}>{sel ? '✓ ' : ''}{o.label}</Text>
                      <Text style={[c.optSub, sel && c.optSubSelected]}>{o.description}</Text>
                    </Pressable>
                    <PillButton label="Try" a11yLabel={`Try ${o.label}`} onPress={() => previewVibration(o.id)} />
                  </View>
                );
              })}
          </View>
        );
      })}

      <PillButton
        danger
        wide
        label="Reset to original"
        a11yLabel="Reset all vibrations to the original settings"
        onPress={() => {
          update({ vibration: DEFAULT_VIBRATION_PREFS });
          void speak('Vibrations reset to the original settings.');
        }}
      />
    </View>
  );
}
