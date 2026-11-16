import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useParentClassroomSignups } from '@/contexts/parent-classroom-signups-context';
import type { ParentClassroomSignupListItem } from '@/lib/parent/parent-classroom-signups-types';
import { goBackOrReplace } from '@/lib/navigation';
import { parentClassroomSignupDetailRoute, parentTabRoute } from '@/lib/parent/parent-nav';

export type ParentClassroomSignupsScreenController = {
  items: ParentClassroomSignupListItem[];
  isInitialLoading: boolean;
  isRefreshing: boolean;
  hasLoaded: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  openSignup: (signupId: string) => void;
  onBack: () => void;
};

/** Data + navigation for the Classroom signups list (no UI). */
export function useParentClassroomSignupsScreenController(
  slug: string,
): ParentClassroomSignupsScreenController {
  const router = useRouter();
  const { items, isLoading, isRefreshing, error, hasLoaded, ensureLoaded, refresh } =
    useParentClassroomSignups();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const openSignup = useCallback(
    (signupId: string) => {
      router.push(parentClassroomSignupDetailRoute(slug, signupId));
    },
    [router, slug],
  );

  // The first screen in this stack can't pop; fall back to Home instead of a dead link.
  const onBack = useCallback(
    () => goBackOrReplace(router, parentTabRoute(slug, 'home')),
    [router, slug],
  );

  return {
    items,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing,
    hasLoaded,
    error,
    refresh,
    openSignup,
    onBack,
  };
}
