import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentChildRecordWorkspace } from '@/components/parent/children/parent-child-record-workspace';
import { ParentChildrenLearnerStrip } from '@/components/parent/children/parent-children-learner-strip';
import { ParentChildrenOverview } from '@/components/parent/children/parent-children-overview';
import { ParentChildrenOverviewSkeleton } from '@/components/parent/children/parent-children-overview-skeleton';
import { ParentChildrenRecordSkeleton } from '@/components/parent/children/parent-children-record-skeleton';
import { ParentChildrenSkeleton } from '@/components/parent/children/parent-children-skeleton';
import { ParentChildrenStoryHeader } from '@/components/parent/children/parent-children-story-header';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import {
  type ChildProfileData,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { fetchParentChildProfile } from '@/lib/parent/parent-portal-api';

type ParentChildrenScreenProps = {
  slug: string;
  initialApplicationId?: string;
};

export function ParentChildrenScreen({
  slug: _slug,
  initialApplicationId,
}: ParentChildrenScreenProps) {
  const theme = useParentTheme();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();
  const scrollViewRef = useRef<ScrollView>(null);
  const recordWorkspaceRef = useRef<View>(null);
  const recordOffsetYRef = useRef(0);
  const deepLinkHandled = useRef(false);

  const children = data?.familyChildren ?? [];
  const organizationId = data?.organizationId ?? '';

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    children[0]?.applicationId ?? null,
  );
  const [profiles, setProfiles] = useState<Record<string, ChildProfileData>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recordSection, setRecordSection] = useState<ParentChildRecordSection>('application');

  const selectedChild = useMemo(
    () => children.find((child) => child.applicationId === selectedApplicationId) ?? null,
    [children, selectedApplicationId],
  );

  const selectedProfile = selectedApplicationId ? profiles[selectedApplicationId] ?? null : null;

  useEffect(() => {
    if (children.length === 0) {
      setSelectedApplicationId(null);
      return;
    }
    if (
      initialApplicationId &&
      children.some((child) => child.applicationId === initialApplicationId)
    ) {
      return;
    }
    if (
      !selectedApplicationId ||
      !children.some((child) => child.applicationId === selectedApplicationId)
    ) {
      setSelectedApplicationId(children[0].applicationId);
    }
  }, [children, initialApplicationId, selectedApplicationId]);

  const loadProfile = useCallback(
    async (applicationId: string) => {
      if (!organizationId || profiles[applicationId]) {
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(null);

      try {
        const profile = await fetchParentChildProfile(applicationId, organizationId);
        setProfiles((prev) => ({
          ...prev,
          [applicationId]: profile,
        }));
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Failed to load student profile.';
        setProfileError(message);
        if (organizationId) {
          void reportMobileOperationalError(
            {
              organizationId,
              surface: 'parent_portal',
              operation: 'parent_children_load_profile',
              error: message,
              entityType: 'application',
              entityId: applicationId,
            },
            loadError,
          );
        }
      } finally {
        setProfileLoading(false);
      }
    },
    [organizationId, profiles],
  );

  useEffect(() => {
    if (!selectedApplicationId) return;
    void loadProfile(selectedApplicationId);
  }, [loadProfile, selectedApplicationId]);

  const scrollToRecord = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, recordOffsetYRef.current - Spacing.two),
        animated: true,
      });
    });
  }, []);

  useEffect(() => {
    if (!initialApplicationId || deepLinkHandled.current) return;
    if (!children.some((child) => child.applicationId === initialApplicationId)) return;

    deepLinkHandled.current = true;
    setSelectedApplicationId(initialApplicationId);
    setRecordSection('application');
    setProfileLoading(true);
    void loadProfile(initialApplicationId);
    scrollToRecord();
  }, [children, initialApplicationId, loadProfile, scrollToRecord]);

  const handleSelectChild = useCallback(
    (applicationId: string) => {
      setSelectedApplicationId(applicationId);
      setRecordSection('application');
      if (profiles[applicationId]) return;
      setProfileLoading(true);
      void loadProfile(applicationId);
    },
    [loadProfile, profiles],
  );

  const openRecordSection = useCallback(
    (section: ParentChildRecordSection) => {
      if (!selectedApplicationId) return;
      setRecordSection(section);
      void loadProfile(selectedApplicationId);
      scrollToRecord();
    },
    [loadProfile, scrollToRecord, selectedApplicationId],
  );

  const handlePhotoUpdated = useCallback(
    (applicationId: string, profilePhotoUrl: string) => {
      setProfiles((prev) => {
        const existing = prev[applicationId];
        if (!existing) return prev;
        return {
          ...prev,
          [applicationId]: {
            ...existing,
            application: { ...existing.application, profilePhotoUrl },
          },
        };
      });
    },
    [],
  );

  const handleOpenApplyDashboard = async () => {
    await openBrowserAsync(resolveWebUrl(schoolApplyUrl(_slug)), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  if (isLoading && !data) {
    return <ParentChildrenSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  const isRecordLoading =
    Boolean(selectedChild) && profileLoading && !selectedProfile?.application && !profileError;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ backgroundColor: Story.paper }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={theme.primary}
        />
      }>
      {children.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(350)}>
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              We don&apos;t have any student records from your applications yet. Visit your{' '}
              <Text
                style={[styles.emptyLink, { color: theme.primary }]}
                onPress={() => void handleOpenApplyDashboard()}>
                application dashboard
              </Text>{' '}
              to get started.
            </Text>
          </StoryCard>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.duration(350)}>
            <ParentChildrenStoryHeader learners={children} selectedChild={selectedChild} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(40).duration(350)}>
            <ParentChildrenLearnerStrip
              learners={children}
              selectedApplicationId={selectedApplicationId ?? children[0].applicationId}
              onSelect={handleSelectChild}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            {isRecordLoading ? (
              <ParentChildrenOverviewSkeleton />
            ) : selectedChild ? (
              <ParentChildrenOverview
                child={selectedChild}
                profile={selectedProfile}
                onOpenRecordSection={openRecordSection}
              />
            ) : null}
          </Animated.View>

          {isRecordLoading ? <ParentChildrenRecordSkeleton /> : null}

          {selectedProfile?.application && selectedChild ? (
            <View
              onLayout={(event) => {
                recordOffsetYRef.current = event.nativeEvent.layout.y;
              }}>
              <ParentChildRecordWorkspace
                childOverview={selectedChild}
                application={selectedProfile.application}
                checklist={selectedProfile.checklist}
                assignedTeachers={selectedProfile.assignedTeachers}
                organizationId={organizationId}
                activeSection={recordSection}
                onSectionChange={setRecordSection}
                onPhotoUpdated={(profilePhotoUrl) =>
                  handlePhotoUpdated(selectedChild.applicationId, profilePhotoUrl)
                }
                workspaceRef={recordWorkspaceRef}
              />
            </View>
          ) : null}

          {profileError ? (
            <Text style={[styles.profileError, { color: theme.alert }]}>{profileError}</Text>
          ) : null}
        </>
      )}
    </ScrollView>
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
    gap: Spacing.four,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
  profileError: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
