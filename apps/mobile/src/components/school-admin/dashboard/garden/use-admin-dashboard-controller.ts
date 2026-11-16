import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { completeSchoolSignIn, useAuth } from '@/contexts/auth-context';
import { useSchoolAdminFeatures } from '@/contexts/school-admin-features-context';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { getMobileEntryRoute } from '@/lib/auth/mobile-portal-entry';
import { fetchLiveOrganizationsBySlugs } from '@/lib/organizations';
import { createPortalCache, registerPortalMemoryClear } from '@/lib/portal-cache';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import type { MobileAdminDashboardSummary } from '@/lib/school-admin/dashboard-summary-types';
import { fetchActivityNotificationUnreadCount } from '@/lib/school-admin/fetch-activity-notifications';
import {
  fetchAdminDashboardSummary,
  refreshStripeConnectStatus,
} from '@/lib/school-admin/fetch-dashboard-summary';
import { filterMobileDashboardSummary } from '@/lib/school-admin/filter-mobile-dashboard-summary';
import {
  resolveSchoolAdminNativeRoute,
  schoolAdminSubmissionsRoute,
} from '@/lib/school-admin/school-admin-nav';
import { useSchoolAdminViewerProfile } from '@/lib/school-admin/viewer-profile';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export const SCHOOL_ADMIN_ACCESS_DENIED_MESSAGE = 'You do not have admin access to this school.';

/**
 * The tab shell unmounts the Dashboard on every tab switch (`<Slot />` + `router.replace`),
 * so the summary lives here (not in component state) to come back instantly. Focus then
 * refreshes it silently. The `school_admin_` prefix is wiped on sign-out.
 */
const dashboardCache = createPortalCache<MobileAdminDashboardSummary>('school_admin_dashboard:v1:');
const activityUnreadCountCache = new Map<string, number>();
registerPortalMemoryClear(() => activityUnreadCountCache.clear());

function dashboardCacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

export type AdminDashboardControllerInput = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

/**
 * Data + every navigation callback for the school admin Dashboard (no UI).
 * Same fetches, Stripe poll, routes and staff-portal escape hatch as the pre-Garden
 * screen; the summary is cached so focus refreshes silently instead of re-skeletoning.
 */
