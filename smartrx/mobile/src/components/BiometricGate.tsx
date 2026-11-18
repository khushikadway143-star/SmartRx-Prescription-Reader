import React, { useCallback, useEffect, useState } from 'react';
import { AppState, SafeAreaView, Text } from 'react-native';
import { alertUser, speak, vibrate } from '../accessibility';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { authenticate } from '../services/biometrics.service';
import { createCommonStyles } from '../styles/common.styles';
import BigButton from './BigButton';

/** Locks the app until fingerprint / face / device PIN succeeds, and re-locks when the app goes to the background. */
export default function BiometricGate({ children }: { children: React.ReactNode }) {
  const s = useThemedStyles(createCommonStyles);
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  const unlock = useCallback(async () => {
    setFailed(false);
    await speak('Please use your fingerprint or face to open SmartRx.');
    const ok = await authenticate('Unlock SmartRx Assist');
    setUnlocked(ok);
    setFailed(!ok);
    if (ok) vibrate('success');
    else await alertUser('critical', 'Could not unlock. Press the button to try again.');
  }, []);

  useEffect(() => {
    void unlock();
    const sub = AppState.addEventListener('change', (st) => st === 'background' && setUnlocked(false));
    return () => sub.remove();
  }, [unlock]);
  useEffect(() => {
    if (!unlocked && AppState.currentState === 'active') void unlock();
  }, [unlocked, unlock]);

  if (unlocked) return <>{children}</>;
  return (
    <SafeAreaView style={s.center}>
      <Text style={s.h1} accessibilityRole="header">SmartRx Assist</Text>
      {failed && <BigButton label="Unlock" hint="Use fingerprint, face or phone PIN" onPress={unlock} />}
    </SafeAreaView>
  );
}
