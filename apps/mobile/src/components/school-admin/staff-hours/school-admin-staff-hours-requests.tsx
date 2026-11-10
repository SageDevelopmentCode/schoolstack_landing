import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { formatClockLabel } from '@/components/story/story-time-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { postStaffHoursAdjustmentReview } from '@/lib/school-admin/staff-hours/staff-hours-api';
import type {
  AdminStaffHoursAdjustmentRequest,
  AdminStaffHoursAdjustmentSession,
  AdminStaffHoursPageData,
} from '@/lib/school-admin/staff-hours/staff-hours-types';
import { formatShortWeekdayDate, parseDateKey } from '@/lib/teacher/my-hours/format-duration';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const TABLE_LINE = '#EDF1ED';

type StaffHoursRequestListProps = {
  organizationId: string;
  title: string;
  emptyMessage: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  showActions: boolean;
  onPageData: (pageData: AdminStaffHoursPageData) => void;
};

function sessionLabel(sessions: AdminStaffHoursAdjustmentSession[]): string {
  if (sessions.length === 0) return 'No sessions';
  return sessions
    .map((session) => `${formatClockLabel(session.clockIn)} – ${formatClockLabel(session.clockOut)}`)
    .join('; ');
}

function statusLabel(status: AdminStaffHoursAdjustmentRequest['status']): string {
  if (status === 'approved') return 'Approved';
  if (status === 'denied') return 'Denied';
  return 'Pending';
}

function statusTone(status: AdminStaffHoursAdjustmentRequest['status']) {
  if (status === 'approved') return 'success' as const;
  if (status === 'denied') return 'alert' as const;
  return 'warning' as const;
}

export function StaffHoursRequestList({
  organizationId,
  title,
  emptyMessage,
  requests,
  showActions,
  onPageData,
}: StaffHoursRequestListProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [busyId, setBusyId] = useState<string | null>(null);

  const review = async (requestId: string, decision: 'approved' | 'denied') => {
    if (busyId) return;
    setBusyId(requestId);
    try {
      const next = await postStaffHoursAdjustmentReview({
        organizationId,
        requestId,
        decision,
      });
      onPageData(next);
      Alert.alert(decision === 'approved' ? 'Hours approved.' : 'Request denied.');
    } catch (error) {
      Alert.alert(
        'Could not review the adjustment',
        error instanceof Error ? error.message : 'Could not review the adjustment.',
      );
      void reportError('staff_hours.review_adjustment', error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <StoryCard style={styles.card}>
      <View style={[styles.header, { borderBottomColor: TABLE_LINE }]}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      </View>
      {requests.length === 0 ? (
        <Text style={[styles.empty, { color: theme.muted }]}>{emptyMessage}</Text>
      ) : (
        requests.map((request, index) => (
          <View
            key={request.id}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: TABLE_LINE },
            ]}>
            <View style={styles.rowTitle}>
              <Text style={[styles.name, { color: theme.ink }]}>{request.staffName}</Text>
              <StoryChip
                label={statusLabel(request.status)}
                tone={statusTone(request.status)}
                uppercase={false}
              />
            </View>
            <Text style={[styles.meta, { color: theme.muted }]}>
              {formatShortWeekdayDate(parseDateKey(request.workDate))}
            </Text>
            <Text style={[styles.times, { color: theme.ink }]}>
              Current: {sessionLabel(request.previousSessions)}
            </Text>
            <Text style={[styles.times, { color: theme.ink }]}>
              Proposed: {sessionLabel(request.proposedSessions)}
            </Text>
            {request.note.trim() ? (
              <Text style={[styles.note, { color: theme.muted }]}>{request.note}</Text>
            ) : null}
            {showActions ? (
              <View style={styles.actions}>
                <StoryButton
                  label={busyId === request.id ? 'Saving…' : 'Approve'}
                  loading={busyId === request.id}
                  disabled={busyId != null}
                  onPress={() => void review(request.id, 'approved')}
                  style={styles.actionButton}
                  testID={`staff-hours-approve-${request.id}`}
                />
                <StoryButton
                  label="Deny"
                  variant="outline"
                  disabled={busyId != null}
                  onPress={() => void review(request.id, 'denied')}
                  style={styles.actionButton}
                  testID={`staff-hours-deny-${request.id}`}
                />
              </View>
            ) : null}
          </View>
        ))
      )}
    </StoryCard>
  );
}

export function StaffHoursRequestsPanel({
  organizationId,
  requests,
  onPageData,
}: {
  organizationId: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  onPageData: (pageData: AdminStaffHoursPageData) => void;
}) {
  const pending = requests.filter((request) => request.status === 'pending');
  const history = requests.filter((request) => request.status !== 'pending');

  return (
    <View style={styles.stack} testID="staff-hours-requests-panel">
      <StaffHoursRequestList
        organizationId={organizationId}
        title="Pending"
        emptyMessage="No hour adjustments are waiting for approval."
        requests={pending}
        showActions
        onPageData={onPageData}
      />
      <StaffHoursRequestList
        organizationId={organizationId}
        title="History"
        emptyMessage="Approved and denied adjustments will show up here."
        requests={history}
        showActions={false}
        onPageData={onPageData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.four,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.three,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 17,
    fontWeight: '600',
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.four,
  },
  row: {
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.four,
    gap: 4,
  },
  rowTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  times: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
