import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { formatLiveElapsed } from '@/lib/teacher/my-hours/format-duration';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';
import { staffShortDisplayNameFromFullName } from '@/lib/format-person-name';
import type {
  AdminDashboardStaffHoursCompletedRow,
  AdminDashboardStaffHoursToday,
} from '@/lib/school-admin/dashboard-summary-types';

const BORDER = '#E9EFEA';
const CARD_BG = '#FFFDF8';
const ACCENT_SKY = '#8ABAC6';
const ACCENT_FOREST = '#315E4F';
const ACCENT_GOLD = '#E4BD65';

type AdminStaffHoursTodayCardProps = {
  data: AdminDashboardStaffHoursToday;
  onPressOpen: () => void;
};

function StaffHoursSnapshotStat({
  value,
  label,
  accentColor,
}: {
  value: string;
  label: string;
  accentColor: string;
}) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.statTile,
        {
          backgroundColor: theme.surface,
          borderColor: BORDER,
        },
      ]}>
      <View style={[styles.statAccentBar, { backgroundColor: accentColor }]} />
      <ThemedText type="title" style={[styles.statValue, { color: theme.textPrimary }]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={2}>
        {label}
      </ThemedText>
    </View>
  );
}

function StaffHoursClockedInRow({
  staffName,
  clockInLabel,
  clockInAt,
  isFirst,
}: {
  staffName: string;
  clockInLabel: string;
  clockInAt: string;
  isFirst: boolean;
}) {
  const theme = useAdminTheme();
  const startedAt = useMemo(() => new Date(clockInAt), [clockInAt]);
  const elapsedSeconds = useLiveElapsed(startedAt);

  return (
    <View
      style={[
        styles.dataRow,
        !isFirst && styles.dataRowBorder,
        !isFirst && { borderTopColor: BORDER },
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }} numberOfLines={1}>
        {staffShortDisplayNameFromFullName(staffName)}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
        {clockInLabel}
        {' · '}
        <ThemedText type="smallBold" style={{ color: ACCENT_FOREST }}>
          {formatLiveElapsed(elapsedSeconds)}
        </ThemedText>
      </ThemedText>
    </View>
  );
}

function TableHeaderCell({
  label,
  flex,
  align = 'left',
}: {
  label: string;
  flex: number;
  align?: 'left' | 'right';
}) {
  const theme = useAdminTheme();
  return (
    <View style={[styles.tableCell, { flex }]}>
      <ThemedText
        type="badge"
        style={[
          styles.tableHeaderText,
          {
            color: theme.textTertiary,
            textAlign: align,
          },
        ]}>
        {label}
      </ThemedText>
    </View>
  );
}

function CompletedTableRow({
  row,
  isFirst,
}: {
  row: AdminDashboardStaffHoursCompletedRow;
  isFirst: boolean;
}) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.tableBodyRow,
        !isFirst && styles.dataRowBorder,
        !isFirst && { borderTopColor: BORDER },
      ]}>
      <View style={[styles.tableCell, styles.staffColumn]}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }} numberOfLines={1}>
          {staffShortDisplayNameFromFullName(row.staffName)}
        </ThemedText>
      </View>
      <View style={[styles.tableCell, styles.timeColumn]}>
        <ThemedText type="small" style={[styles.tableValue, { color: theme.textPrimary }]}>
          {row.clockInLabel}
        </ThemedText>
      </View>
      <View style={[styles.tableCell, styles.timeColumn]}>
        <ThemedText type="small" style={[styles.tableValue, { color: theme.textPrimary }]}>
          {row.clockOutLabel}
        </ThemedText>
      </View>
      <View style={[styles.tableCell, styles.durationColumn]}>
        <ThemedText type="smallBold" style={[styles.tableValue, { color: ACCENT_FOREST, textAlign: 'right' }]}>
          {row.durationLabel}
        </ThemedText>
      </View>
    </View>
  );
}

