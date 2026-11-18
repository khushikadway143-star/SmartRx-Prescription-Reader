import React, { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useA11y } from '../context/AccessibilityContext';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { c, isDark } = useA11y();
  const theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, primary: c.accent, background: c.bg, card: c.card, text: c.fg, border: c.border, notification: c.danger } };
  }, [c, isDark]);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SmartRx Assist' }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Month and year records' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
