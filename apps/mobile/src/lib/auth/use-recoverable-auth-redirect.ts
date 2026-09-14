import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { resolveAuthRecoveryRoute } from '@/lib/auth/auth-recovery';

/** Redirect away from protected routes when the user is absent, preferring /portal when recoverable. */
export function useRecoverableAuthRedirect(
  shouldRedirect: boolean,
  isLoading: boolean,
): void {
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !shouldRedirect) {
      return;
    }

    void resolveAuthRecoveryRoute().then((route) => {
      router.replace(route);
    });
  }, [isLoading, router, shouldRedirect]);
}
