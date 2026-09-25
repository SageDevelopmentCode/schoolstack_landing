import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkAndPromptForOtaUpdate } from '@/lib/ota-updates';

export function OtaUpdateManager() {
  useEffect(() => {
    void checkAndPromptForOtaUpdate();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void checkAndPromptForOtaUpdate();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return null;
}
