import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { formatEnrolledStudentName, studentSubtitleLine } from '@/lib/teacher/teacher-home-utils';

/** One classroom's roster: tap a student to open their profile (the sheet closes first). */
export function ClassroomRosterSheet({
  visible,
  classroomName,
  students: openStudents,
  onClose,
  onSelectStudent,
}: {
  visible: boolean;
  classroomName: string;
  students: AdminEnrolledStudentSummary[];
  onClose: () => void;
  onSelectStudent: (student: AdminEnrolledStudentSummary) => void;
}) {
  // Keep the last roster on screen while the sheet animates closed.
  const [shown, setShown] = useState({ name: classroomName, students: openStudents });
  if (visible && (shown.name !== classroomName || shown.students !== openStudents)) {
    setShown({ name: classroomName, students: openStudents });
  }
  const { name, students } = shown;
  const countLabel = `${students.length} student${students.length === 1 ? '' : 's'}`;

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      list
      title={name || 'Classroom'}
      subtitle={countLabel}
      headerAside={<GChip label="Roster" tone="info" icon="people-outline" />}
      accessibilityLabel="Close classroom students">
      <FlatList
        data={students}
        keyExtractor={(student) => student.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyCopy}>No students are assigned to this classroom yet.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const fullName = formatEnrolledStudentName(item);
          const meta = studentSubtitleLine(item);
          return (
            <GPressable
              testID={`teacher-home-roster-student-${item.id}`}
              accessibilityLabel={`${fullName}. ${meta}. View profile`}
              pressedScale={0.985}
              onPress={() => onSelectStudent(item)}
              style={[styles.row, index > 0 && styles.rowLine]}>
              <StudentPhoto
                name={fullName}
                photoUrl={item.profilePhotoUrl}
                size="md"
                showHealthIndicator={item.hasStandingHealthItems}
              />
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>
                  {fullName}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {meta}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
            </GPressable>
          );
        }}
      />
    </GSheet>
  );
}

const styles = StyleSheet.create({
  // Inside a list sheet the list must fill; flexGrow: 0 renders it 0pt tall.
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 10 },
  rowLine: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  empty: { margin: 4, marginTop: 12, padding: 18, borderRadius: 18, backgroundColor: Garden.paper },
  emptyCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft, textAlign: 'center' },
});
