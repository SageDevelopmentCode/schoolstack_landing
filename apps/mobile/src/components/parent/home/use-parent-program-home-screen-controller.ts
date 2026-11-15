import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-types';
import type {
  ParentHomeScreenController,
  ParentHomeScreenControllerOptions,
} from '@/components/parent/home/use-parent-home-screen-controller';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { useParentProgramHome } from '@/contexts/parent-program-home-context';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import {
  getOnboardingItemRoute,
  parentBulletinDetailRoute,
  parentEnrollmentItemRoute,
  parentProgramMessageThreadRoute,
  parentProgramMoreRoute,
  parentProgramTabRoute,
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
  type ResolvedParentFeatureAnnouncement,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Program / co-op portal Home: same contract as `useParentHomeScreenController`,
 * backed by the program Home context and program routes.
 */
export function useParentProgramHomeScreenController(
  slug: string,
  programSlug: string,
  options: ParentHomeScreenControllerOptions = {},
): ParentHomeScreenController {
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useParentProgramHome();
  const { reportError } = useMobileErrorReporter(data?.organizationId);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [signupAttentionItems, setSignupAttentionItems] = useState<ParentSignupAttentionItem[]>(
    [],
  );
  const { onUnresolvedNavigation } = options;

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useAuthRequiredRedirect(error);

  const loadNotificationUnreadCount = useCallback(async () => {
    if (!data?.organizationId) return;
    try {
      const count = await fetchParentActivityNotificationUnreadCount(
        data.organizationId,
        slug,
        buildParentActivityNotificationContext({
          slug,
          programSlug: data.programSlug,
          programId: data.programId,
          coopModeEnabled: data.coopModeEnabled,
          parentNavBasePath: data.parentNavBasePath,
        }),
      );
      setNotificationUnreadCount(count);
    } catch (err) {
      reportError('parent.activity_notifications.unread_count_failed', err);
    }
  }, [
    data?.coopModeEnabled,
    data?.organizationId,
    data?.parentNavBasePath,
    data?.programId,
    data?.programSlug,
    reportError,
    slug,
  ]);

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
        reportError('parent.signup_attention.fetch_failed', err);
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

  const programFormDetailRoute = (formId: string): Href =>
    `${parentProgramMoreRoute(slug, programSlug, 'forms-documents')}/${encodeURIComponent(formId)}` as Href;

  const programChildDetailRoute = (applicationId: string): Href =>
    `${parentProgramMoreRoute(slug, programSlug, 'children')}/${encodeURIComponent(applicationId)}` as Href;

  const dashboardProps: ParentHomeDashboardProps = {
    slug,
    programSlug,
    programPortalLabel: data.programPortalLabel,
    coopModeEnabled: data.coopModeEnabled,
    programId: data.programId,
    parentNavBasePath: data.parentNavBasePath,
    coopFamilies: data.coopFamilies,
    featureAnnouncements: data.featureAnnouncements,
    documentationGuides: data.documentationGuides,
    data,
    isPreview,
    isRefreshing,
    notificationUnreadCount,
    signupAttentionItems,
    sourcePagePath: `/parent/${slug}/p/${programSlug}/home`,
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
        programSlug,
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
        programSlug,
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
      const mobileRoute = resolveParentDocumentationMobileRoute(slug, item.href, programSlug);
      if (mobileRoute) {
        router.push(mobileRoute);
        return;
      }
      await openWebUrl(item.href);
    },
    onViewCalendar: () => router.replace(parentProgramTabRoute(slug, programSlug, 'calendar')),
    onOpenMessages: () => router.replace(parentProgramTabRoute(slug, programSlug, 'messages')),
    onOpenChildDetails: (applicationId) => router.push(programChildDetailRoute(applicationId)),
    onOpenEnrollment: (applicationId) =>
      router.push(parentEnrollmentItemRoute(slug, applicationId)),
    onOpenForm: (formId) => router.push(programFormDetailRoute(formId)),
    onViewAllForms: () => router.push(parentProgramMoreRoute(slug, programSlug, 'forms-documents')),
    onOpenBulletinPost: (postId) => router.push(parentBulletinDetailRoute(slug, postId)),
    onFeatureAnnouncement: (announcement: ResolvedParentFeatureAnnouncement) => {
      const route = resolveParentFeatureAnnouncementMobileRoute(
        slug,
        announcement.href,
        programSlug,
      );
      if (route) {
        router.push(route);
      } else {
        onUnresolvedNavigation?.('announcement');
      }
    },
    onDocumentationStep: (href) => {
      const route = resolveParentDocumentationMobileRoute(slug, href, programSlug);
      if (route) {
        router.push(route);
      } else {
        onUnresolvedNavigation?.('documentation');
      }
    },
    onCoopMessageThread: (threadId) =>
      router.push(parentProgramMessageThreadRoute(slug, programSlug, threadId)),
  };

  return { status: 'ready', data, error, refresh, dashboardProps };
}
