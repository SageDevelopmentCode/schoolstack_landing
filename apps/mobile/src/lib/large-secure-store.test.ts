import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { LargeSecureStore } from '@/lib/large-secure-store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('LargeSecureStore', () => {
  const store = new LargeSecureStore();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores and retrieves values larger than SecureStore limits', async () => {
    const key = 'sb-test-auth-token';
    const largeValue = JSON.stringify({
      access_token: 'a'.repeat(3000),
      refresh_token: 'b'.repeat(3000),
      user: { id: 'user-1', email: 'parent@example.com' },
    });

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.setItem as jest.Mock).mockImplementation(async (_storageKey, encrypted) => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(encrypted);
      const keyHex = (SecureStore.setItemAsync as jest.Mock).mock.calls[0]?.[1];
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(keyHex);
    });

    await store.setItem(key, largeValue);
    const restored = await store.getItem(key);

    expect(restored).toBe(largeValue);
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('returns null without deleting ciphertext when the encryption key is missing', async () => {
    const key = 'sb-test-auth-token';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('encrypted-ciphertext');
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const restored = await store.getItem(key);

    expect(restored).toBeNull();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('removes encrypted values and encryption keys', async () => {
    const key = 'sb-test-auth-token';
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    await store.removeItem(key);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(`${key}_encryption_key`);
  });
});
