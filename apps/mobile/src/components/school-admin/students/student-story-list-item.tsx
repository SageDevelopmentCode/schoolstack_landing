import { Pressable, StyleSheet, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import {
  formatAssignedTeachersLabel,
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { StudentClassroomAssignButton } from '@/components/school-admin/students/student-classroom-assign-button';
import { isStudentUnassigned } from '@/lib/school-admin/admin-student-roster-metrics';
import { StoryCardPadding } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StudentStoryListItemProps = {
  student: AdminEnrolledStudentSummary;
  onPress: (student: AdminEnrolledStudentSummary) => void;
  onPressClassroom: (student: AdminEnrolledStudentSummary) => void;
};

export function StudentStoryListItem({
  student,
  onPress,
  onPressClassroom,
}: StudentStoryListItemProps) {
  const studentName = formatEnrolledStudentName(student);
  const gradeLabel = formatStudentGrade(student.grade);
  const programLabel = student.programNames[0] ?? null;
  const teacherLabel = formatAssignedTeachersLabel(student.assignedTeachers);
  const unassigned = isStudentUnassigned(student);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={studentName}
      onPress={() => onPress(student)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.topRow}>
          <StudentPhoto
            name={studentName}
            photoUrl={student.profilePhotoUrl}
            size="row"
            showHealthIndicator={student.hasStandingHealthItems}
          />
          <View style={styles.mainCopy}>
            <StoryDisplayHeading size="section" numberOfLines={1} style={styles.studentName}>
              {studentName}
            </StoryDisplayHeading>
            <View style={styles.chipRow}>
              {gradeLabel ? <StoryChip tone="info" label={gradeLabel} /> : null}
              {programLabel ? <StoryChip tone="success" label={programLabel} /> : null}
              {unassigned ? <StoryChip tone="warning" label="Needs assignment" /> : null}
            </View>
          </View>
        </View>

        <StudentClassroomAssignButton
          classroomNames={student.classroomNames}
          leadTeacherLabel={teacherLabel}
          onPress={() => onPressClassroom(student)}
        />
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  mainCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  studentName: {
    fontSize: 18,
    lineHeight: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
