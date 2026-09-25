import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { ensureSupabaseAuthStorageReady, getSupabaseClient } from '@/lib/supabase';

async function handleAppForeground(): Promise<void> {
  await ensureSupabaseAuthStorageReady();
  const supabase = getSupabaseClient();
  supabase.auth.startAutoRefresh();
  try {
    await supabase.auth.refreshSession();
  } catch {
    // Expected when logged out or refresh token is invalid.
  }
}

function handleAppBackground(): void {
  getSupabaseClient().auth.stopAutoRefresh();
}

export function SupabaseAuthLifecycle() {
  useEffect(() => {
    void handleAppForeground();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void handleAppForeground();
        return;
      }

      if (nextState === 'background' || nextState === 'inactive') {
        handleAppBackground();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => {
      subscription.remove();
      handleAppBackground();
    };
  }, []);

  return null;
}
