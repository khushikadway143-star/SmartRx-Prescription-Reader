import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { speak } from '../accessibility';
import BigButton from '../components/BigButton';
import SwitchRow from '../components/SwitchRow';
import { useA11y } from '../context/AccessibilityContext';
import { useDoses } from '../context/DosesContext';
import { useServices } from '../context/ServicesContext';
import { useSosCountdown } from '../hooks/useSosCountdown';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import type { RootStackParamList } from '../navigation/types';
import { createCommonStyles } from '../styles/common.styles';
import { createHomeStyles } from '../styles/home.styles';

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { isDark } = useA11y();
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createHomeStyles);
  const svc = useServices();
  const { nextText, markTaken, savedAt } = useDoses();

  const sos = useSosCountdown(() => void svc.guardians.triggerSOS());
  const listen = useVoiceCommands({ nextText, markTaken: () => markTaken(), onScan: () => navigation.navigate('Scan'), onSos: sos.start });

  return (
    <SafeAreaView style={c.screen}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={c.scroll}>
        <View style={c.card} accessible accessibilityLiveRegion="polite">
          <Text style={c.h2} accessibilityRole="header">Next dose</Text>
          <Text style={s.nextDose}>{nextText}</Text>
        </View>

        {sos.count !== null ? (
          <BigButton danger label={`Emergency alert in ${sos.count}. Tap to cancel`} onPress={sos.cancel} />
        ) : (
          <BigButton danger label="SOS Emergency" hint="Starts a five second countdown, then texts your guardians and calls emergency services" onPress={sos.start} />
        )}

        <BigButton label="Read my next dose" onPress={() => void speak(nextText, { critical: true })} />
        <BigButton label="I took my dose" onPress={() => void markTaken()} />
        <BigButton label="Scan prescription" onPress={() => navigation.navigate('Scan')} />
        <BigButton label="Speak a command" hint="Say read my next dose, scan prescription, or emergency" onPress={() => void listen()} />
        <BigButton label="Call emergency services" onPress={() => void svc.guardians.dialEmergency()} />
        <BigButton label="Settings and records" onPress={() => navigation.navigate('Settings')} />

        <View style={c.card}>
          <Text style={c.h2} accessibilityRole="header">Security and privacy</Text>
          <Text style={s.privacyLine}>Biometric lock: on. Data encrypted with AES-256, key kept in the device secure store.</Text>
          <Text style={s.privacyLine} accessibilityLiveRegion="polite">Last saved: {savedAt ? new Date(savedAt).toLocaleTimeString() : 'nothing saved yet'}</Text>
          <SwitchRow label="Strict privacy mode (no medicine names in texts)" value={svc.strictPrivacy} onChange={svc.setStrictPrivacy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
