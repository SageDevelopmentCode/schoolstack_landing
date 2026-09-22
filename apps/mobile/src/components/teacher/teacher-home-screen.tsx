import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import { TeacherHomeBulletinSheet } from '@/components/teacher/home/teacher-home-bulletin-sheet';
import { TeacherHomeClassroomCard } from '@/components/teacher/home/teacher-home-classroom-card';
import { TeacherHomeClassroomRosterSheet } from '@/components/teacher/home/teacher-home-classroom-roster-sheet';
import { PortalNeedHelpCard } from '@/components/portal/portal-need-help-card';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { TeacherActivityNotificationsSheet } from '@/components/teacher/teacher-activity-notifications-sheet';
import { TeacherHomeHeader } from '@/components/teacher/home/teacher-home-header';
import { TeacherHomeSchoolUpdatesCard } from '@/components/teacher/home/teacher-home-school-updates-card';
import { TeacherHomeSnapshotCard } from '@/components/teacher/home/teacher-home-snapshot-card';
import { TeacherHomeStartHereCard } from '@/components/teacher/home/teacher-home-start-here-card';
import { TeacherHomeStudentCard } from '@/components/teacher/home/teacher-home-student-card';
import { TeacherHomeSkeleton } from '@/components/teacher/home/teacher-home-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { filterStudentsByClassroomName } from '@/lib/teacher/teacher-home-utils';
import {
  resolveTeacherFocusHref,
  teacherBulletinDetailRoute,
  teacherStudentDetailRoute,
  teacherTabRoute,
} from '@/lib/teacher/teacher-nav';
import { fetchTeacherActivityNotificationUnreadCount } from '@/lib/teacher/fetch-activity-notifications';
import { submitTeacherSupportRequest } from '@/lib/teacher/teacher-portal-api';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import type { StaffClassroomOption, TeacherDashboardFocusItem } from '@/lib/teacher/teacher-portal-api';
import { usePortalPreview } from '@/lib/portal-preview-gating';

const MAX_STUDENT_CARDS = 6;

type TeacherHomeTab = 'overview' | 'attendance';

const TEACHER_HOME_TABS = [
  { id: 'overview' as const, label: 'Overview' },
  { id: 'attendance' as const, label: 'Attendance', icon: 'clipboard-outline' as const },
];

type TeacherHomeScreenProps = {
  slug: string;
};

