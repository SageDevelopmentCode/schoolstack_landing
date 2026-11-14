import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-dashboard';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { useParentHome } from '@/contexts/parent-home-context';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import {
  getOnboardingItemRoute,
  parentBulletinDetailRoute,
  parentChildrenRoute,
  parentEnrollmentItemRoute,
  parentFormDetailRoute,
  parentFormsDocumentsRoute,
  parentTabRoute,
  resolveParentAttentionNavigation,
  resolveParentDocumentationMobileRoute,
  resolveParentFeatureAnnouncementMobileRoute,
} from '@/lib/parent/parent-nav';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import {
  buildParentActivityNotificationContext,
  fetchParentActivityNotificationUnreadCount,
} from '@/lib/parent/fetch-activity-notifications';
import {
  fetchParentSignupAttentionItems,
  type ParentHomeData,
  type ResolvedParentFeatureAnnouncement,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Optional hooks a caller (e.g. the Home lab) can attach to observe outcomes of
 * the shared navigation callbacks without changing what they do.
 */
export type ParentHomeScreenControllerOptions = {
  /** Called when a tap could not be resolved to an in-app route (nothing navigated). */
  onUnresolvedNavigation?: (kind: 'attention' | 'announcement' | 'documentation') => void;
};

export type ParentHomeScreenController =
  | { status: 'loading'; data: null; error: string | null; refresh: () => Promise<void> }
  | { status: 'error'; data: null; error: string; refresh: () => Promise<void> }
  | { status: 'empty'; data: null; error: string | null; refresh: () => Promise<void> }
  | {
      status: 'ready';
      data: ParentHomeData;
      error: string | null;
      refresh: () => Promise<void>;
      dashboardProps: ParentHomeDashboardProps;
    };

/**
 * Everything the parent Home route needs: data, the notification count, signup
 * attention, and every navigation callback. Shared by the real Home and the
 * temporary Home lab variants so their behaviour is identical.
 */
export function useParentHomeScreenController(
  slug: string,
  options: ParentHomeScreenControllerOptions = {},
): ParentHomeScreenController {
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();
  const { reportError } = useMobileErrorReporter(data?.organizationId);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [signupAttentionItems, setSignupAttentionItems] = useState<ParentSignupAttentionItem[]>(
    [],
  );
  const { onUnresolvedNavigation } = options;

  useAuthRequiredRedirect(error);

  const loadNotificationUnreadCount = useCallback(async () => {
    if (!data?.organizationId) return;
    try {
      const count = await fetchParentActivityNotificationUnreadCount(
        data.organizationId,
        slug,
        buildParentActivityNotificationContext({ slug }),
      );
      setNotificationUnreadCount(count);
    } catch (err) {
      // Keep the last known count on transient errors.
      reportError('parent.activity_notifications.unread_count_failed', err);
    }
  }, [data?.organizationId, reportError, slug]);

  useFocusEffect(
    useCallback(() => {
      void loadNotificationUnreadCount();
    }, [loadNotificationUnreadCount]),
  );

  useEffect(() => {
    if (!data?.organizationId) return;

    let cancelled = false;
    void fetchParentSignupAttentionItems(data.organizationId)
      .then((items) => {
        if (!cancelled) {
          setSignupAttentionItems(items);
        }
      })
      .catch((err) => {
        // Signup attention is non-blocking for the user, but failures are still reported.
        if (!cancelled) {
          reportError('parent.signup_attention.fetch_failed', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data?.organizationId, reportError]);

  if (isLoading && !data) {
    return { status: 'loading', data: null, error, refresh };
  }

  if (error && !data) {
    return { status: 'error', data: null, error, refresh };
  }

  if (!data) {
    return { status: 'empty', data: null, error, refresh };
  }

  const openWebUrl = async (href: string) => {
    await openExternalUrlSafely(resolveWebUrl(href), reportError, {
      operation: 'parent_home_open_web_url',
      metadata: { href },
    });
  };

  const firstChildApplicationId =
    data.familyChildren.find((child) => Boolean(child.studentId))?.applicationId ?? null;

  const dashboardProps: ParentHomeDashboardProps = {
    slug,
    featureAnnouncements: data.featureAnnouncements,
    documentationGuides: data.documentationGuides,
    data,
    isPreview,
    isRefreshing,
    notificationUnreadCount,
    signupAttentionItems,
    sourcePagePath: `/parent/${slug}/home`,
    onRefresh: () => void refresh(),
    onMarkedNotificationsRead: () => setNotificationUnreadCount(0),
    onAttentionItem: (item: ParentHomeAttentionItem) => {
      const route = resolveParentAttentionNavigation(slug, {
        target: item.target,
        href: item.href,
        formId: item.formId,
        enrollmentApplicationId: item.enrollmentApplicationId,
        enrollmentTemplateItemId: item.enrollmentTemplateItemId,
        enrollmentSectionId: item.enrollmentSectionId,
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
      });
      if (route) {
        router.push(route);
      } else {
        onUnresolvedNavigation?.('attention');
      }
    },
    onOnboardingItem: async (item: ResolvedParentOnboardingItem) => {
      const route = getOnboardingItemRoute(slug, item.target, {
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
      });
      if (route) {
        router.replace(route);
        return;
      }
      if (item.target.startsWith('url:')) {
        const customUrl = item.target.slice(4).trim();
        if (customUrl) {
          await openWebUrl(customUrl);
        }
        return;
      }
      await openWebUrl(item.href);
    },
    onViewCalendar: () => router.replace(parentTabRoute(slug, 'calendar')),
    onOpenMessages: () => router.replace(parentTabRoute(slug, 'messages')),
    onOpenChildDetails: (applicationId) => router.push(parentChildrenRoute(slug, applicationId)),
    onOpenEnrollment: (applicationId) =>
      router.push(parentEnrollmentItemRoute(slug, applicationId)),
    onOpenForm: (formId) => router.push(parentFormDetailRoute(slug, formId)),
    onViewAllForms: () => router.push(parentFormsDocumentsRoute(slug)),
    onOpenBulletinPost: (postId) => router.push(parentBulletinDetailRoute(slug, postId)),
    onFeatureAnnouncement: (announcement: ResolvedParentFeatureAnnouncement) => {
      const route = resolveParentFeatureAnnouncementMobileRoute(slug, announcement.href);
      if (route) {
        router.push(route);
      } else {
        onUnresolvedNavigation?.('announcement');
      }
    },
    onDocumentationStep: (href) => {
      const route = resolveParentDocumentationMobileRoute(slug, href);
      if (route) {
        router.push(route);
      } else {
        onUnresolvedNavigation?.('documentation');
      }
    },
    onCoopMessageThread: () => {},
  };

  return { status: 'ready', data, error, refresh, dashboardProps };
}
