import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { getMobileEntryRoute } from '@/lib/auth/mobile-portal-entry';
import { resolvePortalForSchool } from '@/lib/auth/resolve-portal';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * When persisted state says school_admin but the signed-in user only has teacher/parent
 * access, re-resolve and navigate to the correct portal before school-admin APIs run.
 */
export function useEnsureSchoolAdminPortalAccess(
  slug: string | undefined,
  options?: { enabled?: boolean },
): void {
  const enabled = options?.enabled ?? true;
  const router = useRouter();
  const isFocused = useIsFocused();
  const {
    user,
    portalType,
    selectedSchool,
    previewSession,
    isLoading,
    accountPortalSwitchInProgress,
    setResolvedPortal,
  } = useAuth();

  useEffect(() => {
    if (
      !enabled ||
      !isFocused ||
      isLoading ||
      !slug ||
      !user ||
      accountPortalSwitchInProgress ||
      previewSession
    ) {
      return;
    }

    if (portalType !== 'school_admin' || selectedSchool?.slug !== slug) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const school = selectedSchool;
      if (!school) return;

      try {
        const supabase = getSupabaseClient();
        const resolved = await resolvePortalForSchool(supabase, user.id, school);
        if (cancelled || resolved.portalType === 'school_admin') {
          return;
        }

        await setResolvedPortal(resolved);
        router.replace(getMobileEntryRoute(resolved.portalType, slug));
      } catch {
        if (!cancelled) {
          router.replace('/login');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    accountPortalSwitchInProgress,
    enabled,
    isFocused,
    isLoading,
    portalType,
    previewSession,
    router,
    selectedSchool,
    setResolvedPortal,
    slug,
    user,
  ]);
}
