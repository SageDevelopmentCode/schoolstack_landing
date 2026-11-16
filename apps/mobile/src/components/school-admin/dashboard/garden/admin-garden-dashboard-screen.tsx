import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';
import { PortalAccountSheet } from '@/components/portal-account-sheet';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GErrorCard, GOutlineButton, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { AdminActivityNotificationsSheet } from '@/components/school-admin/dashboard/admin-activity-notifications-sheet';
import { AdminSupportRequestSheet } from '@/components/school-admin/dashboard/admin-support-request-sheet';
import { ActivityCard } from '@/components/school-admin/dashboard/garden/sections/activity';
import { AdminHeader } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import {
  FocusQueueCard,
  HelpCard,
  KpiCard,
  QuickActionsCard,
  SetupStepsCard,
  SignalCard,
} from '@/components/school-admin/dashboard/garden/sections/overview-sections';
import { StaffHoursCard } from '@/components/school-admin/dashboard/garden/sections/staff-hours-card';
import { WhatsNewCard, WhatsNewSheet } from '@/components/school-admin/dashboard/garden/sections/whats-new';
import {
  useAdminDashboardController,
  type AdminDashboardController,
} from '@/components/school-admin/dashboard/garden/use-admin-dashboard-controller';
import { useAdminDashboardFeedback } from '@/components/school-admin/dashboard/garden/use-admin-dashboard-feedback';
import { useAttendance } from '@/contexts/attendance-context';
import type { AttendanceRosterSummary } from '@/lib/attendance/attendance-types';
import { haptic } from '@/lib/haptics';
import { registerPortalMemoryClear } from '@/lib/portal-cache';
import type { MobileAdminDashboardSummary } from '@/lib/school-admin/dashboard-summary-types';

type DashboardTab = 'overview' | 'attendance';

/**
 * The route's AttendanceProvider remounts on every tab switch, so remember today's roster
 * summary per school to keep the status line and Attendance badge steady while it reloads.
 */
const lastAttendanceSummary = new Map<string, AttendanceRosterSummary>();
registerPortalMemoryClear(() => lastAttendanceSummary.clear());

function attendanceSummaryKey(organizationId: string): string {
  return `${organizationId}:${new Date().toDateString()}`;
}

/** One line under the greeting, built only from today's data (web `todayStatusLine`). */
export function dashboardStatusLine(
  summary: MobileAdminDashboardSummary,
  attendance: AttendanceRosterSummary | null,
): string {
  const parts: string[] = [];
  const focus = summary.focusItems.length;
  parts.push(
    focus > 0 ? `${focus} item${focus === 1 ? ' needs' : 's need'} you today` : 'Nothing urgent today',
  );
  if (attendance && attendance.totalStudents > 0) {
    parts.push(
      attendance.notMarkedCount > 0
        ? `${attendance.notMarkedCount} of ${attendance.totalStudents} not marked yet`
        : `${attendance.presentCount + attendance.pickedUpCount} of ${attendance.totalStudents} present`,
    );
  }
  return parts.join(' · ');
}

type AdminGardenDashboardScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

/**
 * School admin Dashboard (Garden "command center"): skeleton → error → ready.
 * Data and routes live in `useAdminDashboardController`; feedback wraps them.
 * Design rules: `.agents/skills/admin-mobile-garden-design/SKILL.md`.
 */
export function AdminGardenDashboardScreen(props: AdminGardenDashboardScreenProps) {
  const controller = useAdminDashboardController(props);
  const failed = controller.status === 'error';

  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <AdminGardenDashboardSkeleton />;
  if (controller.status === 'error') return <DashboardError controller={controller} />;
  return <DashboardContent controller={controller} />;
}

function useTopBleed() {
  const insets = useSafeAreaInsets();
  // Tab route: cream runs under the status bar (the layout SafeAreaView pads the top).
  return { marginTop: -insets.top, paddingTop: insets.top };
}

