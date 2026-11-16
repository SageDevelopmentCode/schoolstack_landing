import { NOTE_TINTS } from '@/components/parent/garden/tokens';
import { GCard, GChip } from '@/components/parent/garden/ui';
import { AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import type { StaffClassroomOption } from '@/lib/teacher/teacher-portal-api';

/** "Your classrooms": one row per classroom; the whole row opens its roster sheet. */
export function ClassroomsCard({
  classrooms,
  onOpenClassroom,
  index = 0,
}: {
  classrooms: StaffClassroomOption[];
  onOpenClassroom: (classroom: StaffClassroomOption) => void;
  index?: number;
}) {
  if (classrooms.length === 0) return null;
  return (
    <GCard
      title="Your classrooms"
      index={index}
      testID="teacher-home-classrooms"
      action={<GChip label={String(classrooms.length)} tone="neutral" icon="school-outline" />}>
      {classrooms.map((classroom, i) => {
        const students = `${classroom.studentCount} student${classroom.studentCount === 1 ? '' : 's'}`;
        return (
          <AdminWorkRow
            key={classroom.id}
            testID={`teacher-home-classroom-${classroom.id}`}
            divider={i > 0}
            icon="people-outline"
            tint={NOTE_TINTS[i % NOTE_TINTS.length]}
            title={classroom.name}
            meta={classroom.role ? `${students} · ${classroom.role}` : students}
            ctaLabel="View students"
            accessibilityLabel={`${classroom.name}, ${students}. View students`}
            onPress={() => onOpenClassroom(classroom)}
          />
        );
      })}
    </GCard>
  );
}
