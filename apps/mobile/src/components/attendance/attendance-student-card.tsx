import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import {
  attendanceActionIcon,
  attendancePrimaryActionType,
  attendanceStatusLabel,
  attendanceStatusTone,
  type AttendanceActionType,
} from '@/lib/attendance/attendance-actions';
import type { AttendanceRosterStudent } from '@/lib/attendance/attendance-types';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceStudentCardProps = {
  student: AttendanceRosterStudent;
  saving?: boolean;
  onOpenDetails: () => void;
  onMarkPresent: () => void;
  onRecordPickup: () => void;
};

function compactActionLabel(action: AttendanceActionType): string {
  switch (action) {
    case 'mark_present':
    case 'mark_present_again':
      return 'Present';
    case 'record_pickup':
      return 'Pickup';
    case 'picked_up':
      return 'Picked up';
    case 'mark_absent':
      return 'Absent';
  }
}

export function AttendanceStudentCard({
  student,
  saving = false,
  onOpenDetails,
  onMarkPresent,
  onRecordPickup,
}: AttendanceStudentCardProps) {
  const theme = useParentTheme();
  const studentName = formatEnrolledStudentName(student);
  const studentFirstName = student.firstName.trim() || studentName;
  const primaryActionType = attendancePrimaryActionType(student.attendanceStatus);
  const isPickedUp = student.attendanceStatus === 'picked_up';
  const isPresent = student.attendanceStatus === 'present';
  const disabled = isPickedUp || saving;

  const handlePrimaryAction = () => {
    if (disabled) return;
    if (isPresent) {
      onRecordPickup();
      return;
    }
    onMarkPresent();
  };

  const actionVariant = isPresent ? 'primary' : isPickedUp ? 'disabled' : 'soft';
  const actionColors =
    actionVariant === 'primary'
      ? { backgroundColor: theme.primary, labelColor: Story.white, borderColor: 'transparent' }
      : actionVariant === 'disabled'
        ? { backgroundColor: Story.line, labelColor: theme.muted, borderColor: 'transparent' }
        : { backgroundColor: theme.successBg, labelColor: theme.primary, borderColor: 'transparent' };

  return (
    <StoryCard compact style={styles.card}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${studentFirstName} attendance details`}
          onPress={onOpenDetails}
          style={({ pressed }) => [styles.mainPressable, pressed && styles.pressed]}>
          <StudentPhoto name={studentName} photoUrl={student.profilePhotoUrl} size="row" />
          <View style={styles.copy}>
            <Text style={[styles.name, { color: theme.ink }]} numberOfLines={1}>
              {studentFirstName}
            </Text>
            <StoryChip
              tone={attendanceStatusTone(student.attendanceStatus)}
              label={attendanceStatusLabel(student.attendanceStatus)}
              uppercase={false}
            />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={compactActionLabel(primaryActionType)}
          disabled={disabled}
          onPress={handlePrimaryAction}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: actionColors.backgroundColor,
              borderColor: actionColors.borderColor,
              opacity: disabled ? 0.7 : pressed ? 0.9 : 1,
            },
          ]}>
          {saving ? (
            <ActivityIndicator
              size="small"
              color={actionVariant === 'primary' ? Story.white : theme.primary}
            />
          ) : (
            <>
              <Ionicons
                name={attendanceActionIcon(primaryActionType)}
                size={14}
                color={actionColors.labelColor}
              />
              <Text style={[styles.actionLabel, { color: actionColors.labelColor }]} numberOfLines={1}>
                {compactActionLabel(primaryActionType)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '700',
  },
  actionButton: {
    minWidth: 88,
    maxWidth: 104,
    minHeight: 40,
    borderRadius: StoryRadius.button,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