function DashboardContent({ controller }: { controller: AdminDashboardController }) {
  const summary = controller.summary!;
  const feedback = useAdminDashboardFeedback(controller);
  const { summary: liveAttendanceSummary, loadRoster } = useAttendance();
  const attendanceKey = attendanceSummaryKey(controller.organizationId);
  useEffect(() => {
    if (liveAttendanceSummary) lastAttendanceSummary.set(attendanceKey, liveAttendanceSummary);
  }, [attendanceKey, liveAttendanceSummary]);
  const attendanceSummary = liveAttendanceSummary ?? lastAttendanceSummary.get(attendanceKey) ?? null;
  const bleed = useTopBleed();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const prefetched = useRef(false);
  const { setActivityUnreadCount } = controller;

  // Load today's roster once so the status line and the Attendance badge have counts.
  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    queueMicrotask(() => void loadRoster());
  }, [loadRoster]);

  const onMarkedRead = useCallback(() => setActivityUnreadCount(0), [setActivityUnreadCount]);

  const notMarked = attendanceSummary?.notMarkedCount ?? 0;
  const caughtUp = summary.focusItems.length === 0;

  return (
    <View style={[styles.root, bleed]} testID="school-admin-dashboard-ready">
      <StatusBar style="dark" />

      <View style={styles.top}>
        <AdminHeader
          firstName={controller.viewer.firstName}
          displayName={controller.viewer.displayName}
          profilePhotoUrl={controller.profilePhotoUrl}
          unreadCount={controller.activityUnreadCount}
          statusLine={dashboardStatusLine(summary, attendanceSummary)}
          lastUpdatedAt={controller.lastUpdatedAt}
          onPressBulletin={controller.openBulletin}
          onPressNotifications={() => controller.setActivitySheetOpen(true)}
          onPressProfile={() => controller.setAccountSheetOpen(true)}
        />
        <GSegmented<DashboardTab>
          accessibilityLabel="Dashboard sections"
          items={[
            { id: 'overview', label: 'Overview', icon: 'grid-outline', testID: 'dashboard-tab-overview' },
            {
              id: 'attendance',
              label: 'Attendance',
              icon: 'clipboard-outline',
              badge: notMarked > 0 ? notMarked : undefined,
              testID: 'dashboard-tab-attendance',
            },
          ]}
          activeId={tab}
          onChange={setTab}
          style={styles.segmented}
        />
      </View>

      <Animated.View key={tab} entering={FadeIn.duration(220)} style={styles.panel}>
        {tab === 'overview' ? (
          <ScrollView
            style={styles.panel}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={feedback.pullRefreshing}
                onRefresh={() => void feedback.onPullRefresh()}
                tintColor={Garden.soft}
              />
            }>
            <FocusQueueCard index={0} items={summary.focusItems} onPressItem={(item) => feedback.openHref(item.href)} />

            {!summary.setupComplete ? (
              <SetupStepsCard
                index={1}
                setupStatus={summary.setupStatus}
                stripeChecking={controller.stripeChecking}
                onPressStep={feedback.openSetupStep}
              />
            ) : null}

            <SignalCard index={2} signal={summary.signal} onPress={controller.openAdmissions} />

            {summary.metrics.length > 0 ? (
              <KpiCard index={3} metrics={summary.metrics} onPressMetric={feedback.openMetric} />
            ) : null}

            {controller.staffHoursEnabled && summary.staffHoursToday ? (
              <StaffHoursCard
                index={4}
                data={summary.staffHoursToday}
                onPressOpen={controller.openStaffHours}
              />
            ) : null}

            <ActivityCard
              index={5}
              items={summary.recentActivity}
              onPressItem={(item) => feedback.openHref(item.href)}
              onViewAll={() => controller.setActivitySheetOpen(true)}
            />

            <QuickActionsCard
              index={6}
              actions={summary.quickActions}
              onPressLink={(quick) => feedback.openHref(quick.href)}
              onCopyApplyLink={(quick) => void feedback.copyApplyLink(quick)}
              pendingKey={feedback.action.pendingKey}
              flashKey={feedback.action.flashKey}
            />

            <WhatsNewCard
              index={7}
              announcements={summary.featureAnnouncements}
              onViewMore={() => controller.setAnnouncementsSheetOpen(true)}
            />

            <HelpCard index={8} onPress={() => controller.setSupportSheetOpen(true)} />
          </ScrollView>
        ) : (
          <AttendanceRosterPanel embedded active />
        )}
      </Animated.View>

      <GCelebrate
        active={caughtUp && !controller.isPreview}
        celebrationKey={`admin-dashboard-caught-up-${controller.slug}`}
      />

      <AdminActivityNotificationsSheet
        visible={controller.activitySheetOpen}
        onClose={() => controller.setActivitySheetOpen(false)}
        organizationId={controller.organizationId}
        slug={controller.slug}
        unreadCount={controller.activityUnreadCount}
        onMarkedRead={onMarkedRead}
      />

      <WhatsNewSheet
        visible={controller.announcementsSheetOpen}
        onClose={() => controller.setAnnouncementsSheetOpen(false)}
        announcements={summary.featureAnnouncements}
      />

      <AdminSupportRequestSheet
        visible={controller.supportSheetOpen}
        onClose={() => controller.setSupportSheetOpen(false)}
        organizationId={controller.organizationId}
        slug={controller.slug}
        userEmail={controller.userEmail}
        sourcePagePath={`/school-admin/${controller.slug}/dashboard`}
      />

      <PortalAccountSheet
        visible={controller.accountSheetOpen}
        onClose={() => controller.setAccountSheetOpen(false)}
        displayName={controller.viewer.displayName}
        emailSubtitle={controller.viewer.isPreview ? controller.viewer.email : undefined}
        photoUrl={controller.profilePhotoUrl}
        organizationId={controller.organizationId}
        slug={controller.slug}
        onProfilePhotoUpdated={feedback.onProfilePhotoUpdated}
      />
    </View>
  );
}

