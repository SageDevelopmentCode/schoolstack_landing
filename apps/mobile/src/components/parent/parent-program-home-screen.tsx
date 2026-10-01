import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { ParentHomeDashboard } from '@/components/parent/home/parent-home-dashboard';
import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { useParentProgramHome } from '@/contexts/parent-program-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
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
import { usePortalPreview } from '@/lib/portal-preview-gating';

type ParentProgramHomeScreenProps = {
  slug: string;
  programSlug: string;
};

export function ParentProgramHomeScreen({ slug, programSlug }: ParentProgramHomeScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useParentProgramHome();
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [signupAttentionItems, setSignupAttentionItems] = useState<ParentSignupAttentionItem[]>(
    [],
  );

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
    } catch {
      // Keep the last known count on transient errors.
    }
  }, [data?.coopModeEnabled, data?.organizationId, data?.parentNavBasePath, data?.programId, data?.programSlug, slug]);

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
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [data?.organizationId]);

  const openWebUrl = async (href: string) => {
    await openBrowserAsync(resolveWebUrl(href), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
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

  const programFormDetailRoute = (formId: string): Href =>
    `${parentProgramMoreRoute(slug, programSlug, 'forms-documents')}/${encodeURIComponent(formId)}` as Href;

  const programChildDetailRoute = (applicationId: string): Href =>
    `${parentProgramMoreRoute(slug, programSlug, 'children')}/${encodeURIComponent(applicationId)}` as Href;

  return (
    <ParentHomeDashboard
      slug={slug}
      programSlug={programSlug}
      programPortalLabel={data.programPortalLabel}
      coopModeEnabled={data.coopModeEnabled}
      programId={data.programId}
      parentNavBasePath={data.parentNavBasePath}
      coopFamilies={data.coopFamilies}
      featureAnnouncements={data.featureAnnouncements}
      documentationGuides={data.documentationGuides}
      data={data}
      isPreview={isPreview}
      isRefreshing={isRefreshing}
      notificationUnreadCount={notificationUnreadCount}
      signupAttentionItems={signupAttentionItems}
      sourcePagePath={`/parent/${slug}/p/${programSlug}/home`}
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
          programSlug,
        });
        if (route) {
          router.push(route);
        }
      }}
      onOnboardingItem={async (item: ResolvedParentOnboardingItem) => {
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
      }}
      onViewCalendar={() => router.replace(parentProgramTabRoute(slug, programSlug, 'calendar'))}
      onOpenMessages={() => router.replace(parentProgramTabRoute(slug, programSlug, 'messages'))}
      onOpenChildDetails={(applicationId) => router.push(programChildDetailRoute(applicationId))}
      onOpenEnrollment={(applicationId) =>
        router.push(parentEnrollmentItemRoute(slug, applicationId))
      }
      onOpenForm={(formId) => router.push(programFormDetailRoute(formId))}
      onViewAllForms={() =>
        router.push(parentProgramMoreRoute(slug, programSlug, 'forms-documents'))
      }
      onOpenBulletinPost={(postId) => router.push(parentBulletinDetailRoute(slug, postId))}
      onFeatureAnnouncement={(announcement: ResolvedParentFeatureAnnouncement) => {
        const route = resolveParentFeatureAnnouncementMobileRoute(
          slug,
          announcement.href,
          programSlug,
        );
        if (route) {
          router.push(route);
        }
      }}
      onDocumentationStep={(href) => {
        const route = resolveParentDocumentationMobileRoute(slug, href, programSlug);
        if (route) {
          router.push(route);
        }
      }}
      onCoopMessageThread={(threadId) =>
        router.push(parentProgramMessageThreadRoute(slug, programSlug, threadId))
      }
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
