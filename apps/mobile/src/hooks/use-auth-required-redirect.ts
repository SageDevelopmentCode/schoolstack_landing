import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { isAuthRequiredError } from '@/lib/auth/auth-session';
import { resolveAuthRecoveryRoute } from '@/lib/auth/auth-recovery';

export function useAuthRequiredRedirect(error: string | null): void {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || user) {
      return;
    }

    if (!error || !isAuthRequiredError(new Error(error))) {
      return;
    }

    void resolveAuthRecoveryRoute().then((route) => {
      router.replace(route);
    });
  }, [error, isLoading, router, user]);
}
