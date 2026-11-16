import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink } from '@/components/parent/garden/ui';
import { StudentFaceTile } from '@/components/teacher/students/garden/student-face-tile';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';

const MAX_STUDENT_TILES = 6;

/**
 * "Your students" as a class photo: a 3-column grid of faces (photo or initials,
 * health marker, first name). Each face opens the student's profile.
 * The card title is exact: the Maestro visual flow waits on "Your students".
 */
export function StudentsCard({
  students,
  onOpenStudent,
  onViewAll,
  index = 0,
}: {
  students: AdminEnrolledStudentSummary[];
  onOpenStudent: (student: AdminEnrolledStudentSummary) => void;
  onViewAll: () => void;
  index?: number;
}) {
  const count = students.length;
  const visible = students.slice(0, MAX_STUDENT_TILES);

  return (
    <GCard
      title="Your students"
      index={index}
      testID="teacher-home-students"
      action={count > 0 ? <GChip label={`${count} enrolled`} tone="success" /> : null}>
      {count === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyCopy}>
            No learners assigned yet — your administrator can link students to you from the staff
            directory.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.grid} accessibilityRole="list">
            {visible.map((student, i) => (
              <StudentFaceTile
                key={student.id}
                student={student}
                index={i}
                testID={`teacher-home-student-${student.id}`}
                onPress={onOpenStudent}
                style={styles.tile}
              />
            ))}
          </View>
          {count > MAX_STUDENT_TILES ? (
            <GLink label={`View all ${count} students`} onPress={onViewAll} style={styles.viewAll} />
          ) : null}
        </>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '30%', flexGrow: 1, maxWidth: '32%' },
  viewAll: { marginTop: 12 },
  empty: { borderRadius: 16, backgroundColor: Garden.paper, padding: 16 },
  emptyCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 21, color: Garden.soft },
});
