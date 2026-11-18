/** AES-256-GCM encrypted key/value storage. The key lives in Keychain / Keystore. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import QuickCrypto from 'react-native-quick-crypto';
import { Buffer } from 'buffer';

const KEY_SERVICE = 'smartrx.vault';

async function getVaultKey(): Promise<Buffer> {
  const existing = await Keychain.getGenericPassword({ service: KEY_SERVICE });
  if (existing) return Buffer.from(existing.password, 'hex');
  const key = Buffer.from(QuickCrypto.randomBytes(32));
  await Keychain.setGenericPassword('vault', key.toString('hex'), {
    service: KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

export const vault = {
  async set(name: string, value: unknown) {
    const key = await getVaultKey();
    const iv = Buffer.from(QuickCrypto.randomBytes(12));
    const c: any = QuickCrypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([c.update(JSON.stringify(value), 'utf8'), c.final()]);
    const blob = Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
    await AsyncStorage.multiSet([[`vault:${name}`, blob], [`vault:${name}:at`, new Date().toISOString()]]);
  },
  async get<T>(name: string, fallback: T): Promise<T> {
    const blob = await AsyncStorage.getItem(`vault:${name}`);
    if (!blob) return fallback;
    try {
      const raw = Buffer.from(blob, 'base64');
      const d: any = QuickCrypto.createDecipheriv('aes-256-gcm', await getVaultKey(), raw.subarray(0, 12));
      d.setAuthTag(raw.subarray(12, 28));
      return JSON.parse(Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8')) as T;
    } catch {
      return fallback; // tampered or key lost
    }
  },
  lastSaved: (name: string) => AsyncStorage.getItem(`vault:${name}:at`),
};
