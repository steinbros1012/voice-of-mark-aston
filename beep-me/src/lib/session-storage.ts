import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Session storage for Supabase Auth, following Supabase's recommended
 * "LargeSecureStore": the session JSON is too large for the device keychain
 * on its own, so it is AES-256-CTR encrypted with a per-key random key that
 * lives in the keychain (expo-secure-store), while the ciphertext lives in
 * AsyncStorage. Without the keychain key the stored session is useless.
 */
export class LargeSecureStore {
  private async encryptionKey(key: string, create: boolean): Promise<Uint8Array | null> {
    const name = `sk_${key}`;
    const existing = await SecureStore.getItemAsync(name);
    if (existing) return aesjs.utils.hex.toBytes(existing);
    if (!create) return null;
    const fresh = crypto.getRandomValues(new Uint8Array(32));
    await SecureStore.setItemAsync(name, aesjs.utils.hex.fromBytes(fresh));
    return fresh;
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    const encryptionKey = await this.encryptionKey(key, false);
    if (!encryptionKey) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(encrypted)));
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = (await this.encryptionKey(key, true)) as Uint8Array;
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`sk_${key}`);
  }
}
