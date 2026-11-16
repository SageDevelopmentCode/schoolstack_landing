import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GCelebrate } from '@/components/parent/garden/celebrate';
import { useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GDateField, GInlineBanner, GSwitchRow } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, PORTAL_EASE, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GKicker, GLink, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { errorText } from '@/components/school-admin/garden/admin-sheet';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { AdminEmptyPanel, AdminStatStrip, AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import {
  useStaffHoursController,
  type StaffHoursController,
  type StaffHoursView,
} from '@/components/school-admin/staff-hours/garden/use-staff-hours-controller';
import { formatClockLabel } from '@/components/story/story-time-field';
import { galleryPhotoDateToDate } from '@/lib/school-gallery/gallery-photo-date';
import type {
  AdminStaffHoursAdjustmentRequest,
  AdminStaffHoursAdjustmentSession,
  AdminStaffHoursSessionRow,
} from '@/lib/school-admin/staff-hours/staff-hours-types';
import { formatHoursMinutes, formatLiveElapsed, formatShortWeekdayDate, parseDateKey } from '@/lib/teacher/my-hours/format-duration';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';

type Props = { organizationId: string; slug: string };

/** "3 clocked in now · 2 requests waiting" — built only from data. */
export function staffHoursStatusLine(clockedIn: number, pending: number): string {
  const parts = [clockedIn > 0 ? `${clockedIn} clocked in now` : 'No one clocked in right now'];
  if (pending > 0) parts.push(`${pending} request${pending === 1 ? '' : 's'} waiting`);
  return parts.join(' · ');
}

function sessionLabel(sessions: AdminStaffHoursAdjustmentSession[]): string {
  if (sessions.length === 0) return 'No sessions';
  return sessions.map((session) => `${formatClockLabel(session.clockIn)} – ${formatClockLabel(session.clockOut)}`).join('; ');
}

const REQUEST_STATUS: Record<AdminStaffHoursAdjustmentRequest['status'], { label: string; tone: 'success' | 'alert' | 'neutral' | 'warning' }> = {
  approved: { label: 'Approved', tone: 'success' },
  denied: { label: 'Denied', tone: 'alert' },
  superseded: { label: 'Superseded', tone: 'neutral' },
  pending: { label: 'Pending', tone: 'warning' },
};

/** School admin › More › Staff hours (Garden). */
export function SchoolAdminStaffHoursScreen(props: Props) {
  const controller = useStaffHoursController(props);
  if (controller.status === 'loading') return <StaffHoursSkeleton view={controller.view} />;
  if (controller.status === 'error') return <StaffHoursError controller={controller} />;
  return <StaffHoursContent controller={controller} />;
}

function useStaffHoursFeedback(controller: StaffHoursController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [caughtUp, setCaughtUp] = useState(false);
  const { review, setRequireApproval, setView, applySummary } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Staff hours',
    id: 'admin-staff-hours-refresh',
  });

  const changeView = useCallback(
    (next: StaffHoursView) => {
      setView(next);
    },
    [setView],
  );

  const decide = useCallback(
    (request: AdminStaffHoursAdjustmentRequest, decision: 'approved' | 'denied') => {
      if (readOnly) return notifyReadOnly();
      const day = formatShortWeekdayDate(parseDateKey(request.workDate));
      const remaining = controller.pendingRequests.filter((entry) => entry.id !== request.id).length;
      void action
        .run(() => review(request.id, decision), {
          key: `staff-hours-review-${request.id}`,
          retry: true,
          success: {
            title: decision === 'approved' ? 'Hours approved' : 'Request denied',
            description:
              decision === 'approved'
                ? `${request.staffName}'s ${day} hours are updated.${remaining > 0 ? ` ${remaining} more waiting.` : ''}`
                : `${request.staffName}'s ${day} hours stay as they were.${remaining > 0 ? ` ${remaining} more waiting.` : ''}`,
          },
          error: (err) => ({
            title: 'Could not review the adjustment',
            description: `${errorText(err, 'Could not review the adjustment.')} The request is still pending.`,
          }),
        })
        .then((ok) => {
          if (ok && remaining === 0) setCaughtUp(true);
        });
    },
    [action, controller.pendingRequests, notifyReadOnly, readOnly, review],
  );

  const toggleApproval = useCallback(
    (next: boolean) => {
      if (readOnly) return notifyReadOnly();
      void action.run(() => setRequireApproval(next), {
        key: 'staff-hours-settings',
        retry: true,
        success: {
          title: next ? 'Hour adjustments now wait for approval.' : 'Hour adjustments now save immediately.',
          description: next ? 'Teacher changes will show up under Requests.' : 'Teacher changes apply right away.',
        },
        error: (err) => ({
          title: 'Could not save settings',
          description: `${errorText(err, 'Could not save staff hours settings.')} The setting is back to how it was.`,
        }),
      });
    },
    [action, notifyReadOnly, readOnly, setRequireApproval],
  );

  const apply = useCallback(async () => {
    await applySummary();
    action.toast.info('Summary updated', {
      id: 'staff-hours-apply',
      description: `${controller.staffFilterLabel} · ${controller.summaryFrom || 'start'} to ${controller.summaryTo || 'today'}`,
      durationMs: 2600,
    });
  }, [action.toast, applySummary, controller.staffFilterLabel, controller.summaryFrom, controller.summaryTo]);

  return { action, pullRefreshing, onPullRefresh, changeView, decide, toggleApproval, apply, caughtUp };
}

