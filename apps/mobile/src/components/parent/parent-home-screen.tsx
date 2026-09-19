import { useRouter, type Href } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HomeBulletinSheet } from '@/components/bulletin/home-bulletin-sheet';
import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { ParentHomeChildStoryCard } from '@/components/parent/home/parent-home-child-story-card';
import { ParentHomeEventsCard } from '@/components/parent/home/parent-home-events-card';
import { ParentHomeFormsSnapshotCard } from '@/components/parent/home/parent-home-forms-snapshot-card';
import { ParentHomeHeader } from '@/components/parent/home/parent-home-header';
import { ParentHomeStartHereCard } from '@/components/parent/home/parent-home-start-here-card';
import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { ParentOnboardingSheet } from '@/components/parent/parent-onboarding-sheet';
import { PortalNeedHelpCard } from '@/components/portal/portal-need-help-card';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  resolveWebUrl,
  schoolApplicationUrl,
  schoolApplyUrl,
} from '@/lib/admissions/school-apply-url';
import {
  getOnboardingItemRoute,
  parentBulletinDetailRoute,
  parentChildrenRoute,
  parentTabRoute,
} from '@/lib/parent/parent-nav';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import {
  fetchParentSignupAttentionItems,
  submitParentSupportRequest,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';

type ParentHomeScreenProps = {
  slug: string;
};

export function ParentHomeScreen({ slug }: ParentHomeScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [signupAttentionItems, setSignupAttentionItems] = useState<ParentSignupAttentionItem[]>(
    [],
  );

  useAuthRequiredRedirect(error);

  useEffect(() => {
    if (!data?.organizationId) return;

    let cancelled = false;
    void fetchParentSignupAttentionItems(data.organizationId)
      .then((items) => {
        if (!cancelled) {
          setSignupAttentionItems(items);
        }
      })
      .catch(() => {
        // Signup attention is non-blocking.
      });

    return () => {
      cancelled = true;
    };
  }, [data?.organizationId]);

  const openWebUrl = async (href: string) => {
    await openBrowserAsync(resolveWebUrl(href), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const handleAttentionItem = async (item: ParentHomeAttentionItem) => {
    if (!item.href) return;
    if (item.href.startsWith('/parent/')) {
      router.push(item.href as Href);
      return;
    }
    await openWebUrl(item.href);
  };

  const handleOnboardingItem = async (item: ResolvedParentOnboardingItem) => {
    setOnboardingOpen(false);
    if (item.completed) return;

    const route = getOnboardingItemRoute(slug, item.target);
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
  };

  if (isLoading && !data) {
    return <ParentHomeSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) return null;

  const nextEvent = data.upcomingEvents[0] ?? null;
  const enrollmentIncompleteBannerItems = data.enrollmentIncompleteBannerItems ?? [];
  const bulletinEnabled = data.bulletinEnabled ?? false;
  const bulletinPosts = data.bulletinPosts ?? [];

  return (
    <>
      <ScrollView
        style={{ backgroundColor: Story.paper }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }>
        <Animated.View entering={FadeInDown.duration(350)}>
          <ParentHomeHeader
            displayName={data.userProfile.displayName}
            bulletinEnabled={bulletinEnabled}
            bulletinPostCount={bulletinPosts.length}
            onOpenBulletin={() => setBulletinOpen(true)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(350)}>
          <ParentHomeStartHereCard
            slug={slug}
            onboardingItems={data.onboardingItems}
            enrollmentAmendmentBannerItems={data.enrollmentAmendmentBannerItems}
            enrollmentIncompleteBannerItems={enrollmentIncompleteBannerItems}
            formAttentionItems={data.formAttentionItems ?? []}
            signupAttentionItems={signupAttentionItems}
            onPressAttentionItem={(item) => void handleAttentionItem(item)}
            onOpenOnboarding={() => setOnboardingOpen(true)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <ParentHomeEventsCard
            nextEvent={nextEvent}
            onViewCalendar={() => router.replace(parentTabRoute(slug, 'calendar'))}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.section}>
          <StoryDisplayHeading size="section">Your children</StoryDisplayHeading>

          {data.familyChildren.length === 0 ? (
            <StoryCard style={styles.emptyCard}>
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                We don&apos;t have any student records from your applications yet. Visit your{' '}
                <Text
                  style={[styles.emptyLink, { color: theme.primary }]}
                  onPress={() => void openWebUrl(schoolApplyUrl(slug))}>
                  application dashboard
                </Text>{' '}
                to get started.
              </Text>
            </StoryCard>
          ) : (
            <View style={styles.childrenList}>
              {data.familyChildren.map((child) => (
                <ParentHomeChildStoryCard
                  key={child.applicationId}
                  child={child}
                  onViewDetails={() =>
                    router.push(parentChildrenRoute(slug, child.applicationId))
                  }
                  onOpenEnrollment={() =>
                    void openWebUrl(
                      schoolApplicationUrl(slug, child.applicationId, { enrollment: true }),
                    )
                  }
                />
              ))}
            </View>
          )}
        </Animated.View>

        {data.formSnapshot ? (
          <Animated.View entering={FadeInDown.delay(140).duration(350)}>
            <ParentHomeFormsSnapshotCard
              snapshot={data.formSnapshot}
              onOpenForm={(formsHref) => void openWebUrl(formsHref)}
              onViewAll={() => void openWebUrl(data.formSnapshot!.formsPageHref)}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(160).duration(350)}>
          <PortalNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
        </Animated.View>
      </ScrollView>

      <HomeBulletinSheet
        visible={bulletinOpen}
        posts={bulletinPosts}
        onClose={() => setBulletinOpen(false)}
        onOpenPost={(postId) => {
          setBulletinOpen(false);
          router.push(parentBulletinDetailRoute(slug, postId));
        }}
      />

      <PortalSupportRequestSheet
        visible={supportSheetOpen}
        onClose={() => setSupportSheetOpen(false)}
        organizationId={data.organizationId}
        userEmail={data.userProfile.email}
        sourcePagePath={`/parent/${slug}/home`}
        errorOperation="parent_portal_support_request_submit"
        onSubmit={submitParentSupportRequest}
      />

      <ParentOnboardingSheet
        visible={onboardingOpen}
        items={data.onboardingItems}
        onClose={() => setOnboardingOpen(false)}
        onSelectItem={(item) => void handleOnboardingItem(item)}
      />
    </>
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
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  childrenList: {
    gap: Spacing.three,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
});
