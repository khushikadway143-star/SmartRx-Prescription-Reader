import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { speak } from '../accessibility';
import PillButton from '../components/PillButton';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { describeRecord, getMonthRecords, monthName, speakSummary, summarizeYear, sumYear } from '../records';
import { createCommonStyles } from '../styles/common.styles';
import { createHistoryStyles } from '../styles/history.styles';
import type { MonthSummary, RecordEvent } from '../types';

/** Year selector -> twelve months with totals -> tap a month for the day-by-day log. */
export default function HistoryScreen() {
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createHistoryStyles);
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [events, setEvents] = useState<RecordEvent[]>([]);

  useFocusEffect(
    useCallback(() => {
      summarizeYear(year).then(setMonths);
      setOpen(null);
    }, [year]),
  );

  const toggle = async (month: string) => {
    if (open === month) return setOpen(null);
    setEvents((await getMonthRecords(month)).sort((a, b) => b.ts.localeCompare(a.ts)));
    setOpen(month);
  };

  const total = sumYear(months);
  const hasData = (m: MonthSummary) => m.taken + m.missed + m.scans + m.sos > 0;

  return (
    <SafeAreaView style={c.screen}>
      <ScrollView contentContainerStyle={c.scroll}>
        <View style={s.yearBar}>
          <PillButton label="‹ Prev" a11yLabel={`Go to ${year - 1}`} onPress={() => setYear(year - 1)} />
          <Text style={s.yearText} accessibilityRole="header">{year}</Text>
          <PillButton label="Next ›" a11yLabel={`Go to ${year + 1}`} onPress={() => setYear(year + 1)} />
        </View>

        <View style={c.card}>
          <Text style={c.h2}>Year total</Text>
          <Text style={s.monthStats}>
            {total.taken} taken, {total.missed} missed, {total.scans} scans, {total.sos} SOS
            {total.adherencePct === null ? '' : `. ${total.adherencePct}% on time`}
          </Text>
        </View>

        <View style={c.card}>
          {months.map((m) => {
            const isOpen = open === m.month;
            return (
              <View key={m.month} style={s.month}>
                <Text style={s.monthName} accessibilityRole="header">{monthName(m.month)}</Text>
                <Text style={s.monthStats}>
                  {hasData(m) ? `${m.taken} taken, ${m.missed} missed${m.adherencePct === null ? '' : `, ${m.adherencePct}% on time`}` : 'No records'}
                </Text>
                {m.adherencePct !== null && (
                  <View style={s.bar} accessible={false}>
                    <View style={[s.barFill, m.adherencePct < 80 && s.barFillLow, { width: `${m.adherencePct}%` }]} />
                  </View>
                )}
                {hasData(m) && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <PillButton wide label={isOpen ? 'Hide days' : 'Show days'} a11yLabel={`${isOpen ? 'Hide' : 'Show'} the log for ${monthName(m.month)} ${year}`} onPress={() => void toggle(m.month)} />
                    <PillButton wide label="Read aloud" a11yLabel={`Read ${monthName(m.month)} summary aloud`} onPress={() => void speak(speakSummary(m))} />
                  </View>
                )}
                {isOpen && (events.length ? events.map((e) => (
                  <View key={e.id} style={s.event}>
                    <Text style={s.eventTime}>{new Date(e.ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
                    <Text style={s.eventText}>{describeRecord(e)}</Text>
                  </View>
                )) : <Text style={s.empty}>No events.</Text>)}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
