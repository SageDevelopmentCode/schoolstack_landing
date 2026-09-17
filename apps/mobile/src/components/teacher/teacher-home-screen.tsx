import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TeacherHomeBulletinSheet } from '@/components/teacher/home/teacher-home-bulletin-sheet';
import { TeacherHomeClassroomCard } from '@/components/teacher/home/teacher-home-classroom-card';
import { TeacherHomeClassroomRosterSheet } from '@/components/teacher/home/teacher-home-classroom-roster-sheet';
import { PortalNeedHelpCard } from '@/components/portal/portal-need-help-card';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
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
import { submitTeacherSupportRequest } from '@/lib/teacher/teacher-portal-api';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import type { StaffClassroomOption, TeacherDashboardFocusItem } from '@/lib/teacher/teacher-portal-api';

const MAX_STUDENT_CARDS = 6;

type TeacherHomeScreenProps = {
  slug: string;
};

export function TeacherHomeScreen({ slug }: TeacherHomeScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useTeacherHome();

  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [classroomRoster, setClassroomRoster] = useState<StaffClassroomOption | null>(null);

  useAuthRequiredRedirect(error);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

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
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) return null;

  const { summary, features } = data;
  const myStudentsEnabled = isTeacherFeatureEnabled(features, 'my_students');
  const messagesEnabled = isTeacherFeatureEnabled(features, 'messages');
  const calendarEnabled = isTeacherFeatureEnabled(features, 'calendar');
  const studentCount = summary.assignedStudents.length;
  const visibleStudents = summary.assignedStudents.slice(0, MAX_STUDENT_CARDS);
  const hasMoreStudents = summary.assignedStudents.length > MAX_STUDENT_CARDS;
  const showSchoolUpdates = !summary.bulletinEnabled && messagesEnabled;
  const nextEvent = summary.upcomingEvents[0] ?? null;

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
          <TeacherHomeHeader
            schoolName={data.schoolName}
            displayName={data.userProfile.displayName}
            roleTitle={data.roleTitle}
            portalRole={data.portalRole}
            bulletinEnabled={summary.bulletinEnabled}
            bulletinPostCount={summary.bulletinPosts.length}
            onOpenBulletin={() => setBulletinOpen(true)}
          />
        </Animated.View>

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
      </ScrollView>

      <TeacherHomeBulletinSheet
        visible={bulletinOpen}
        posts={summary.bulletinPosts}
        onClose={() => setBulletinOpen(false)}
        onOpenPost={(postId) => {
          setBulletinOpen(false);
          router.push(teacherBulletinDetailRoute(slug, postId));
        }}
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