function StaffHoursCompletedTodayTable({
  rows,
  hiddenCompletedCount,
}: {
  rows: AdminDashboardStaffHoursCompletedRow[];
  hiddenCompletedCount: number;
}) {
  const theme = useAdminTheme();

  if (rows.length === 0) {
    return (
      <ThemedText type="small" style={{ color: theme.textSecondary, paddingVertical: Spacing.two }}>
        No completed sessions yet today.
      </ThemedText>
    );
  }

  return (
    <>
      <View
        style={[
          styles.tableShell,
          {
            backgroundColor: theme.surface,
            borderColor: BORDER,
          },
        ]}>
        <View style={[styles.tableHeaderRow, { borderBottomColor: BORDER }]}>
          <TableHeaderCell label="STAFF" flex={2} />
          <TableHeaderCell label="IN" flex={1} />
          <TableHeaderCell label="OUT" flex={1} />
          <TableHeaderCell label="DURATION" flex={1} align="right" />
        </View>
        {rows.map((row, index) => (
          <CompletedTableRow
            key={`${row.staffMemberId}-${row.clockInLabel}-${row.clockOutLabel}`}
            row={row}
            isFirst={index === 0}
          />
        ))}
      </View>
      {hiddenCompletedCount > 0 ? (
        <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: Spacing.two }}>
          +{hiddenCompletedCount} more on Staff hours
        </ThemedText>
      ) : null}
    </>
  );
}

export function AdminStaffHoursTodayCard({ data, onPressOpen }: AdminStaffHoursTodayCardProps) {
  const theme = useAdminTheme();

  return (
    <AdminCard
      style={[
        styles.card,
        {
          backgroundColor: CARD_BG,
          borderColor: BORDER,
        },
      ]}>
      <View style={styles.headerBlock}>
        <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
          STAFF HOURS · TODAY
        </ThemedText>
        <ThemedText type="title" style={{ color: theme.textPrimary, marginTop: Spacing.one }}>
          Staff hours · Today
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Staff hours"
          onPress={onPressOpen}
          style={({ pressed }) => [styles.openCta, pressed && { opacity: 0.85 }]}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Open Staff hours
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={theme.accent} />
        </Pressable>
      </View>

      <View style={styles.metricsRow}>
        <StaffHoursSnapshotStat
          value={String(data.clockedInCount)}
          label="Clocked in now"
          accentColor={ACCENT_SKY}
        />
        <StaffHoursSnapshotStat
          value={String(data.completedSessionCount)}
          label="Sessions done"
          accentColor={ACCENT_FOREST}
        />
        <StaffHoursSnapshotStat
          value={data.totalHoursLabel}
          label="Logged today"
          accentColor={ACCENT_GOLD}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Clocked in
        </ThemedText>
        {data.clockedIn.length === 0 ? (
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
            No one is clocked in right now.
          </ThemedText>
        ) : (
          <View
            style={[
              styles.listShell,
              {
                backgroundColor: theme.surface,
                borderColor: BORDER,
              },
            ]}>
            {data.clockedIn.map((row, index) => (
              <StaffHoursClockedInRow
                key={row.staffMemberId}
                staffName={row.staffName}
                clockInLabel={row.clockInLabel}
                clockInAt={row.clockInAt}
                isFirst={index === 0}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Completed today
        </ThemedText>
        <View style={{ marginTop: Spacing.two }}>
          <StaffHoursCompletedTodayTable
            rows={data.completedToday}
            hiddenCompletedCount={data.hiddenCompletedCount}
          />
        </View>
      </View>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
  },
  headerBlock: {
    gap: Spacing.one,
  },
  openCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginTop: Spacing.two,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    minWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    paddingLeft: Spacing.three + 4,
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: Spacing.one,
  },
  section: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  listShell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
  },
  tableShell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeaderText: {
    letterSpacing: 0.5,
    fontSize: 10,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  tableCell: {
    minWidth: 0,
  },
  staffColumn: {
    flex: 2,
  },
  timeColumn: {
    flex: 1,
  },
  durationColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tableValue: {
    fontFamily: StoryFonts.body,
    fontVariant: ['tabular-nums'],
  },
  dataRow: {
    paddingVertical: Spacing.two,
  },
  dataRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