function StaffHoursContent({ controller }: { controller: StaffHoursController }) {
  const feedback = useStaffHoursFeedback(controller);
  const bleed = useAdminTopBleed();
  const pageData = controller.pageData!;
  const { view, pendingRequests } = controller;

  return (
    <View style={[styles.root, bleed]} testID="school-admin-staff-hours-page">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Staff hours"
          accentWord="hours"
          statusLine={staffHoursStatusLine(pageData.liveRows.length, pendingRequests.length)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="staff-hours-status-line"
        />
        <GSegmented<StaffHoursView>
          accessibilityLabel="Staff hours views"
          compact
          scrollable
          items={[
            { id: 'live', label: 'Live', icon: 'time-outline', testID: 'staff-hours-tab-live' },
            { id: 'summary', label: 'Summary', icon: 'bar-chart-outline', testID: 'staff-hours-tab-summary' },
            { id: 'requests', label: 'Requests', icon: 'clipboard-outline', badge: pendingRequests.length, testID: 'staff-hours-tab-requests' },
            { id: 'settings', label: 'Settings', icon: 'settings-outline', testID: 'staff-hours-tab-settings' },
          ]}
          activeId={view}
          onChange={feedback.changeView}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }>
        {controller.error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't refresh staff hours"
            description={`${controller.error} Showing what we already have.`}
            action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
          />
        ) : null}
        <Animated.View key={view} entering={FadeIn.duration(220).easing(PORTAL_EASE)} style={styles.panel}>
          {view === 'live' ? (
            <LivePanel controller={controller} feedback={feedback} />
          ) : view === 'summary' ? (
            <SummaryPanel controller={controller} feedback={feedback} />
          ) : view === 'requests' ? (
            <View style={styles.panel} testID="staff-hours-requests-panel">
              <RequestsCard title="Pending" emptyMessage="No hour adjustments are waiting for approval." requests={pendingRequests} actions controller={controller} feedback={feedback} />
              <RequestsCard title="History" emptyMessage="Approved and denied adjustments will show up here." requests={controller.historyRequests} controller={controller} feedback={feedback} index={1} />
            </View>
          ) : (
            <GCard title="Approvals" testID="staff-hours-settings-panel">
              <GSwitchRow
                label="Require approval for hour adjustments"
                meta="When this is on, teacher changes stay pending until you approve them."
                value={pageData.adjustmentsRequireApproval !== false}
                disabled={controller.savingSettings}
                onValueChange={feedback.toggleApproval}
              />
              {controller.savingSettings ? <Text style={styles.saving}>Saving…</Text> : null}
            </GCard>
          )}
        </Animated.View>
      </ScrollView>

      <GSheet
        visible={controller.staffPickerOpen}
        onClose={controller.closeStaffPicker}
        title="Staff"
        subtitle="Filter the summary by one person"
        accessibilityLabel="Close staff filter">
        {[{ id: '', name: 'All staff' }, ...pageData.staffOptions].map((option, index) => {
          const selected = controller.staffFilter === option.id;
          return (
            <AdminWorkRow
              key={option.id || 'all'}
              divider={index > 0}
              title={option.name}
              accessibilityLabel={`${option.name}${selected ? ', selected' : ''}`}
              leading={option.id ? <AdminInitialsAvatar name={option.name} size="sm" /> : undefined}
              icon={option.id ? undefined : 'people-outline'}
              onPress={() => {
                controller.setStaffFilter(option.id);
                controller.closeStaffPicker();
              }}
              trailing={selected ? <Ionicons name="checkmark-circle" size={22} color={Garden.forest} /> : <View />}
            />
          );
        })}
      </GSheet>

      <GCelebrate active={feedback.caughtUp} celebrationKey={`admin-staff-hours-caught-up-${controller.organizationId}`} />
    </View>
  );
}

