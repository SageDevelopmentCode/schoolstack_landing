import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

import { recordPendingAuthDiagnostic } from '@/lib/mobile-auth-diagnostics';

const ENCRYPTION_KEY_SUFFIX = '_encryption_key';

/**
 * Encrypted storage for values larger than SecureStore's ~2048-byte limit.
 * Persists a stable AES key in SecureStore and ciphertext in AsyncStorage.
 */
export class LargeSecureStore {
  private encryptionKeyStorageKey(key: string): string {
    return `${key}${ENCRYPTION_KEY_SUFFIX}`;
  }

  private async getEncryptionKey(key: string): Promise<Uint8Array> {
    const keyStorageKey = this.encryptionKeyStorageKey(key);
    const keyHex = await SecureStore.getItemAsync(keyStorageKey);
    if (keyHex) {
      return aesjs.utils.hex.toBytes(keyHex);
    }

    const newKey = crypto.getRandomValues(new Uint8Array(32));
    await SecureStore.setItemAsync(keyStorageKey, aesjs.utils.hex.fromBytes(newKey));
    return newKey;
  }

  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await this.getEncryptionKey(key);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await this.getEncryptionKey(key);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return null;
    }

    const keyHex = await SecureStore.getItemAsync(this.encryptionKeyStorageKey(key));
    if (!keyHex) {
      void recordPendingAuthDiagnostic('auth.storage_decrypt_failed', {
        reason: 'missing_encryption_key',
      });
      return null;
    }

    try {
      return await this.decrypt(key, encrypted);
    } catch {
      void recordPendingAuthDiagnostic('auth.storage_decrypt_failed', {
        reason: 'decrypt_failed',
      });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(this.encryptionKeyStorageKey(key));
  }
}
