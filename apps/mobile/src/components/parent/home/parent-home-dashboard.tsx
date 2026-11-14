import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
import { ParentHomeSubTabPanel } from '@/components/parent/home/parent-home-sub-tab-panel';
import {
  PARENT_HOME_SUB_TAB_OVERVIEW,
  ParentHomeSubTabBar,
  resolveParentHomeSubTabs,
  type ParentHomeSubTabId,
} from '@/components/parent/home/parent-home-sub-tab-bar';
import { ParentHomeSheets } from '@/components/parent/home/parent-home-sheets';
import { useParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import { ParentPortalMudKitchenSupportMessagesCard } from '@/components/parent/home/parent-portal-mudkitchen-support-messages-card';
import { PortalNeedHelpCard } from '@/components/portal/portal-need-help-card';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import {
  isParentHomeFridayBranchEnabled,
  resolveFridayBranchSettingsFromHome,
} from '@/lib/parent/parent-features';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import {
  type ParentDocGuide,
  type ParentHomeData,
  type ProgramCoopFamily,
  type ResolvedParentFeatureAnnouncement,
  type ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import { programPortalChildrenEmptyMessage } from '@/lib/parent/parent-children-utils';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

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

export function ParentHomeDashboard(props: ParentHomeDashboardProps) {
  const {
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
  onRefresh,
  onAttentionItem,
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
  } = props;
  const theme = useParentTheme();
  const model = useParentHomeDashboardModel(props);
  const {
    setOnboardingOpen,
    setSupportSheetOpen,
    setAccountSheetOpen,
    setBulletinOpen,
    setNotificationsOpen,
    heroProfilePhotoUrl,
    nextEvent,
    enrollmentIncompleteBannerItems,
    bulletinEnabled,
    bulletinPosts,
    messagesEnabled,
    showCoopSchoolUpdates,
  } = model;
  const [activeSubTab, setActiveSubTab] = useState<ParentHomeSubTabId>(PARENT_HOME_SUB_TAB_OVERVIEW);
  const [visitedSubTabs, setVisitedSubTabs] = useState<Set<ParentHomeSubTabId>>(
    () => new Set([PARENT_HOME_SUB_TAB_OVERVIEW]),
  );

  const subTabs = useMemo(
    () => resolveParentHomeSubTabs(coopModeEnabled),
    [coopModeEnabled],
  );

  useEffect(() => {
    setActiveSubTab(PARENT_HOME_SUB_TAB_OVERVIEW);
    setVisitedSubTabs(new Set([PARENT_HOME_SUB_TAB_OVERVIEW]));
  }, [coopModeEnabled, programSlug]);

  const handleSubTabChange = useCallback((tabId: ParentHomeSubTabId) => {
    setVisitedSubTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
    setActiveSubTab(tabId);
  }, []);

  const { reportError } = useMobileErrorReporter(data.organizationId);
  const openWebUrl = async (href: string) => {
    await openExternalUrlSafely(resolveWebUrl(href), reportError, {
      operation: 'parent_home_open_web_url',
      metadata: { href },
    });
  };

  const renderFeatureAnnouncements = () =>
    featureAnnouncements.length > 0 ? (
      <ParentHomeFeatureAnnouncementsCard
        announcements={featureAnnouncements}
        onPressAnnouncement={onFeatureAnnouncement}
      />
    ) : null;

  const renderHelpSections = () => (
    <>
      <ParentPortalMudKitchenSupportMessagesCard slug={slug} messagesEnabled={messagesEnabled} />

      {documentationGuides.length > 0 ? (
        <ParentHomeHowToGuidesCard
          guides={documentationGuides}
          onStepAction={onDocumentationStep}
        />
      ) : null}

      <PortalNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
    </>
  );

  const renderOverviewSections = () => (
    <>
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

      <ParentHomeEventsCard nextEvent={nextEvent} onViewCalendar={onViewCalendar} />

      {showCoopSchoolUpdates ? (
        <ParentHomeSchoolUpdatesCard
          bulletinEnabled={false}
          bulletinPosts={bulletinPosts}
          messagesEnabled={messagesEnabled}
          onOpenMessages={onOpenMessages}
          onOpenBulletinPost={onOpenBulletinPost}
        />
      ) : null}

      {isParentHomeFridayBranchEnabled(
        data.features,
        resolveFridayBranchSettingsFromHome(data),
      ) && data.fridayBranchHome ? (
        <ParentHomeFridayBranchCard
          slug={slug}
          programSlug={programSlug}
          organizationId={data.organizationId}
          initialBundle={data.fridayBranchHome}
        />
      ) : null}

      {renderFeatureAnnouncements()}
    </>
  );

  const renderFamilySections = () => (
    <>
      <View style={styles.section}>
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
      </View>

      {data.formSnapshot ? (
        <ParentHomeFormsSnapshotCard
          snapshot={data.formSnapshot}
          onOpenForm={onOpenForm}
          onViewAll={onViewAllForms}
        />
      ) : null}
    </>
  );

  const renderCoopSections = () =>
    coopModeEnabled && programPortalLabel && programId ? (
      <ParentHomeCoopFamiliesCard
        programLabel={programPortalLabel}
        families={coopFamilies}
        organizationId={data.organizationId}
        programId={programId}
        messagesEnabled={messagesEnabled}
        onOpenThread={onCoopMessageThread}
      />
    ) : null;

  const renderSubTabPanel = (tabId: ParentHomeSubTabId) => {
    switch (tabId) {
      case 'family':
        return renderFamilySections();
      case 'coop':
        return renderCoopSections();
      case 'help':
        return renderHelpSections();
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
            profilePhotoUrl={heroProfilePhotoUrl}
            onPressProfile={() => setAccountSheetOpen(true)}
            onPressNotifications={() => setNotificationsOpen(true)}
          />
        </Animated.View>

        <ParentHomeSubTabBar
          coopModeEnabled={coopModeEnabled}
          activeTabId={activeSubTab}
          onChange={handleSubTabChange}
        />

        <View style={styles.tabPanels}>
          {subTabs.map((tab) => {
            const tabId = tab.id as ParentHomeSubTabId;
            if (!visitedSubTabs.has(tabId)) return null;

            const visible = activeSubTab === tabId;

            return (
              <ParentHomeSubTabPanel key={tabId} visible={visible}>
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
                  {renderSubTabPanel(tabId)}
                </ScrollView>
              </ParentHomeSubTabPanel>
            );
          })}
        </View>
      </View>

      <ParentHomeSheets props={props} model={model} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  tabPanels: {
    flex: 1,
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
