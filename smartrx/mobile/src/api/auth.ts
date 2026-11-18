import * as Keychain from 'react-native-keychain';

export const getAuthToken = async (): Promise<string> =>
  (await Keychain.getGenericPassword({ service: 'smartrx.auth' }))?.password ?? '';
