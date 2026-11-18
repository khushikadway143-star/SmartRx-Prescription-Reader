import ReactNativeBiometrics from 'react-native-biometrics';

const bio = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export async function authenticate(promptMessage: string): Promise<boolean> {
  try {
    return (await bio.simplePrompt({ promptMessage })).success;
  } catch {
    return false;
  }
}