export function useAdminDashboardController({
  organizationId,
  slug,
  schoolName,
}: AdminDashboardControllerInput) {
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { user, setResolvedPortal } = useAuth();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { staffHoursEnabled } = useSchoolAdminFeatures();
  const cacheKey = dashboardCacheKey(organizationId, slug);
  const [summary, setSummary] = useState<MobileAdminDashboardSummary | null>(() =>
    dashboardCache.get(cacheKey),
  );
  const viewer = useSchoolAdminViewerProfile(summary?.viewerProfile ?? null);
  const [loading, setLoading] = useState(() => !dashboardCache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(
    () => dashboardCache.getCachedAt(cacheKey) ?? null,
  );
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [announcementsSheetOpen, setAnnouncementsSheetOpen] = useState(false);
  const [heroProfilePhotoUrl, setHeroProfilePhotoUrl] = useState<string | null>(null);
  const [activityUnreadCount, setActivityUnreadCountState] = useState(
    () => activityUnreadCountCache.get(organizationId) ?? 0,
  );
  const setActivityUnreadCount = useCallback(
    (count: number) => {
      activityUnreadCountCache.set(organizationId, count);
      setActivityUnreadCountState(count);
    },
    [organizationId],
  );
  const stripePollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useAuthRequiredRedirect(error);

  const loadActivityUnreadCount = useCallback(async () => {
    try {
      const count = await fetchActivityNotificationUnreadCount(organizationId);
      setActivityUnreadCount(count);
    } catch {
      // Keep the last known count on transient errors.
    }
  }, [organizationId, setActivityUnreadCount]);

  /** Loads the summary. `isRefresh` keeps the current screen up (no skeleton). */
  const loadSummary = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        const nextSummary = await dashboardCache.fetchAndCache(
          cacheKey,
          async () =>
            filterMobileDashboardSummary(slug, await fetchAdminDashboardSummary(organizationId, slug)),
          { refresh: true },
        );
        setSummary(nextSummary);
        setLastUpdatedAt(dashboardCache.getCachedAt(cacheKey) ?? Date.now());
        void loadActivityUnreadCount();
      } catch (loadError) {
        reportError('school_admin_dashboard_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, loadActivityUnreadCount, organizationId, reportError, slug],
  );

  // Returning to the tab: show the cached summary and refresh it in the background.
  useFocusEffect(
    useCallback(() => {
      void loadSummary(dashboardCache.has(cacheKey));
      void loadActivityUnreadCount();
    }, [cacheKey, loadActivityUnreadCount, loadSummary]),
  );

  const stripeStep = summary?.setupStatus.steps.find((step) => step.id === 'stripe');
  const stripeChecking = stripeStep?.status === 'in_progress';

  useEffect(() => {
    if (stripePollRef.current) {
      clearInterval(stripePollRef.current);
      stripePollRef.current = null;
    }

    if (!stripeChecking) return;

    stripePollRef.current = setInterval(() => {
      void refreshStripeConnectStatus(organizationId)
        .then(() => loadSummary(true))
        .catch(() => {
          // Keep last known summary on polling errors.
        });
    }, 60_000);

    return () => {
      if (stripePollRef.current) {
        clearInterval(stripePollRef.current);
        stripePollRef.current = null;
      }
    };
  }, [loadSummary, organizationId, stripeChecking]);

  /** Pushes the native route for a web href. Returns `false` when there is no in-app screen. */
  const navigateToHref = useCallback(
    (href: string): boolean => {
      const route = resolveSchoolAdminNativeRoute(slug, href);
      if (!route) return false;
      router.push(route as Href);
      return true;
    },
    [router, slug],
  );

  const pushRoute = useCallback((route: string) => router.push(route as Href), [router]);

  const openAdmissions = useCallback(() => {
    router.replace(schoolAdminSubmissionsRoute(slug) as Href);
  }, [router, slug]);

  const openBulletin = useCallback(() => {
    router.push(`/school-admin/${slug}/more/bulletin` as Href);
  }, [router, slug]);

  const openStaffHours = useCallback(() => {
    router.push(`/school-admin/${slug}/more/staff-hours` as Href);
  }, [router, slug]);

  /** Same escape hatch as before; returns `false` when the staff portal isn't available. */
  const openStaffPortal = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    const organizations = await fetchLiveOrganizationsBySlugs([slug]);
    const organization = organizations[0];
    if (!organization) return false;

    const portal = await completeSchoolSignIn(user.id, organization);
    await setResolvedPortal(portal, user.id);
    router.replace(getMobileEntryRoute(portal.portalType, slug));
    return true;
  }, [router, setResolvedPortal, slug, user?.id]);

  const status: 'loading' | 'error' | 'ready' =
    loading && !summary ? 'loading' : error && !summary ? 'error' : summary ? 'ready' : 'loading';

  return {
    organizationId,
    slug,
    schoolName,
    isPreview,
    userEmail: user?.email ?? undefined,
    status,
    summary,
    error,
    accessDenied: error === SCHOOL_ADMIN_ACCESS_DENIED_MESSAGE,
    lastUpdatedAt,
    viewer,
    staffHoursEnabled,
    stripeChecking,
    activityUnreadCount,
    setActivityUnreadCount,
    profilePhotoUrl: viewer.profilePhotoUrl ?? heroProfilePhotoUrl,
    setHeroProfilePhotoUrl,
    reload: () => loadSummary(),
    refresh: () => loadSummary(true),
    navigateToHref,
    pushRoute,
    openAdmissions,
    openBulletin,
    openStaffHours,
    openStaffPortal,
    supportSheetOpen,
    setSupportSheetOpen,
    accountSheetOpen,
    setAccountSheetOpen,
    activitySheetOpen,
    setActivitySheetOpen,
    announcementsSheetOpen,
    setAnnouncementsSheetOpen,
  };
}

export type AdminDashboardController = ReturnType<typeof useAdminDashboardController>;
