import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ChoiceGroup from '../components/ChoiceGroup';
import RecordsCard from '../components/RecordsCard';
import VibrationPicker from '../components/VibrationPicker';
import { useA11y } from '../context/AccessibilityContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { RootStackParamList } from '../navigation/types';
import { createCommonStyles } from '../styles/common.styles';
import { createSettingsStyles } from '../styles/settings.styles';
import type { TextSize, ThemeMode } from '../types';

export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createSettingsStyles);
  const { themeMode, contrast, textSize, update } = useA11y();

  return (
    <SafeAreaView style={c.screen}>
      <ScrollView contentContainerStyle={c.scroll}>
        <View style={[c.card, s.section]}>
          <Text style={c.h1} accessibilityRole="header">Display</Text>
          <ChoiceGroup<ThemeMode>
            label="Day or night"
            value={themeMode}
            onChange={(v) => update({ themeMode: v })}
            options={[
              { v: 'day', t: 'Day (light background)' },
              { v: 'night', t: 'Night (dark background)' },
              { v: 'auto', t: 'Automatic (follows your phone)' },
            ]}
          />
          <ChoiceGroup<'on' | 'off'>
            label="Contrast"
            value={contrast ? 'on' : 'off'}
            onChange={(v) => update({ contrast: v === 'on' })}
            options={[{ v: 'on', t: 'High contrast' }, { v: 'off', t: 'Standard contrast' }]}
          />
          <ChoiceGroup<TextSize>
            label="Text size"
            value={textSize}
            onChange={(v) => update({ textSize: v })}
            options={[{ v: 'normal', t: 'Normal' }, { v: 'large', t: 'Large' }, { v: 'xl', t: 'Extra large' }]}
          />
        </View>

        <View style={c.card}>
          <VibrationPicker />
        </View>

        <View style={c.card}>
          <RecordsCard onOpen={() => navigation.navigate('History')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
