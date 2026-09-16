import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  formatEnrolledStudentName,
  studentSubtitleLine,
} from '@/lib/teacher/teacher-home-utils';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';

type TeacherHomeClassroomRosterSheetProps = {
  visible: boolean;
  classroomName: string;
  students: AdminEnrolledStudentSummary[];
  onClose: () => void;
  onSelectStudent: (student: AdminEnrolledStudentSummary) => void;
};

export function TeacherHomeClassroomRosterSheet({
  visible,
  classroomName,
  students,
  onClose,
  onSelectStudent,
}: TeacherHomeClassroomRosterSheetProps) {
  const theme = useParentTheme();

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Classroom students">
      <ScrollView contentContainerStyle={styles.content}>
        <StoryDisplayHeading size="section">{classroomName}</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {students.length} student{students.length === 1 ? '' : 's'}
        </Text>

        {students.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            No students are assigned to this classroom yet.
          </Text>
        ) : (
          students.map((student, index) => (
            <Pressable
              key={student.id}
              onPress={() => onSelectStudent(student)}
              style={[
                styles.row,
                index > 0 && { borderTopWidth: 1, borderColor: theme.line },
              ]}>
              <StudentPhoto
                name={formatEnrolledStudentName(student)}
                photoUrl={student.profilePhotoUrl}
                size="md"
                showHealthIndicator={student.hasStandingHealthItems}
              />
              <View style={styles.copy}>
                <Text style={[styles.name, { color: theme.ink }]}>
                  {formatEnrolledStudentName(student)}
                </Text>
                <Text style={[styles.meta, { color: theme.muted }]}>
                  {studentSubtitleLine(student)}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
});
