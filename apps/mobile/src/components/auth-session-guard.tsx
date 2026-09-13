import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

const PROTECTED_ROOT_SEGMENTS = new Set([
  'parent',
  'school-admin',
  'platform-admin',
  'portal',
  'parent-apply-gate',
]);

function isProtectedRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return false;
  return PROTECTED_ROOT_SEGMENTS.has(root);
}

export function AuthSessionGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    if (!user && isProtectedRoute(segments)) {
      router.replace('/');
    }
  }, [isLoading, router, segments, user]);

  return null;
}
