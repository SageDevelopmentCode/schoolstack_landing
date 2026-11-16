import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, PANEL_TINTS } from '@/components/parent/garden/tokens';
import { GCard, GChip, GKicker, GLink } from '@/components/parent/garden/ui';
import { AdminStatStrip } from '@/components/school-admin/garden/admin-ui';
import { staffShortDisplayNameFromFullName } from '@/lib/format-person-name';
import type {
  AdminDashboardStaffHoursClockedInRow,
  AdminDashboardStaffHoursCompletedRow,
  AdminDashboardStaffHoursToday,
} from '@/lib/school-admin/dashboard-summary-types';
import { formatLiveElapsed } from '@/lib/teacher/my-hours/format-duration';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <View style={[styles.avatar, { backgroundColor: PANEL_TINTS[index % PANEL_TINTS.length] }]}>
      <Text style={styles.avatarText}>{initialsOf(name)}</Text>
    </View>
  );
}

function ClockedInRow({ row, index }: { row: AdminDashboardStaffHoursClockedInRow; index: number }) {
  const startedAt = useMemo(() => new Date(row.clockInAt), [row.clockInAt]);
  const elapsed = formatLiveElapsed(useLiveElapsed(startedAt));
  const name = staffShortDisplayNameFromFullName(row.staffName);
  return (
    <View
      style={[styles.row, index > 0 && styles.rowDivider]}
      accessible
      accessibilityLabel={`${name}, clocked in ${row.clockInLabel}, ${elapsed} so far`}>
      <Avatar name={row.staffName} index={index} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.rowMeta}>In {row.clockInLabel}</Text>
      </View>
      <GChip label={elapsed} tone="success" icon="time-outline" />
    </View>
  );
}

function CompletedRow({ row, index }: { row: AdminDashboardStaffHoursCompletedRow; index: number }) {
  const name = staffShortDisplayNameFromFullName(row.staffName);
  return (
    <View
      style={[styles.row, index > 0 && styles.rowDivider]}
      accessible
      accessibilityLabel={`${name}, ${row.clockInLabel} to ${row.clockOutLabel}, ${row.durationLabel}`}>
      <Avatar name={row.staffName} index={index + 2} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.rowMeta}>
          {row.clockInLabel} – {row.clockOutLabel}
        </Text>
      </View>
      <Text style={styles.duration}>{row.durationLabel}</Text>
    </View>
  );
}

/** Staff hours · Today as a live people list: stat strip, "Clocked in" with live timers, "Completed today". */
export function StaffHoursCard({
  data,
  onPressOpen,
  index = 0,
}: {
  data: AdminDashboardStaffHoursToday;
  onPressOpen: () => void;
  index?: number;
}) {
  return (
    <GCard
      title="Staff hours · Today"
      index={index}
      testID="dashboard-staff-hours"
      action={<GLink label="Open" accessibilityLabel="Open Staff hours" onPress={onPressOpen} />}>
      <View style={styles.body}>
        <AdminStatStrip
          live={data.clockedInCount > 0}
          stats={[
            { label: 'Clocked in now', value: String(data.clockedInCount) },
            { label: 'Sessions done', value: String(data.completedSessionCount) },
            { label: 'Logged today', value: data.totalHoursLabel },
          ]}
        />

        <View style={styles.group}>
          <View style={styles.groupHead}>
            <GKicker>Clocked in</GKicker>
            {data.clockedIn.length > 0 ? <GChip label={String(data.clockedIn.length)} tone="success" /> : null}
          </View>
          {data.clockedIn.length === 0 ? (
            <Text style={styles.empty}>No one is clocked in right now.</Text>
          ) : (
            data.clockedIn.map((row, i) => <ClockedInRow key={row.staffMemberId} row={row} index={i} />)
          )}
        </View>

        <View style={styles.group}>
          <View style={styles.groupHead}>
            <GKicker>Completed today</GKicker>
            {data.completedToday.length > 0 ? (
              <GChip label={String(data.completedSessionCount)} tone="neutral" />
            ) : null}
          </View>
          {data.completedToday.length === 0 ? (
            <Text style={styles.empty}>No completed sessions yet today.</Text>
          ) : (
            data.completedToday.map((row, i) => (
              <CompletedRow
                key={`${row.staffMemberId}-${row.clockInLabel}-${row.clockOutLabel}`}
                row={row}
                index={i}
              />
            ))
          )}
          {data.hiddenCompletedCount > 0 ? (
            <GLink
              label={`+${data.hiddenCompletedCount} more on Staff hours`}
              onPress={onPressOpen}
              style={styles.more}
            />
          ) : null}
        </View>
        <Text style={styles.srOnly} accessibilityElementsHidden={false}>
          {data.summaryLine}
        </Text>
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  group: { gap: 4 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 6 },
  rowDivider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
  rowCopy: { flex: 1, minWidth: 0, gap: 1 },
  rowTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  rowMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
    fontVariant: ['tabular-nums'],
  },
  duration: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.forest,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
    backgroundColor: Garden.paper,
    borderRadius: 12,
    padding: 12,
  },
  more: { alignSelf: 'flex-start', marginTop: 6 },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
