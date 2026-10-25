import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';

import { isMobileSentryEnabled, navigationIntegration } from '@/lib/sentry';

export function SentryNavigationTracker() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!isMobileSentryEnabled() || !navigationRef) {
      return;
    }

    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  return null;
}
