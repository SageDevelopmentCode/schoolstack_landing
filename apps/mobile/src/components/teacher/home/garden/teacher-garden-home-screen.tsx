import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { closeThen } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GSkeleton } from '@/components/parent/garden/ui';
import { ParentBulletinSheet } from '@/components/parent/home/sheets/parent-bulletin-sheet';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { PortalAccountSheet } from '@/components/portal-account-sheet';
import { ClassroomSnapshotCard } from '@/components/teacher/home/garden/sections/classroom-snapshot-card';
import { ClassroomsCard } from '@/components/teacher/home/garden/sections/classrooms-card';
import { DayTilesCard } from '@/components/teacher/home/garden/sections/day-tiles-card';
import { GuidesCard, SupportCard } from '@/components/teacher/home/garden/sections/help-sections';
import { StudentsCard } from '@/components/teacher/home/garden/sections/students-card';
import { TeacherHeader } from '@/components/teacher/home/garden/sections/teacher-header';
import { TimeClockCard } from '@/components/teacher/home/garden/sections/time-clock-card';
import { TodayListCard } from '@/components/teacher/home/garden/sections/today-list-card';
import { ClassroomRosterSheet } from '@/components/teacher/home/garden/sheets/classroom-roster-sheet';
import { TeacherGuideSheet } from '@/components/teacher/home/garden/sheets/guide-sheet';
import { TeacherNotificationsSheet } from '@/components/teacher/home/garden/sheets/teacher-notifications-sheet';
import {
  useTeacherHomeController,
  type TeacherHomeController,
} from '@/components/teacher/home/garden/use-teacher-home-controller';
import { useTeacherHomeFeedback } from '@/components/teacher/home/garden/use-teacher-home-feedback';
import { teacherStatusLine } from '@/components/teacher/home/garden/teacher-home-status';
import { useTeacherTimeClock } from '@/components/teacher/home/garden/use-teacher-time-clock';
import { resolveTeacherHomeSubTabs } from '@/components/teacher/home/teacher-home-sub-tabs';
import { useAttendance } from '@/contexts/attendance-context';
import type { AttendanceRosterSummary } from '@/lib/attendance/attendance-types';
import { haptic } from '@/lib/haptics';
import { registerPortalMemoryClear } from '@/lib/portal-cache';
import type { TeacherDocGuide } from '@/lib/teacher/teacher-portal-api';
import { submitTeacherSupportRequest } from '@/lib/teacher/teacher-portal-api';

/**
 * The route's AttendanceProvider remounts with the Home tab, so remember today's
 * roster summary per school to keep the status line and badge steady while it reloads.
 */
const lastAttendanceSummary = new Map<string, AttendanceRosterSummary>();
registerPortalMemoryClear(() => lastAttendanceSummary.clear());

function attendanceSummaryKey(organizationId: string): string {
  return `${organizationId}:${new Date().toDateString()}`;
}

function useTopBleed() {
  const insets = useSafeAreaInsets();
  // Tab route: cream runs under the status bar (the layout SafeAreaView pads the top).
  return { marginTop: -insets.top, paddingTop: insets.top };
}

/**
 * Teacher Home (Garden "classroom day"): skeleton → error → ready.
 * Data and routes live in `useTeacherHomeController`; feedback wraps them.
 * Design rules: `.agents/skills/teacher-mobile-garden-design/SKILL.md`.
 */
export function TeacherGardenHomeScreen({ slug }: { slug: string }) {
  const controller = useTeacherHomeController(slug);
  const failed = controller.status === 'error';

  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'error') return <HomeError controller={controller} />;
  if (controller.status !== 'ready' || !controller.data) return <TeacherGardenHomeSkeleton />;
  return <HomeContent controller={controller} />;
}

