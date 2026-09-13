import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { isAuthRequiredError } from '@/lib/auth/auth-session';

export function useAuthRequiredRedirect(error: string | null): void {
  const router = useRouter();

  useEffect(() => {
    if (error && isAuthRequiredError(new Error(error))) {
      router.replace('/');
    }
  }, [error, router]);
}