type Feedback = ReturnType<typeof useStaffHoursFeedback>;

function LiveElapsedChip({ clockInAt }: { clockInAt: string }) {
  const startedAt = useMemo(() => new Date(clockInAt), [clockInAt]);
  const elapsed = useLiveElapsed(startedAt);
  return <GChip label={formatLiveElapsed(elapsed)} tone="success" icon="time-outline" />;
}

function LivePanel({ controller, feedback }: { controller: StaffHoursController; feedback: Feedback }) {
  const pageData = controller.pageData!;
  return (
    <>
      <AdminStatStrip
        live={pageData.liveRows.length > 0}
        stats={[
          { label: 'Clocked in now', value: String(pageData.liveRows.length) },
          { label: 'Sessions today', value: String(pageData.todayClosedSessions.length) },
        ]}
      />
      <RequestsCard
        title="Pending requests"
        emptyMessage="No hour adjustments are waiting."
        requests={controller.pendingRequests}
        actions
        controller={controller}
        feedback={feedback}
      />
      <GCard index={1} title="Active sessions" action={pageData.liveRows.length > 0 ? <GChip label={`${pageData.liveRows.length} in`} tone="success" /> : null}>
        {pageData.liveRows.length === 0 ? (
          <Text style={styles.empty}>No one is clocked in right now.</Text>
        ) : (
          pageData.liveRows.map((row, index) => (
            <AdminWorkRow
              key={row.entryId}
              divider={index > 0}
              title={row.staffName}
              meta={`${row.roleTitle ?? '—'} · in at ${row.clockInLabel}`}
              leading={<AdminInitialsAvatar name={row.staffName} size="sm" />}
              trailing={<LiveElapsedChip clockInAt={row.clockInAt} />}
            />
          ))
        )}
      </GCard>
      <GCard index={2} title="Today's completed sessions">
        {pageData.todayClosedSessions.length === 0 ? (
          <Text style={styles.empty}>No completed sessions yet today.</Text>
        ) : (
          pageData.todayClosedSessions.map((session, index) => <SessionRow key={session.id} session={session} showStaffName divider={index > 0} />)
        )}
      </GCard>
    </>
  );
}

function SessionRow({ session, showStaffName = false, divider = false }: { session: AdminStaffHoursSessionRow; showStaffName?: boolean; divider?: boolean }) {
  return (
    <View
      style={[styles.session, divider && styles.divider]}
      accessible
      accessibilityLabel={`${showStaffName ? `${session.staffName}. ` : ''}In ${session.clockInLabel}, out ${session.clockOutLabel}, ${formatHoursMinutes(session.minutes)}`}>
      {showStaffName ? (
        <Text style={styles.sessionName} numberOfLines={1}>
          {session.staffName}
        </Text>
      ) : null}
      <View style={styles.sessionCols}>
        <View style={styles.sessionCell}>
          <GKicker>In</GKicker>
          <Text style={styles.sessionValue}>{session.clockInLabel}</Text>
        </View>
        <View style={styles.sessionCell}>
          <GKicker>Out</GKicker>
          <Text style={styles.sessionValue}>{session.clockOutLabel}</Text>
        </View>
        <View style={[styles.sessionCell, styles.sessionDuration]}>
          <GKicker>Duration</GKicker>
          <Text style={styles.sessionTotal}>{formatHoursMinutes(session.minutes)}</Text>
        </View>
      </View>
    </View>
  );
}

