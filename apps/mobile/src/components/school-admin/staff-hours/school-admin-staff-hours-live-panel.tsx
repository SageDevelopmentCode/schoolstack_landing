import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { SchoolAdminStaffHoursSessionRow } from '@/components/school-admin/staff-hours/school-admin-staff-hours-session-row';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatLiveElapsed } from '@/lib/teacher/my-hours/format-duration';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';
import type {
  AdminStaffHoursLiveRow,
  AdminStaffHoursPageData,
} from '@/lib/school-admin/staff-hours/staff-hours-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const TABLE_LINE = '#EDF1ED';
const ACCENT_SKY = '#8ABAC6';
const ACCENT_FOREST = '#315E4F';

type SchoolAdminStaffHoursLivePanelProps = {
  pageData: AdminStaffHoursPageData;
};

function MetricCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  const theme = useParentTheme();
  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <Text style={[styles.metricValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

function LiveElapsedText({ clockInAt }: { clockInAt: string }) {
  const startedAt = useMemo(() => new Date(clockInAt), [clockInAt]);
  const elapsedSeconds = useLiveElapsed(startedAt);
  const theme = useParentTheme();
  return (
    <Text style={[styles.liveElapsed, { color: theme.primary }]}>
      {formatLiveElapsed(elapsedSeconds)}
    </Text>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const theme = useParentTheme();
  return (
    <StoryCard style={styles.sectionCardOuter}>
      <View style={[styles.sectionHeader, { borderBottomColor: TABLE_LINE }]}>
        <Text style={[styles.sectionTitle, { color: theme.ink }]}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </StoryCard>
  );
}

function ActiveSessionRow({ row, isFirst }: { row: AdminStaffHoursLiveRow; isFirst: boolean }) {
  const theme = useParentTheme();
  return (
    <View
      style={[
        styles.activeRow,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: TABLE_LINE },
      ]}>
      <View style={styles.activeMain}>
        <Text style={[styles.staffName, { color: theme.ink }]}>{row.staffName}</Text>
        <Text style={[styles.roleTitle, { color: theme.muted }]}>
          {row.roleTitle ?? '—'}
        </Text>
      </View>
      <View style={styles.activeTimes}>
        <Text style={[styles.clockIn, { color: theme.ink }]}>{row.clockInLabel}</Text>
        <LiveElapsedText clockInAt={row.clockInAt} />
      </View>
    </View>
  );
}

function EmptyCopy({ message }: { message: string }) {
  const theme = useParentTheme();
  return <Text style={[styles.emptyCopy, { color: theme.muted }]}>{message}</Text>;
}

export function SchoolAdminStaffHoursLivePanel({ pageData }: SchoolAdminStaffHoursLivePanelProps) {
  const clockedInCount = String(pageData.liveRows.length);
  const sessionsTodayCount = String(pageData.todayClosedSessions.length);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.metricRow}>
        <MetricCard value={clockedInCount} label="Clocked in now" accent={ACCENT_SKY} />
        <MetricCard value={sessionsTodayCount} label="Sessions today" accent={ACCENT_FOREST} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <SectionCard title="Active sessions">
          {pageData.liveRows.length === 0 ? (
            <EmptyCopy message="No one is clocked in right now." />
          ) : (
            pageData.liveRows.map((row, index) => (
              <ActiveSessionRow key={row.entryId} row={row} isFirst={index === 0} />
            ))
          )}
        </SectionCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <SectionCard title="Today's completed sessions">
          {pageData.todayClosedSessions.length === 0 ? (
            <EmptyCopy message="No completed sessions yet today." />
          ) : (
            pageData.todayClosedSessions.map((session, index) => (
              <SchoolAdminStaffHoursSessionRow
                key={session.id}
                session={session}
                showStaffName
                isFirst={index === 0}
              />
            ))
          )}
        </SectionCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  metricCard: {
    flex: 1,
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  accentBar: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  metricValue: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    fontWeight: '600',
  },
  metricLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCardOuter: {
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 17,
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: StoryCardPadding,
    paddingBottom: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.two,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  activeMain: {
    flex: 1,
    gap: 4,
  },
  staffName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  roleTitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  activeTimes: {
    alignItems: 'flex-end',
    gap: 4,
  },
  clockIn: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  liveElapsed: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
