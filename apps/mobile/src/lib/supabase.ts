import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { LargeSecureStore } from '@/lib/large-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const authStorage = new LargeSecureStore();

let client: SupabaseClient | undefined;
const legacyMigrationPromise = migrateLegacySecureStoreSession();

function getSupabaseAuthStorageKey(): string | null {
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\./)?.[1];
  if (!projectRef) {
    return null;
  }
  return `sb-${projectRef}-auth-token`;
}

/**
 * One-time migration: sessions from the old raw SecureStore adapter are moved
 * into LargeSecureStore (AsyncStorage + encrypted).
 */
async function migrateLegacySecureStoreSession(): Promise<void> {
  const storageKey = getSupabaseAuthStorageKey();
  if (!storageKey) {
    return;
  }

  const existingEncrypted = await AsyncStorage.getItem(storageKey);
  if (existingEncrypted) {
    return;
  }

  const legacySession = await SecureStore.getItemAsync(storageKey);
  if (!legacySession) {
    return;
  }

  await authStorage.setItem(storageKey, legacySession);
  await SecureStore.deleteItemAsync(storageKey);
}

/** Await before reading the auth session so legacy SecureStore data is migrated. */
export async function ensureSupabaseAuthStorageReady(): Promise<void> {
  await legacyMigrationPromise;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy values from the web app .env.local.',
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

/** Clears persisted Supabase auth storage (e.g. after sign-out migration). */
export async function clearSupabaseAuthStorage(): Promise<void> {
  const storageKey = getSupabaseAuthStorageKey();
  if (!storageKey) {
    return;
  }

  await authStorage.removeItem(storageKey);
}