function HomeContent({ controller }: { controller: TeacherHomeController }) {
  const data = controller.data!;
  const { summary, documentationGuides = [] } = data;
  const { features, slug } = controller;
  const feedback = useTeacherHomeFeedback(controller);
  const bleed = useTopBleed();
  const clock = useTeacherTimeClock({
    organizationId: data.organizationId,
    slug,
    refreshKey: controller.myHoursRefreshKey,
    enabled: features.myHoursEnabled,
  });

  const { summary: liveAttendance, loadRoster } = useAttendance();
  const attendanceKey = attendanceSummaryKey(data.organizationId);
  useEffect(() => {
    if (liveAttendance) lastAttendanceSummary.set(attendanceKey, liveAttendance);
  }, [attendanceKey, liveAttendance]);
  const attendance = features.attendanceEnabled
    ? (liveAttendance ?? lastAttendanceSummary.get(attendanceKey) ?? null)
    : null;

  // Load today's roster once so the status line, tile and Attendance badge have counts.
  const prefetched = useRef(false);
  useEffect(() => {
    if (prefetched.current || !features.attendanceEnabled) return;
    prefetched.current = true;
    queueMicrotask(() => void loadRoster());
  }, [features.attendanceEnabled, loadRoster]);

  const [activeGuide, setActiveGuide] = useState<TeacherDocGuide | null>(null);
  const closeGuide = useCallback(() => setActiveGuide(null), []);
  const { setNotificationUnreadCount } = controller;
  const onMarkedRead = useCallback(() => setNotificationUnreadCount(0), [setNotificationUnreadCount]);

  const tab = controller.homeTab;
  const notMarked = attendance?.notMarkedCount ?? 0;
  const caughtUp = summary.focusItems.length === 0;
  const showSchoolUpdates = !summary.bulletinEnabled && features.messagesEnabled;

  const statusLine = teacherStatusLine({
    focusCount: summary.focusItems.length,
    attendance,
    clock: features.myHoursEnabled && !clock.loading && !clock.loadFailed ? clock : null,
  });

  const refreshControl = (
    <RefreshControl
      refreshing={feedback.pullRefreshing}
      onRefresh={() => void feedback.onPullRefresh()}
      tintColor={Garden.soft}
    />
  );

  return (
    <View style={[styles.root, bleed]} testID="teacher-home-ready">
      <StatusBar style="dark" />

      <View style={styles.top}>
        <TeacherHeader
          displayName={data.userProfile.displayName}
          profilePhotoUrl={controller.heroProfilePhotoUrl}
          bulletinEnabled={summary.bulletinEnabled}
          bulletinPostCount={summary.bulletinPosts.length}
          notificationUnreadCount={controller.notificationUnreadCount}
          statusLine={statusLine}
          lastUpdatedAt={controller.lastUpdatedAt}
          onPressBulletin={() => controller.setBulletinOpen(true)}
          onPressNotifications={() => controller.setNotificationsOpen(true)}
          onPressProfile={() => controller.setAccountSheetOpen(true)}
        />
        <GSegmented
          accessibilityLabel="Home sections"
          items={resolveTeacherHomeSubTabs(features.attendanceEnabled, notMarked)}
          activeId={tab}
          onChange={controller.setHomeTab}
          style={styles.segmented}
        />
      </View>

      <Animated.View key={tab} entering={FadeIn.duration(220)} style={styles.panel}>
        {tab === 'attendance' ? (
          <AttendanceRosterPanel embedded active />
        ) : tab === 'help' ? (
          <ScrollView style={styles.panel} contentContainerStyle={styles.content} refreshControl={refreshControl}>
            <GuidesCard index={0} guides={documentationGuides} onOpenGuide={setActiveGuide} />
            <SupportCard
              index={1}
              slug={slug}
              messagesEnabled={features.messagesEnabled}
              onRequestHelp={() => controller.setSupportSheetOpen(true)}
            />
          </ScrollView>
        ) : (
          <ScrollView style={styles.panel} contentContainerStyle={styles.content} refreshControl={refreshControl}>
            {features.myHoursEnabled ? (
              <TimeClockCard index={0} clock={clock} onOpenMyHours={controller.openMyHours} />
            ) : null}

            <TodayListCard
              index={1}
              items={summary.focusItems}
              onPressItem={(item) => feedback.openFocusItem(item.href)}
            />

            <DayTilesCard
              index={2}
              studentCount={summary.assignedStudents.length}
              messagesUnreadCount={summary.messagesUnreadCount}
              notMarkedCount={attendance ? attendance.notMarkedCount : null}
              showStudents={features.myStudentsEnabled}
              showMessages={features.messagesEnabled}
              showAttendance={features.attendanceEnabled}
              onOpenStudents={() => controller.openTab('my-students')}
              onOpenMessages={() => controller.openTab('messages')}
              onOpenAttendance={feedback.showAttendance}
            />

            <ClassroomSnapshotCard
              index={3}
              schoolName={data.schoolName}
              studentCount={summary.assignedStudents.length}
              myStudentsEnabled={features.myStudentsEnabled}
              nextEvent={summary.upcomingEvents[0] ?? null}
              calendarEnabled={features.calendarEnabled}
              onViewCalendar={() => controller.openTab('calendar')}
              showSchoolUpdates={showSchoolUpdates}
              messagesUnreadCount={summary.messagesUnreadCount}
              onOpenMessages={() => controller.openTab('messages')}
            />

            {features.myStudentsEnabled ? (
              <ClassroomsCard
                index={4}
                classrooms={summary.staffClassrooms}
                onOpenClassroom={controller.setClassroomRoster}
              />
            ) : null}

            {features.myStudentsEnabled ? (
              <StudentsCard
                index={5}
                students={summary.assignedStudents}
                onOpenStudent={controller.openStudentProfile}
                onViewAll={() => controller.openTab('my-students')}
              />
            ) : null}

            <Text style={styles.footerNote}>Need access changes? Contact your school administrator.</Text>
          </ScrollView>
        )}
      </Animated.View>

      <GCelebrate
        active={caughtUp && tab === 'overview' && !controller.isPreview}
        celebrationKey={`teacher-home-caught-up-${slug}`}
      />

      <ParentBulletinSheet
        visible={controller.bulletinOpen}
        posts={summary.bulletinPosts}
        onClose={() => controller.setBulletinOpen(false)}
        onOpenPost={(postId) =>
          closeThen(() => controller.setBulletinOpen(false), () => controller.openBulletinPost(postId))
        }
      />

      <TeacherNotificationsSheet
        visible={controller.notificationsOpen}
        onClose={() => controller.setNotificationsOpen(false)}
        organizationId={data.organizationId}
        slug={slug}
        unreadCount={controller.notificationUnreadCount}
        onMarkedRead={onMarkedRead}
      />

      <TeacherGuideSheet
        guide={activeGuide}
        onClose={closeGuide}
        onStepAction={(href) => feedback.openGuideStep(closeGuide, href)}
      />

      <ClassroomRosterSheet
        visible={controller.classroomRoster !== null}
        classroomName={controller.classroomRoster?.name ?? ''}
        students={controller.classroomRosterStudents}
        onClose={() => controller.setClassroomRoster(null)}
        onSelectStudent={controller.openStudentProfile}
      />

      <PortalSupportRequestSheet
        visible={controller.supportSheetOpen}
        onClose={() => controller.setSupportSheetOpen(false)}
        organizationId={data.organizationId}
        userEmail={data.userProfile.email}
        sourcePagePath={`/teacher/${slug}/home`}
        errorOperation="teacher_portal_support_request_submit"
        onSubmit={submitTeacherSupportRequest}
      />

      <PortalAccountSheet
        visible={controller.accountSheetOpen}
        onClose={() => controller.setAccountSheetOpen(false)}
        displayName={data.userProfile.displayName}
        photoUrl={controller.heroProfilePhotoUrl}
        organizationId={controller.accountOrganizationId}
        slug={slug}
        onProfilePhotoUpdated={feedback.onProfilePhotoUpdated}
      />
    </View>
  );
}