export function TeacherHomeScreen({ slug }: TeacherHomeScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useTeacherHome();

  const [homeTab, setHomeTab] = useState<TeacherHomeTab>('overview');
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [classroomRoster, setClassroomRoster] = useState<StaffClassroomOption | null>(null);

  useAuthRequiredRedirect(error);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const loadNotificationUnreadCount = useCallback(async () => {
    if (!data?.organizationId) return;
    try {
      const count = await fetchTeacherActivityNotificationUnreadCount(
        data.organizationId,
        slug,
      );
      setNotificationUnreadCount(count);
    } catch {
      // Keep the last known count on transient errors.
    }
  }, [data?.organizationId, slug]);

  useFocusEffect(
    useCallback(() => {
      void loadNotificationUnreadCount();
    }, [loadNotificationUnreadCount]),
  );

  const classroomRosterStudents = useMemo(() => {
    if (!classroomRoster || !data) return [];
    return filterStudentsByClassroomName(
      data.summary.assignedStudents,
      classroomRoster.name,
    );
  }, [classroomRoster, data]);

  const handleFocusItem = (item: TeacherDashboardFocusItem) => {
    const route = resolveTeacherFocusHref(slug, item.href);
    if (route) {
      router.push(route);
    }
  };

  const openStudentProfile = (student: AdminEnrolledStudentSummary) => {
    setClassroomRoster(null);
    router.push(teacherStudentDetailRoute(slug, student.id));
  };

  if (isLoading && !data) {
    return <TeacherHomeSkeleton />;
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

  const { summary, features } = data;
  const attendanceEnabled = isTeacherFeatureEnabled(features, 'attendance');
  const myStudentsEnabled = isTeacherFeatureEnabled(features, 'my_students');
  const messagesEnabled = isTeacherFeatureEnabled(features, 'messages');
  const calendarEnabled = isTeacherFeatureEnabled(features, 'calendar');
  const studentCount = summary.assignedStudents.length;
  const visibleStudents = summary.assignedStudents.slice(0, MAX_STUDENT_CARDS);
  const hasMoreStudents = summary.assignedStudents.length > MAX_STUDENT_CARDS;
  const showSchoolUpdates = !summary.bulletinEnabled && messagesEnabled;
  const nextEvent = summary.upcomingEvents[0] ?? null;

  const header = (
    <TeacherHomeHeader
      displayName={data.userProfile.displayName}
      bulletinEnabled={summary.bulletinEnabled}
      bulletinPostCount={summary.bulletinPosts.length}
      notificationUnreadCount={notificationUnreadCount}
      onOpenBulletin={() => setBulletinOpen(true)}
      onPressHelp={() => setSupportSheetOpen(true)}
      onPressNotifications={() => setNotificationsOpen(true)}
    />
  );

  const overviewBody = (
    <>
      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <TeacherHomeStartHereCard
          focusItems={summary.focusItems}
          onPressItem={handleFocusItem}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <TeacherHomeSnapshotCard
          schoolName={data.schoolName}
          studentCount={studentCount}
          myStudentsEnabled={myStudentsEnabled}
          nextEvent={nextEvent}
          calendarEnabled={calendarEnabled}
          onViewCalendar={() => router.replace(teacherTabRoute(slug, 'calendar'))}
        />
      </Animated.View>

      {showSchoolUpdates ? (
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <TeacherHomeSchoolUpdatesCard
            messagesUnreadCount={summary.messagesUnreadCount}
            onOpenMessages={() => router.replace(teacherTabRoute(slug, 'messages'))}
          />
        </Animated.View>
      ) : null}

      {myStudentsEnabled && summary.staffClassrooms.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.section}>
          <StoryDisplayHeading size="section">Your classrooms</StoryDisplayHeading>
          <View style={styles.cardList}>
            {summary.staffClassrooms.map((classroom, index) => (
              <TeacherHomeClassroomCard
                key={classroom.id}
                classroom={classroom}
                index={index}
                onViewStudents={() => setClassroomRoster(classroom)}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}

      {myStudentsEnabled ? (
        <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.section}>
          <StoryDisplayHeading size="section">Your students</StoryDisplayHeading>
          {studentCount === 0 ? (
            <View style={[styles.emptyCard, { borderColor: theme.line }]}>
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                No learners assigned yet — your administrator can link students to you from the
                staff directory.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.cardList}>
                {visibleStudents.map((student, index) => (
                  <TeacherHomeStudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    onViewProfile={() => openStudentProfile(student)}
                  />
                ))}
              </View>
              {hasMoreStudents ? (
                <StoryTextLink
                  label={`View all ${studentCount} students`}
                  onPress={() => router.replace(teacherTabRoute(slug, 'my-students'))}
                />
              ) : null}
            </>
          )}
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(240).duration(350)}>
        <PortalNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
      </Animated.View>

      <Text style={[styles.footerNote, { color: theme.muted }]}>
        Need access changes? Contact your school administrator.
      </Text>
    </>
  );

  const sheets = (
    <>
      <TeacherHomeBulletinSheet
        visible={bulletinOpen}
        posts={summary.bulletinPosts}
        onClose={() => setBulletinOpen(false)}
        onOpenPost={(postId) => {
          setBulletinOpen(false);
          router.push(teacherBulletinDetailRoute(slug, postId));
        }}
      />

      <TeacherActivityNotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        organizationId={data.organizationId}
        slug={slug}
        onMarkedRead={() => setNotificationUnreadCount(0)}
      />

      <PortalSupportRequestSheet
        visible={supportSheetOpen}
        onClose={() => setSupportSheetOpen(false)}
        organizationId={data.organizationId}
        userEmail={data.userProfile.email}
        sourcePagePath={`/teacher/${slug}/home`}
        errorOperation="teacher_portal_support_request_submit"
        onSubmit={submitTeacherSupportRequest}
      />

      <TeacherHomeClassroomRosterSheet
        visible={classroomRoster !== null}
        classroomName={classroomRoster?.name ?? ''}
        students={classroomRosterStudents}
        onClose={() => setClassroomRoster(null)}
        onSelectStudent={openStudentProfile}
      />
    </>
  );

  if (attendanceEnabled) {
    return (
      <View style={styles.screen}>
        <StatusBar style={isPreview ? 'dark' : 'light'} />
        <Animated.View entering={FadeInDown.duration(350)}>{header}</Animated.View>

        <SubmissionStoryTabBar
          tabs={TEACHER_HOME_TABS}
          activeTabId={homeTab}
          onChange={(tabId) => setHomeTab(tabId as TeacherHomeTab)}
        />

        {homeTab === 'overview' ? (
          <ScrollView
            style={styles.tabScroll}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void refresh()}
                tintColor={theme.primary}
              />
            }>
            {overviewBody}
          </ScrollView>
        ) : (
          <AttendanceRosterPanel embedded active />
        )}

        {sheets}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style={isPreview ? 'dark' : 'light'} />
      <Animated.View entering={FadeInDown.duration(350)}>{header}</Animated.View>

      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }>
        {overviewBody}
      </ScrollView>

      {sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  tabScroll: {
    flex: 1,
    backgroundColor: Story.paper,
  },
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
  cardList: {
    gap: Spacing.three,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: Story.white,
    padding: Spacing.four,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  footerNote: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
