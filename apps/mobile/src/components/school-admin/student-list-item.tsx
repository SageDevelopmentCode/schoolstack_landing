import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AdminListCard, AdminListCardPressable } from '@/components/school-admin/admin-list-card';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  formatAssignedTeachersLabel,
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { Radius, Spacing } from '@/constants/theme';

type StudentListItemProps = {
  student: AdminEnrolledStudentSummary;
  onPress: (student: AdminEnrolledStudentSummary) => void;
  onPressTeacher: (student: AdminEnrolledStudentSummary) => void;
};

export function StudentListItem({ student, onPress, onPressTeacher }: StudentListItemProps) {
  const theme = useAdminTheme();
  const studentName = formatEnrolledStudentName(student);
  const gradeLabel = formatStudentGrade(student.grade);
  const programLabel =
    student.programNames.length > 0 ? student.programNames[0] : 'No program';
  const teacherLabel = formatAssignedTeachersLabel(student.assignedTeachers);
  const hasTeacher = student.assignedTeachers.length > 0;

  return (
    <AdminListCard
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            hasTeacher
              ? `Teachers: ${teacherLabel}. Tap to change.`
              : 'No teachers assigned. Tap to assign teachers.'
          }
          onPress={() => onPressTeacher(student)}
          style={({ pressed }) => [
            styles.teacherChip,
            !hasTeacher && {
              borderWidth: 1,
              borderColor: theme.warning,
              backgroundColor: theme.warningBg,
              borderRadius: Radius.pill,
              paddingHorizontal: 8,
              paddingVertical: 4,
            },
            pressed && { opacity: 0.85 },
          ]}>
          {!hasTeacher ? (
            <Ionicons name="person-outline" size={14} color={theme.warning} />
          ) : null}
          <StatusBadge
            label={hasTeacher ? teacherLabel : 'No teachers assigned'}
            colors={
              hasTeacher
                ? { backgroundColor: theme.successBg, color: theme.success }
                : { backgroundColor: 'transparent', color: theme.warning }
            }
          />
          <Ionicons
            name="chevron-down"
            size={12}
            color={hasTeacher ? theme.textTertiary : theme.warning}
          />
        </Pressable>
      }>
      <AdminListCardPressable onPress={() => onPress(student)}>
        <View style={styles.topRow}>
          <StudentPhoto name={studentName} photoUrl={student.profilePhotoUrl} size="row" />
          <View style={styles.mainCopy}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={{ color: theme.textPrimary }}>
              {studentName}
            </ThemedText>
            <View style={styles.badgeRow}>
              {gradeLabel ? (
                <StatusBadge
                  label={gradeLabel}
                  colors={{ backgroundColor: theme.accentLight, color: theme.accent }}
                />
              ) : null}
              <StatusBadge
                label={programLabel}
                colors={{ backgroundColor: theme.infoBg, color: theme.info }}
              />
            </View>
          </View>
        </View>
      </AdminListCardPressable>
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  mainCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  teacherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
});