function RequestsCard({
  title,
  emptyMessage,
  requests,
  actions = false,
  controller,
  feedback,
  index = 0,
}: {
  title: string;
  emptyMessage: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  actions?: boolean;
  controller: StaffHoursController;
  feedback: Feedback;
  index?: number;
}) {
  const accent = useGardenAccent();
  const busy = controller.reviewingId;
  return (
    <GCard index={index} title={title} action={actions && requests.length > 0 ? <GChip label={`${requests.length} waiting`} tone="warning" /> : null}>
      {requests.length === 0 ? (
        actions ? (
          <View style={styles.caughtUp}>
            <Ionicons name="checkmark-circle" size={20} color={Garden.forest} />
            <Text style={styles.caughtUpText}>{emptyMessage}</Text>
          </View>
        ) : (
          <Text style={styles.empty}>{emptyMessage}</Text>
        )
      ) : (
        requests.map((request, i) => {
          const status = REQUEST_STATUS[request.status];
          const saving = busy === request.id;
          const flash = feedback.action.flashKey === `staff-hours-review-${request.id}`;
          return (
            <View key={request.id} style={[styles.request, i > 0 && styles.divider, flash && styles.flash]}>
              <View style={styles.requestTop}>
                <AdminInitialsAvatar name={request.staffName} size="sm" />
                <View style={styles.requestCopy}>
                  <Text style={styles.requestName}>{request.staffName}</Text>
                  <Text style={styles.requestDate}>{formatShortWeekdayDate(parseDateKey(request.workDate))}</Text>
                </View>
                <GChip label={status.label} tone={status.tone} />
              </View>
              <View style={styles.compare}>
                <Text style={styles.compareLabel}>Current</Text>
                <Text style={styles.compareValue}>{sessionLabel(request.previousSessions)}</Text>
                <Text style={styles.compareLabel}>Proposed</Text>
                <Text style={[styles.compareValue, styles.compareNew]}>{sessionLabel(request.proposedSessions)}</Text>
              </View>
              {request.note.trim() ? <Text style={styles.note}>“{request.note.trim()}”</Text> : null}
              {actions ? (
                <View style={styles.requestActions}>
                  <GPressable
                    testID={`staff-hours-approve-${request.id}`}
                    accessibilityLabel={saving ? 'Saving…' : `Approve ${request.staffName}'s hours`}
                    accessibilityState={{ busy: saving, disabled: busy != null }}
                    disabled={busy != null}
                    haptic="press"
                    onPress={() => feedback.decide(request, 'approved')}
                    style={[styles.approve, { backgroundColor: accent.clay }, busy != null && !saving && styles.dim]}>
                    {saving ? <ActivityIndicator size="small" color={Garden.white} /> : <Ionicons name="checkmark" size={16} color={Garden.white} />}
                    <Text style={styles.approveLabel}>{saving ? 'Saving…' : 'Approve'}</Text>
                  </GPressable>
                  <GPressable
                    testID={`staff-hours-deny-${request.id}`}
                    accessibilityLabel={`Deny ${request.staffName}'s request`}
                    accessibilityState={{ disabled: busy != null }}
                    disabled={busy != null}
                    onPress={() => feedback.decide(request, 'denied')}
                    style={[styles.deny, busy != null && styles.dim]}>
                    <Text style={styles.denyLabel}>Deny</Text>
                  </GPressable>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </GCard>
  );
}

function SummaryPanel({ controller, feedback }: { controller: StaffHoursController; feedback: Feedback }) {
  const pageData = controller.pageData!;
  const minTo = useMemo(() => galleryPhotoDateToDate(controller.summaryFrom) ?? undefined, [controller.summaryFrom]);
  const maxFrom = useMemo(() => galleryPhotoDateToDate(controller.summaryTo) ?? undefined, [controller.summaryTo]);
  const totalMinutes = pageData.summaryRows.reduce((sum, row) => sum + row.totalMinutes, 0);

  return (
    <>
      <GCard title="Range">
        <View style={styles.form}>
          <View style={styles.dateRow}>
            <View style={styles.dateCell}>
              <GDateField label="From" value={controller.summaryFrom} onChange={controller.setSummaryFrom} maximumDate={maxFrom} />
            </View>
            <View style={styles.dateCell}>
              <GDateField label="To" value={controller.summaryTo} onChange={controller.setSummaryTo} minimumDate={minTo} />
            </View>
          </View>
          <View style={styles.staffField}>
            <Text style={styles.fieldLabel}>Staff</Text>
            <GPressable
              accessibilityLabel={`Staff: ${controller.staffFilterLabel}. Change`}
              onPress={controller.openStaffPicker}
              style={styles.staffTrigger}>
              <Ionicons name="people-outline" size={18} color={Garden.ink65} />
              <Text style={styles.staffTriggerText}>{controller.staffFilterLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={Garden.ink60} />
            </GPressable>
          </View>
          <GToyButton
            label={controller.applying ? 'Loading…' : 'Apply'}
            icon="checkmark"
            loading={controller.applying}
            disabled={controller.applying}
            onPress={() => void feedback.apply()}
          />
        </View>
      </GCard>

      <AdminStatStrip
        stats={[
          { label: 'Total hours', value: formatHoursMinutes(totalMinutes) },
          { label: 'Staff', value: String(pageData.summaryRows.length) },
          { label: 'Sessions', value: String(pageData.sessions.length) },
        ]}
      />

      <GCard index={1} title="Hours by staff">
        {pageData.summaryRows.length === 0 ? (
          <AdminEmptyPanel icon="time-outline" title="No hours in this range." body="Pick different dates, then tap Apply." />
        ) : (
          pageData.summaryRows.map((row, index) => {
            const expanded = controller.expandedStaffId === row.staffMemberId;
            const sessions = expanded ? controller.sessionsForStaff(row.staffMemberId) : [];
            return (
              <View key={row.staffMemberId} style={index > 0 ? styles.divider : null}>
                <AdminWorkRow
                  title={row.staffName}
                  meta={`${row.roleTitle ?? '—'} · ${row.daysWorked}d · ${row.sessionCount} sessions`}
                  leading={<AdminInitialsAvatar name={row.staffName} size="sm" />}
                  accessibilityLabel={`${row.staffName}, ${formatHoursMinutes(row.totalMinutes)}. ${expanded ? 'Hide' : 'Sessions'}`}
                  onPress={() => controller.setExpandedStaffId(expanded ? null : row.staffMemberId)}
                  trailing={
                    <View style={styles.totalWrap}>
                      <Text style={styles.total}>{formatHoursMinutes(row.totalMinutes)}</Text>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Garden.ink60} />
                    </View>
                  }
                />
                {expanded ? (
                  <View style={styles.expanded}>
                    {sessions.length === 0 ? (
                      <Text style={styles.empty}>No sessions in range.</Text>
                    ) : (
                      sessions.map((session, i) => <SessionRow key={session.id} session={session} divider={i > 0} />)
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </GCard>
    </>
  );
}

function StaffHoursError({ controller }: { controller: StaffHoursController }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap} testID="school-admin-staff-hours-page">
      <StatusBar style="dark" />
      <AdminTabHeader title="Staff hours" accentWord="hours" />
      <GErrorCard
        title="We couldn't load staff hours"
        message={controller.error ?? 'Failed to load staff hours.'}
        onRetry={() => void controller.retryInitial()}
      />
    </ScrollView>
  );
}

function StaffHoursSkeleton({ view }: { view: StaffHoursView }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading staff hours"
      testID={`school-admin-staff-hours-loading-${view}`}
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skStrip} />
      <GSkeleton style={styles.skCard} />
      <GSkeleton style={styles.skCard} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40, gap: 14 },
  panel: { gap: 14 },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft, paddingVertical: 6 },
  saving: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, marginTop: 6 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  flash: { backgroundColor: Garden.mint },
  dim: { opacity: 0.5 },
  caughtUp: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: Garden.mint },
  caughtUpText: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 14, color: Garden.forestDeep },
  request: { paddingVertical: 12, gap: 10, borderRadius: 12 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requestCopy: { flex: 1, minWidth: 0 },
  requestName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  requestDate: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  compare: { borderRadius: 14, backgroundColor: Garden.paper, padding: 12, gap: 2 },
  compareLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12, color: Garden.soft, marginTop: 2 },
  compareValue: { fontFamily: GardenFonts.bodyBold, fontSize: 14, color: Garden.ink, fontVariant: ['tabular-nums'] },
  compareNew: { color: Garden.forestDeep },
  note: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, fontStyle: 'italic' },
  requestActions: { flexDirection: 'row', gap: 10 },
  approve: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approveLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.white },
  deny: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.ink },
  session: { paddingVertical: 10, gap: 6 },
  sessionName: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.ink },
  sessionCols: { flexDirection: 'row', gap: 8 },
  sessionCell: { flex: 1, gap: 2 },
  sessionDuration: { alignItems: 'flex-end' },
  sessionValue: { fontFamily: GardenFonts.bodyBold, fontSize: 14, color: Garden.ink, fontVariant: ['tabular-nums'] },
  sessionTotal: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink, fontVariant: ['tabular-nums'] },
  form: { gap: 14 },
  dateRow: { gap: 14 },
  dateCell: {},
  staffField: { gap: 6 },
  fieldLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  staffTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.paper,
    paddingHorizontal: 14,
  },
  staffTriggerText: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 15, color: Garden.ink },
  totalWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  total: { fontFamily: GardenFonts.display, fontSize: 18, color: Garden.ink, fontVariant: ['tabular-nums'] },
  expanded: { marginLeft: 46, paddingBottom: 6 },
  errorWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '55%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '70%', height: 16, borderRadius: 8 },
  skTabs: { height: 40, borderRadius: 20 },
  skStrip: { height: 70, borderRadius: 16 },
  skCard: { height: 180, borderRadius: 22 },
});
