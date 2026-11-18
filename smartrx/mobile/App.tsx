/** Entry point: providers only. Everything else lives in src/. */
import React from 'react';
import BiometricGate from './src/components/BiometricGate';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { DosesProvider } from './src/context/DosesContext';
import { ServicesProvider } from './src/context/ServicesContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AccessibilityProvider>
      <BiometricGate>
        <ServicesProvider>
          <DosesProvider>
            <RootNavigator />
          </DosesProvider>
        </ServicesProvider>
      </BiometricGate>
    </AccessibilityProvider>
  );
}
