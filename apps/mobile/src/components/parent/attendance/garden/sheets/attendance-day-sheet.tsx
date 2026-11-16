import { StyleSheet, Text, View } from 'react-native';

import { AttendanceDayTimeline, AttendanceStatusChip } from '@/components/parent/attendance/garden/sections/attendance-sections';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden } from '@/components/parent/garden/tokens';
import { ChildThumb, GKicker, GOutlineButton, gText } from '@/components/parent/garden/ui';
import { formatAttendanceHistoryFullDateLabel } from '@/lib/attendance/attendance-history-display';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import {
  attendanceRecordedAtTime,
  attendanceRelativeDayLabel,
  attendanceStaffRecorder,
} from '@/lib/parent/parent-attendance-garden';

function Person({ label, name, photoUrl }: { label: string; name: string; photoUrl: string | null }) {
  return (
    <View style={styles.field} accessible accessibilityLabel={`${label}: ${name}`}>
      <GKicker>{label}</GKicker>
      <View style={styles.person}>
        <ChildThumb name={name} photoUrl={photoUrl} size={40} />
        <Text style={gText.itemTitle}>{name}</Text>
      </View>
    </View>
  );
}

/** One day's attendance: status, timeline, who recorded it, and newer/older paging. */
export function AttendanceDaySheet({
  entry,
  firstName,
  newer,
  older,
  onNavigate,
  onClose,
}: {
  entry: AttendanceHistoryEntry | null;
  firstName: string;
  newer: AttendanceHistoryEntry | null;
  older: AttendanceHistoryEntry | null;
  onNavigate: (entry: AttendanceHistoryEntry) => void;
  onClose: () => void;
}) {
  const recorder = entry ? attendanceStaffRecorder(entry) : null;
  const recordedAt = entry ? attendanceRecordedAtTime(entry) : null;

  return (
    <GSheet
      visible={entry !== null}
      onClose={onClose}
      accessibilityLabel="Close attendance details"
      title={entry ? formatAttendanceHistoryFullDateLabel(entry.date) : ''}
      subtitle={
        entry
          ? `${attendanceRelativeDayLabel(entry.date)} · ${firstName}'s attendance`
          : `${firstName}'s attendance`
      }
      headerAside={entry ? <AttendanceStatusChip status={entry.status} /> : null}
      footer={
        newer || older ? (
          <View style={styles.pager}>
            {newer ? (
              <GOutlineButton
                label="‹ Newer day"
                accessibilityLabel={`Newer day, ${attendanceRelativeDayLabel(newer.date)}`}
                onPress={() => onNavigate(newer)}
              />
            ) : (
              <View />
            )}
            {older ? (
              <GOutlineButton
                label="Older day"
                icon="chevron-forward"
                accessibilityLabel={`Older day, ${attendanceRelativeDayLabel(older.date)}`}
                onPress={() => onNavigate(older)}
              />
            ) : null}
          </View>
        ) : undefined
      }>
      {entry ? (
        <View testID="parent-attendance-history-detail-sheet" style={styles.body}>
          <View style={styles.card}>
            <AttendanceDayTimeline entry={entry} />
          </View>
          <View style={styles.card}>
            <View style={styles.field}>
              <GKicker>Recorded at</GKicker>
              <Text style={gText.itemTitle}>{recordedAt ?? '—'}</Text>
            </View>
            {recorder ? (
              <Person label="Recorded by" name={recorder.name} photoUrl={recorder.photoUrl} />
            ) : null}
            {entry.status === 'picked_up' && entry.pickedUpByName ? (
              <Person label="Picked up by" name={entry.pickedUpByName} photoUrl={null} />
            ) : null}
          </View>
        </View>
      ) : null}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  card: {
    backgroundColor: Garden.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 16,
    gap: 14,
  },
  field: { gap: 6 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pager: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
