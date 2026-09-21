import { StyleSheet, View, type ViewStyle } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = '#DCE4DC';

export function AttendanceSkeletonBlock({ style }: { style: ViewStyle }) {
  return <SkeletonPulse style={style} backgroundColor={SKELETON_COLOR} />;
}

export function AttendanceStudentRowSkeleton() {
  return (
    <View style={styles.studentRow}>
      <AttendanceSkeletonBlock style={styles.avatar} />
      <View style={styles.studentCopy}>
        <AttendanceSkeletonBlock style={styles.nameBar} />
        <AttendanceSkeletonBlock style={styles.badgeBar} />
      </View>
      <AttendanceSkeletonBlock style={styles.actionPill} />
    </View>
  );
}

export function AttendanceHistoryRowSkeleton() {
  return (
    <View style={styles.historyRow}>
      <AttendanceSkeletonBlock style={styles.historyAvatar} />
      <View style={styles.historyCopy}>
        <AttendanceSkeletonBlock style={styles.historyPrimary} />
        <AttendanceSkeletonBlock style={styles.historySecondary} />
      </View>
      <AttendanceSkeletonBlock style={styles.historyChip} />
    </View>
  );
}

export function AttendanceContactRowSkeleton() {
  return (
    <View style={styles.contactRow}>
      <AttendanceSkeletonBlock style={styles.contactName} />
      <AttendanceSkeletonBlock style={styles.contactMeta} />
    </View>
  );
}

export function AttendanceConfirmButtonSkeleton() {
  return <AttendanceSkeletonBlock style={styles.confirmButton} />;
}

const styles = StyleSheet.create({
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    backgroundColor: Story.white,
    padding: StoryCardPadding,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  studentCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  nameBar: {
    height: 14,
    width: '45%',
    borderRadius: Radius.sm,
  },
  badgeBar: {
    height: 20,
    width: 72,
    borderRadius: Radius.pill,
  },
  actionPill: {
    width: 88,
    height: 40,
    borderRadius: Radius.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Story.line,
  },
  historyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  historyCopy: {
    flex: 1,
    gap: 6,
  },
  historyPrimary: {
    height: 12,
    width: '70%',
    borderRadius: Radius.sm,
  },
  historySecondary: {
    height: 10,
    width: '55%',
    borderRadius: Radius.sm,
  },
  historyChip: {
    width: 64,
    height: 22,
    borderRadius: Radius.pill,
  },
  contactRow: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    backgroundColor: Story.white,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  contactName: {
    height: 14,
    width: '55%',
    borderRadius: Radius.sm,
  },
  contactMeta: {
    height: 11,
    width: '75%',
    borderRadius: Radius.sm,
  },
  confirmButton: {
    height: 52,
    width: '100%',
    borderRadius: Radius.md,
  },
});