function HomeError({ controller }: { controller: TeacherHomeController }) {
  const bleed = useTopBleed();
  return (
    <View style={[styles.root, bleed]}>
      <StatusBar style="dark" />
      <View style={styles.errorWrap}>
        <GErrorCard
          title="We couldn't load your home"
          message={controller.error ?? 'Failed to load home.'}
          onRetry={() => void controller.reload()}
        />
      </View>
    </View>
  );
}

export function TeacherGardenHomeSkeleton() {
  const bleed = useTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading home"
      contentContainerStyle={styles.skeleton}>
      <StatusBar style="dark" />
      <View style={styles.skTopRow}>
        <GSkeleton style={styles.skDate} />
        <View style={styles.skToolbar}>
          <GSkeleton style={styles.skIcon} />
          <GSkeleton style={styles.skIcon} />
          <GSkeleton style={styles.skIcon} />
        </View>
      </View>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skClock} />
      <View style={styles.skCard}>
        <GSkeleton style={styles.skCardTitle} />
        <GSkeleton style={styles.skRow} />
        <GSkeleton style={styles.skRow} />
      </View>
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, gap: 12, paddingBottom: 4 },
  segmented: { marginBottom: 4 },
  panel: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 14 },
  footerNote: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12.5,
    lineHeight: 18,
    color: Garden.soft,
    textAlign: 'center',
    marginTop: 4,
  },
  errorWrap: { paddingHorizontal: 16, paddingTop: 24 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  skDate: { width: 150, height: 14, borderRadius: 7 },
  skToolbar: { flexDirection: 'row', gap: 8 },
  skIcon: { width: 42, height: 42, borderRadius: 21 },
  skTitle: { width: '78%', height: 30, borderRadius: 10 },
  skStatus: { width: '62%', height: 16, borderRadius: 8 },
  skTabs: { height: 44, borderRadius: 22, marginTop: 4 },
  skClock: { height: 210, borderRadius: 24 },
  skCard: {
    borderRadius: 22,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 18,
    gap: 12,
  },
  skCardTitle: { width: '60%', height: 22, borderRadius: 8 },
  skRow: { height: 52, borderRadius: 12 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
});
