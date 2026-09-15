import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatStudentClassroomLabel } from '@/lib/school-admin/format-student-classroom-label';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const UNASSIGNED_BORDER = '#E8C58A';
const UNASSIGNED_TEXT = '#A26B22';

type StudentClassroomAssignButtonProps = {
  classroomNames: string[];
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  showFieldLabel?: boolean;
};

export function StudentClassroomAssignButton({
  classroomNames,
  onPress,
  disabled = false,
  label = 'Classroom',
  showFieldLabel = false,
}: StudentClassroomAssignButtonProps) {
  const theme = useParentTheme();
  const isUnassigned = classroomNames.length === 0;
  const classroomLabel = formatStudentClassroomLabel(classroomNames);
  const accessibilityLabel = `Assign classrooms. ${classroomLabel}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: isUnassigned ? UNASSIGNED_BORDER : theme.line,
          backgroundColor: theme.white,
        },
        pressed && !disabled && { opacity: 0.85 },
        disabled && styles.disabled,
      ]}>
      {showFieldLabel ? (
        <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      ) : null}
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            { color: isUnassigned ? UNASSIGNED_TEXT : theme.ink },
          ]}
          numberOfLines={1}>
          {classroomLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isUnassigned ? UNASSIGNED_BORDER : theme.muted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    gap: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  value: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
