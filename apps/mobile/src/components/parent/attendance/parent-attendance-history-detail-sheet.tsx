import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '@/lib/attendance/attendance-actions';
import {
  formatAttendanceHistoryFullDateLabel,
  formatAttendanceHistoryTime,
  resolveAttendanceHistoryActor,
} from '@/lib/attendance/attendance-history-display';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentAttendanceHistoryDetailSheetProps = {
  visible: boolean;
  entry: AttendanceHistoryEntry | null;
  studentName: string;
  onClose: () => void;
};

function recordedAtTime(entry: AttendanceHistoryEntry): string | null {
  if (entry.status === 'present') return formatAttendanceHistoryTime(entry.presentAt);
  if (entry.status === 'absent') return formatAttendanceHistoryTime(entry.absentAt);
  return formatAttendanceHistoryTime(entry.pickedUpAt);
}

function DetailField({
  theme,
  label,
  children,
}: {
  theme: ReturnType<typeof useParentTheme>;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.detailField, { borderTopColor: theme.line }]}>
      <Text style={[styles.detailKicker, { color: theme.muted }]}>{label}</Text>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

export function ParentAttendanceHistoryDetailSheet({
  visible,
  entry,
  studentName,
  onClose,
}: ParentAttendanceHistoryDetailSheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  if (!entry) return null;

  const fullDateLabel = formatAttendanceHistoryFullDateLabel(entry.date);
  const recordedTime = recordedAtTime(entry);
  const firstName = studentName.trim().split(/\s+/)[0] ?? studentName;
  const recorder = resolveAttendanceHistoryActor(entry);
  const staffRecorder =
    entry.status === 'picked_up' && entry.recordedByName
      ? { name: entry.recordedByName, photoUrl: entry.recordedByPhotoUrl }
      : entry.status !== 'picked_up'
        ? recorder
        : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View
        style={[styles.container, { backgroundColor: theme.white, paddingTop: insets.top }]}
        testID="parent-attendance-history-detail-sheet">
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.primarySoft,
                borderBottomColor: theme.line,
              },
            ]}>
            <View style={styles.heroTop}>
              <StoryChip
                tone={attendanceStatusTone(entry.status)}
                label={attendanceStatusLabel(entry.status)}
              />
              <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.muted} />
              </Pressable>
            </View>
            <StoryDisplayHeading size="section" style={styles.title}>
              {fullDateLabel}
            </StoryDisplayHeading>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {firstName}&apos;s attendance
            </Text>
          </View>

          <View style={styles.details}>
            <DetailField theme={theme} label="Recorded at">
              <Text style={[styles.detailText, { color: theme.ink }]}>
                {recordedTime ?? '—'}
              </Text>
            </DetailField>

            {staffRecorder ? (
              <DetailField theme={theme} label="Recorded by">
                <View style={styles.personRow}>
                  <StudentPhoto
                    name={staffRecorder.name}
                    photoUrl={staffRecorder.photoUrl}
                    size="sm"
                  />
                  <Text style={[styles.detailText, { color: theme.ink }]}>
                    {staffRecorder.name}
                  </Text>
                </View>
              </DetailField>
            ) : null}

            {entry.status === 'picked_up' && entry.pickedUpByName ? (
              <DetailField theme={theme} label="Picked up by">
                <View style={styles.personRow}>
                  <StudentPhoto name={entry.pickedUpByName} photoUrl={null} size="sm" />
                  <Text style={[styles.detailText, { color: theme.ink }]}>
                    {entry.pickedUpByName}
                  </Text>
                </View>
              </DetailField>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  hero: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  details: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
  detailField: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    gap: 6,
  },
  detailKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValue: {
    gap: 6,
  },
  detailText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
