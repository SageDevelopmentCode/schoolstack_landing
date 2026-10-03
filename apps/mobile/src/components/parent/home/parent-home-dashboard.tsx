import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HomeBulletinSheet } from '@/components/bulletin/home-bulletin-sheet';
import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { ParentHomeChildStoryCard } from '@/components/parent/home/parent-home-child-story-card';
import { ParentHomeCoopFamiliesCard } from '@/components/parent/home/parent-home-coop-families-card';
import { ParentHomeEventsCard } from '@/components/parent/home/parent-home-events-card';
import { ParentHomeFeatureAnnouncementsCard } from '@/components/parent/home/parent-home-feature-announcements-card';
import { ParentHomeFridayBranchCard } from '@/components/parent/home/parent-home-friday-branch-card';
import { ParentHomeFormsSnapshotCard } from '@/components/parent/home/parent-home-forms-snapshot-card';
import { ParentHomeHeader } from '@/components/parent/home/parent-home-header';
import { ParentHomeHowToGuidesCard } from '@/components/parent/home/parent-home-how-to-guides-card';
import { ParentHomeSchoolUpdatesCard } from '@/components/parent/home/parent-home-school-updates-card';
import { ParentHomeStartHereCard } from '@/components/parent/home/parent-home-start-here-card';
import {
  PARENT_HOME_SUB_TAB_OVERVIEW,
  ParentHomeSubTabBar,
  type ParentHomeSubTabId,
} from '@/components/parent/home/parent-home-sub-tab-bar';
import { ParentActivityNotificationsSheet } from '@/components/parent/parent-activity-notifications-sheet';
import { ParentOnboardingSheet } from '@/components/parent/parent-onboarding-sheet';
import { PortalNeedHelpCard } from '@/components/portal/portal-need-help-card';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { isParentFeatureEnabled, isParentHomeFridayBranchEnabled } from '@/lib/parent/parent-features';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import {
  submitParentSupportRequest,
  type ParentDocGuide,
  type ParentHomeData,
  type ProgramCoopFamily,
  type ResolvedParentFeatureAnnouncement,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import { buildParentActivityNotificationContext } from '@/lib/parent/fetch-activity-notifications';
import { programPortalChildrenEmptyMessage } from '@/lib/parent/parent-children-utils';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

export type ParentHomeDashboardProps = {
  slug: string;
  programSlug?: string;
  programPortalLabel?: string;
  coopModeEnabled?: boolean;
  programId?: string;
  coopFamilies?: ProgramCoopFamily[];
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
  documentationGuides?: ParentDocGuide[];
  data: ParentHomeData;
  isPreview: boolean;
  isRefreshing: boolean;
  notificationUnreadCount: number;
  signupAttentionItems: ParentSignupAttentionItem[];
  sourcePagePath: string;
  onRefresh: () => void;
  onMarkedNotificationsRead: () => void;
  onAttentionItem: (item: ParentHomeAttentionItem) => void;
  onOnboardingItem: (item: ResolvedParentOnboardingItem) => void;
  onViewCalendar: () => void;
  onOpenMessages: () => void;
  onOpenChildDetails: (applicationId: string) => void;
  onOpenEnrollment: (applicationId: string) => void;
  onOpenForm: (formId: string) => void;
  onViewAllForms: () => void;
  onOpenBulletinPost: (postId: string) => void;
  onFeatureAnnouncement: (announcement: ResolvedParentFeatureAnnouncement) => void;
  onDocumentationStep: (href: string) => void;
  onCoopMessageThread: (threadId: string) => void;
  parentNavBasePath?: string;
};

export function ParentHomeDashboard({
  slug,
  programSlug,
  programPortalLabel,
  coopModeEnabled = false,
  programId,
  coopFamilies = [],
  featureAnnouncements = [],
  documentationGuides = [],
  data,
  isPreview,
  isRefreshing,
  notificationUnreadCount,
  signupAttentionItems,
  sourcePagePath,
  onRefresh,
  onMarkedNotificationsRead,
  onAttentionItem,
  onOnboardingItem,
  onViewCalendar,
  onOpenMessages,
  onOpenChildDetails,
  onOpenEnrollment,
  onOpenForm,
  onViewAllForms,
  onOpenBulletinPost,
  onFeatureAnnouncement,
  onDocumentationStep,
  onCoopMessageThread,
  parentNavBasePath,
}: ParentHomeDashboardProps) {
  const theme = useParentTheme();
  const activityNotificationContext = useMemo(
    () =>
      buildParentActivityNotificationContext({
        slug,
        programSlug,
        programId,
        coopModeEnabled,
        parentNavBasePath,
      }),
    [coopModeEnabled, parentNavBasePath, programId, programSlug, slug],
  );
  const [activeSubTab, setActiveSubTab] = useState<ParentHomeSubTabId>(PARENT_HOME_SUB_TAB_OVERVIEW);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setActiveSubTab(PARENT_HOME_SUB_TAB_OVERVIEW);
  }, [coopModeEnabled, programSlug]);

  const openWebUrl = async (href: string) => {
    await openBrowserAsync(resolveWebUrl(href), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const nextEvent = data.upcomingEvents[0] ?? null;
  const enrollmentIncompleteBannerItems = data.enrollmentIncompleteBannerItems ?? [];
  const bulletinEnabled = data.bulletinEnabled ?? false;
  const bulletinPosts = data.bulletinPosts ?? [];
  const messagesEnabled = isParentFeatureEnabled(data.features, 'messages');
  const showCoopSchoolUpdates =
    coopModeEnabled && !bulletinEnabled && messagesEnabled;
  const firstChildApplicationId =
    data.familyChildren.find((child) => Boolean(child.studentId))?.applicationId ?? null;

  const handleOnboardingItem = async (item: ResolvedParentOnboardingItem) => {
    setOnboardingOpen(false);
    if (item.completed) return;
    onOnboardingItem(item);
  };

  const showLearnOnOverview = !coopModeEnabled;
  const showNeedHelpOnOverview = !coopModeEnabled;

  const renderLearnContent = ({
    includeNeedHelp,
    delayBase,
  }: {
    includeNeedHelp: boolean;
    delayBase: number;
  }) => (
    <>
      {featureAnnouncements.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(delayBase).duration(350)}>
          <ParentHomeFeatureAnnouncementsCard
            announcements={featureAnnouncements}
            onPressAnnouncement={onFeatureAnnouncement}
          />
        </Animated.View>
      ) : null}

      {documentationGuides.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(delayBase + 40).duration(350)}>
          <ParentHomeHowToGuidesCard
            guides={documentationGuides}
            onStepAction={onDocumentationStep}
          />
        </Animated.View>
      ) : null}

      {includeNeedHelp ? (
        <Animated.View entering={FadeInDown.delay(delayBase + 80).duration(350)}>
          <PortalNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
        </Animated.View>
      ) : null}
    </>
  );

  const renderOverviewSections = () => (
    <>
      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <ParentHomeStartHereCard
          slug={slug}
          programSlug={programSlug}
          onboardingItems={data.onboardingItems}
          enrollmentAmendmentBannerItems={data.enrollmentAmendmentBannerItems}
          enrollmentIncompleteBannerItems={enrollmentIncompleteBannerItems}
          formAttentionItems={data.formAttentionItems ?? []}
          signupAttentionItems={signupAttentionItems}
          familyChildren={data.familyChildren}
          onPressAttentionItem={onAttentionItem}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <ParentHomeEventsCard nextEvent={nextEvent} onViewCalendar={onViewCalendar} />
      </Animated.View>

      {showCoopSchoolUpdates ? (
        <Animated.View entering={FadeInDown.delay(90).duration(350)}>
          <ParentHomeSchoolUpdatesCard
            bulletinEnabled={false}
            bulletinPosts={bulletinPosts}
            messagesEnabled={messagesEnabled}
            onOpenMessages={onOpenMessages}
            onOpenBulletinPost={onOpenBulletinPost}
          />
        </Animated.View>
      ) : null}

      {isParentHomeFridayBranchEnabled(data.features) && data.fridayBranchHome ? (
        <Animated.View entering={FadeInDown.delay(100).duration(350)}>
          <ParentHomeFridayBranchCard
            slug={slug}
            programSlug={programSlug}
            organizationId={data.organizationId}
            initialBundle={data.fridayBranchHome}
          />
        </Animated.View>
      ) : null}

      {showLearnOnOverview ? renderLearnContent({ includeNeedHelp: false, delayBase: 120 }) : null}

      {showNeedHelpOnOverview ? (
        <Animated.View entering={FadeInDown.delay(200).duration(350)}>
          <PortalNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
        </Animated.View>
      ) : null}
    </>
  );

  const renderFamilySections = () => (
    <>
      <Animated.View entering={FadeInDown.delay(40).duration(350)} style={styles.section}>
        <StoryDisplayHeading size="section">Your children</StoryDisplayHeading>

        {data.familyChildren.length === 0 ? (
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {programPortalLabel ? (
                programPortalChildrenEmptyMessage(programPortalLabel)
              ) : (
                <>
                  We don&apos;t have any student records from your applications yet. Visit your{' '}
                  <Text
                    style={[styles.emptyLink, { color: theme.primary }]}
                    onPress={() => void openWebUrl(schoolApplyUrl(slug))}>
                    application dashboard
                  </Text>{' '}
                  to get started.
                </>
              )}
            </Text>
          </StoryCard>
        ) : (
          <View style={styles.childrenList}>
            {data.familyChildren.map((child) => (
              <ParentHomeChildStoryCard
                key={child.applicationId}
                child={child}
                onViewDetails={() => onOpenChildDetails(child.applicationId)}
                onOpenEnrollment={() => onOpenEnrollment(child.applicationId)}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {data.formSnapshot ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <ParentHomeFormsSnapshotCard
            snapshot={data.formSnapshot}
            onOpenForm={onOpenForm}
            onViewAll={onViewAllForms}
          />
        </Animated.View>
      ) : null}
    </>
  );

  const renderCoopSections = () =>
    coopModeEnabled && programPortalLabel && programId ? (
      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <ParentHomeCoopFamiliesCard
          programLabel={programPortalLabel}
          families={coopFamilies}
          organizationId={data.organizationId}
          programId={programId}
          messagesEnabled={messagesEnabled}
          onOpenThread={onCoopMessageThread}
        />
      </Animated.View>
    ) : null;

  const renderLearnSections = () =>
    renderLearnContent({ includeNeedHelp: true, delayBase: 40 });

  const renderActiveSubTabContent = () => {
    switch (activeSubTab) {
      case 'family':
        return renderFamilySections();
      case 'coop':
        return renderCoopSections();
      case 'learn':
        return renderLearnSections();
      case 'overview':
      default:
        return renderOverviewSections();
    }
  };

  return (
    <>
      <StatusBar style={isPreview ? 'dark' : 'light'} />
      <View style={styles.screen}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <ParentHomeHeader
            displayName={data.userProfile.displayName}
            programPortalLabel={programPortalLabel}
            coopModeEnabled={coopModeEnabled}
            bulletinEnabled={bulletinEnabled}
            bulletinPostCount={bulletinPosts.length}
            notificationUnreadCount={notificationUnreadCount}
            onOpenBulletin={() => setBulletinOpen(true)}
            onPressHelp={() => setSupportSheetOpen(true)}
            onPressNotifications={() => setNotificationsOpen(true)}
          />
        </Animated.View>

        <ParentHomeSubTabBar
          coopModeEnabled={coopModeEnabled}
          activeTabId={activeSubTab}
          onChange={setActiveSubTab}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }>
          {renderActiveSubTabContent()}
        </ScrollView>
      </View>

      <HomeBulletinSheet
        visible={bulletinOpen}
        posts={bulletinPosts}
        onClose={() => setBulletinOpen(false)}
        onOpenPost={(postId) => {
          setBulletinOpen(false);
          onOpenBulletinPost(postId);
        }}
      />

      <ParentActivityNotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        organizationId={data.organizationId}
        slug={slug}
        programSlug={programSlug}
        notificationContext={activityNotificationContext}
        firstChildApplicationId={firstChildApplicationId}
        onMarkedRead={onMarkedNotificationsRead}
      />

      <PortalSupportRequestSheet
        visible={supportSheetOpen}
        onClose={() => setSupportSheetOpen(false)}
        organizationId={data.organizationId}
        userEmail={data.userProfile.email}
        sourcePagePath={sourcePagePath}
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
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  scroll: {
    flex: 1,
    backgroundColor: Story.paper,
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
