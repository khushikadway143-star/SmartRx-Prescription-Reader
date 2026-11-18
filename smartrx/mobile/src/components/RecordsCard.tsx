import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { speak } from '../accessibility';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { getStartedAt, monthKey, speakSummary, summarizeMonth, summarizeYear, sumYear } from '../records';
import { createCommonStyles } from '../styles/common.styles';
import { createSettingsStyles } from '../styles/settings.styles';
import type { MonthSummary } from '../types';
import BigButton from './BigButton';
import PillButton from './PillButton';

/** Settings section: records start date, this month and this year at a glance, and a door to the full history. */
export default function RecordsCard({ onOpen }: { onOpen(): void }) {
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createSettingsStyles);
  const [started, setStarted] = useState<string | null>(null);
  const [month, setMonth] = useState<MonthSummary | null>(null);
  const [year, setYear] = useState<MonthSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStartedAt().then(setStarted);
      summarizeMonth(monthKey(new Date())).then(setMonth);
      summarizeYear(new Date().getFullYear()).then((m) => setYear(sumYear(m)));
    }, []),
  );

  const line = (label: string, m: MonthSummary | null) =>
    `${label}: ${m ? `${m.taken} taken, ${m.missed} missed${m.adherencePct === null ? '' : `, ${m.adherencePct}% on time`}` : 'loading'}`;

  return (
    <View style={s.section}>
      <Text style={c.h1} accessibilityRole="header">Records</Text>
      <Text style={c.muted}>Every dose, scan and alert is saved automatically and kept by month and year.</Text>
      <Text style={c.body}>Saving since: {started ? new Date(started).toLocaleDateString() : 'today'}</Text>
      <Text style={s.stat} accessibilityLiveRegion="polite">{line('This month', month)}</Text>
      <Text style={s.stat}>{line('This year', year)}</Text>
      <View style={s.buttons}>
        <PillButton wide label="Read aloud" a11yLabel="Read this month's summary aloud" onPress={() => month && void speak(speakSummary(month))} />
      </View>
      <BigButton label="Open month and year records" onPress={onOpen} />
    </View>
  );
}