function DashboardError({ controller }: { controller: AdminDashboardController }) {
  const feedback = useAdminDashboardFeedback(controller);
  const accent = useGardenAccent();
  const bleed = useTopBleed();
  const message = controller.error ?? 'Failed to load dashboard.';

  return (
    <View style={[styles.root, bleed]}>
      <StatusBar style="dark" />
      <View style={styles.errorWrap}>
        {controller.accessDenied ? (
          <GCard title="This account isn't a school admin here">
            <Text style={styles.errorCopy}>{message}</Text>
            <Text style={[styles.errorHint, { color: accent.clayDeep }]}>
              If you work here as staff, the staff portal has your classes and tools.
            </Text>
            <View style={styles.errorActions}>
              <GToyButton
                label={feedback.staffPortalPending ? 'Opening…' : 'Open staff portal'}
                loading={feedback.staffPortalPending}
                onPress={() => void feedback.openStaffPortal()}
              />
              <GOutlineButton label="Try again" icon="refresh" onPress={() => void controller.reload()} />
            </View>
          </GCard>
        ) : (
          <GErrorCard
            title="We couldn't load your dashboard"
            message={message}
            onRetry={() => void controller.reload()}
          />
        )}
      </View>
    </View>
  );
}

export function AdminGardenDashboardSkeleton() {
  const bleed = useTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading dashboard"
      contentContainerStyle={styles.skeleton}>
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
      <View style={styles.skCard}>
        <GSkeleton style={styles.skCardTitle} />
        <GSkeleton style={styles.skLead} />
        <GSkeleton style={styles.skRow} />
        <GSkeleton style={styles.skRow} />
      </View>
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
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
  errorWrap: { paddingHorizontal: 16, paddingTop: 24 },
  errorCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  errorHint: { fontFamily: GardenFonts.bodyBold, fontSize: 14, lineHeight: 20, marginTop: 8 },
  errorActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  skDate: { width: 150, height: 14, borderRadius: 7 },
  skToolbar: { flexDirection: 'row', gap: 8 },
  skIcon: { width: 42, height: 42, borderRadius: 21 },
  skTitle: { width: '78%', height: 30, borderRadius: 10 },
  skStatus: { width: '62%', height: 16, borderRadius: 8 },
  skTabs: { height: 44, borderRadius: 22, marginTop: 4 },
  skCard: {
    borderRadius: 22,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 18,
    gap: 12,
  },
  skCardTitle: { width: '70%', height: 22, borderRadius: 8 },
  skLead: { height: 110, borderRadius: 18 },
  skRow: { height: 48, borderRadius: 12 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
});
