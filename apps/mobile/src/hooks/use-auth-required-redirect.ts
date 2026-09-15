import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { isAuthRequiredError } from '@/lib/auth/auth-session';
import { resolveAuthRecoveryRoute } from '@/lib/auth/auth-recovery';

export function useAuthRequiredRedirect(error: string | null): void {
  const router = useRouter();

  useEffect(() => {
    if (!error || !isAuthRequiredError(new Error(error))) {
      return;
    }

    void resolveAuthRecoveryRoute().then((route) => {
      router.replace(route);
    });
  }, [error, router]);
}
