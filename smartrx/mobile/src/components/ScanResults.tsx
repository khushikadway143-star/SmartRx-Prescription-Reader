import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createScannerStyles } from '../styles/scanner.styles';
import type { MedicationCandidate } from '../types';
import BigButton from './BigButton';

export default function ScanResults({ items, onAdd }: { items: MedicationCandidate[]; onAdd(m: MedicationCandidate): void }) {
  const s = useThemedStyles(createScannerStyles);
  return (
    <FlatList
      data={items}
      style={s.list}
      keyExtractor={(m) => m.rxcui ?? m.rawText}
      renderItem={({ item: m }) => (
        <View style={s.result} accessible accessibilityLabel={`${m.matchedName}. ${m.strength ?? ''} ${m.frequency ?? ''}. ${m.lowConfidence ? 'Low confidence. Verify with pharmacist.' : ''}`}>
          <Text style={s.resultTitle}>{m.matchedName}</Text>
          <Text style={s.resultMeta}>{[m.strength, m.frequency].filter(Boolean).join('   ') || 'No dose found'}</Text>
          {m.lowConfidence && <Text style={s.warn}>Low confidence. Check with your pharmacist.</Text>}
          {m.warning && <Text style={s.resultMeta} numberOfLines={3}>FDA label: {m.warning}</Text>}
          <BigButton label="Add to schedule" onPress={() => onAdd(m)} />
        </View>
      )}
    />
  );
}
