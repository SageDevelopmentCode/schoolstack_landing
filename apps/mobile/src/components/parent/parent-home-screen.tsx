import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { ParentHomeDashboard } from '@/components/parent/home/parent-home-dashboard';
import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
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
  type ResolvedParentFeatureAnnouncement,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentHomeScreenProps = {
  slug: string;
};

export function ParentHomeScreen({ slug }: ParentHomeScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();
  const { reportError } = useMobileErrorReporter(data?.organizationId);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [signupAttentionItems, setSignupAttentionItems] = useState<ParentSignupAttentionItem[]>(
    [],
  );

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

  const openWebUrl = async (href: string) => {
    await openExternalUrlSafely(resolveWebUrl(href), reportError, {
      operation: 'parent_home_open_web_url',
      metadata: { href },
    });
  };

  const firstChildApplicationId =
    data?.familyChildren.find((child) => Boolean(child.studentId))?.applicationId ?? null;

  if (isLoading && !data) {
    return <ParentHomeSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" previewSafe onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ParentHomeDashboard
      slug={slug}
      featureAnnouncements={data.featureAnnouncements}
      documentationGuides={data.documentationGuides}
      data={data}
      isPreview={isPreview}
      isRefreshing={isRefreshing}
      notificationUnreadCount={notificationUnreadCount}
      signupAttentionItems={signupAttentionItems}
      sourcePagePath={`/parent/${slug}/home`}
      onRefresh={() => void refresh()}
      onMarkedNotificationsRead={() => setNotificationUnreadCount(0)}
      onAttentionItem={(item: ParentHomeAttentionItem) => {
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
        }
      }}
      onOnboardingItem={async (item: ResolvedParentOnboardingItem) => {
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
      }}
      onViewCalendar={() => router.replace(parentTabRoute(slug, 'calendar'))}
      onOpenMessages={() => router.replace(parentTabRoute(slug, 'messages'))}
      onOpenChildDetails={(applicationId) =>
        router.push(parentChildrenRoute(slug, applicationId))
      }
      onOpenEnrollment={(applicationId) =>
        router.push(parentEnrollmentItemRoute(slug, applicationId))
      }
      onOpenForm={(formId) => router.push(parentFormDetailRoute(slug, formId))}
      onViewAllForms={() => router.push(parentFormsDocumentsRoute(slug))}
      onOpenBulletinPost={(postId) => router.push(parentBulletinDetailRoute(slug, postId))}
      onFeatureAnnouncement={(announcement: ResolvedParentFeatureAnnouncement) => {
        const route = resolveParentFeatureAnnouncementMobileRoute(slug, announcement.href);
        if (route) {
          router.push(route);
        }
      }}
      onDocumentationStep={(href) => {
        const route = resolveParentDocumentationMobileRoute(slug, href);
        if (route) {
          router.push(route);
        }
      }}
      onCoopMessageThread={() => {}}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  retry: {
    minWidth: 140,
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
