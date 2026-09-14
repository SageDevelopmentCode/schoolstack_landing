import type { ClassroomSummary } from '@/lib/school-admin/classrooms';

export type StudentProgram = {
  id: string;
  name: string;
};

export type ClassroomGroup = {
  programLabel: string;
  classrooms: ClassroomSummary[];
};

function classroomSortKey(classroom: ClassroomSummary): string {
  return classroom.name.toLowerCase();
}

export function sortClassrooms(classrooms: ClassroomSummary[]): ClassroomSummary[] {
  return [...classrooms].sort((a, b) => classroomSortKey(a).localeCompare(classroomSortKey(b)));
}

export function classroomAppliesToEnrollment(
  classroomProgramId: string | null,
  enrollmentProgramId: string | null,
): boolean {
  if (classroomProgramId === null) return true;
  return classroomProgramId === enrollmentProgramId;
}

export function classroomAppliesToStudent(
  classroom: ClassroomSummary,
  studentProgramIds: string[],
  studentProgramNames: string[] = [],
): boolean {
  if (!classroom.programId) return true;

  if (studentProgramIds.length > 0) {
    return studentProgramIds.includes(classroom.programId);
  }

  if (studentProgramNames.length > 0 && classroom.programName) {
    return studentProgramNames.includes(classroom.programName);
  }

  return false;
}

export function buildStudentPrograms(
  studentProgramIds: string[],
  studentProgramNames: string[],
): StudentProgram[] {
  const programs: StudentProgram[] = [];
  const seenIds = new Set<string>();

  for (let index = 0; index < studentProgramIds.length; index += 1) {
    const id = studentProgramIds[index]?.trim();
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);
    programs.push({
      id,
      name: studentProgramNames[index] ?? 'Program',
    });
  }

  if (programs.length > 0) return programs;

  return studentProgramNames.map((name) => ({
    id: `name:${name}`,
    name,
  }));
}

export function getAssignableClassrooms(
  classrooms: ClassroomSummary[],
  studentProgramIds: string[],
  studentProgramNames: string[] = [],
): ClassroomSummary[] {
  const seen = new Set<string>();
  const result: ClassroomSummary[] = [];

  for (const classroom of sortClassrooms(classrooms)) {
    if (!classroomAppliesToStudent(classroom, studentProgramIds, studentProgramNames)) continue;
    if (seen.has(classroom.id)) continue;
    seen.add(classroom.id);
    result.push(classroom);
  }

  return result;
}

export function buildAssignableClassroomGroups(
  studentPrograms: StudentProgram[],
  classrooms: ClassroomSummary[],
): ClassroomGroup[] {
  const orgWideClassrooms = sortClassrooms(classrooms.filter((classroom) => !classroom.programId));
  const programSpecificClassrooms = classrooms.filter((classroom) => classroom.programId);

  if (studentPrograms.length === 0) {
    const byProgram = new Map<string, ClassroomSummary[]>();
    for (const classroom of programSpecificClassrooms) {
      const label = classroom.programName ?? 'Program';
      const list = byProgram.get(label) ?? [];
      list.push(classroom);
      byProgram.set(label, list);
    }

    const groups = [...byProgram.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([programLabel, entries]) => ({
        programLabel,
        classrooms: sortClassrooms([...entries, ...orgWideClassrooms]),
      }));

    if (groups.length > 0) return groups;

    return orgWideClassrooms.length > 0
      ? [{ programLabel: 'All programs', classrooms: orgWideClassrooms }]
      : [];
  }

  return studentPrograms.map((program) => {
    const matching = program.id.startsWith('name:')
      ? programSpecificClassrooms.filter((classroom) => classroom.programName === program.name)
      : programSpecificClassrooms.filter((classroom) => classroom.programId === program.id);

    return {
      programLabel: program.name,
      classrooms: sortClassrooms([...matching, ...orgWideClassrooms]),
    };
  });
}

export function buildAssignableClassroomPickerGroups(
  classrooms: ClassroomSummary[],
  studentProgramIds: string[],
  studentProgramNames: string[],
): ClassroomGroup[] {
  const assignableClassrooms = getAssignableClassrooms(
    classrooms,
    studentProgramIds,
    studentProgramNames,
  );
  const assignableIds = new Set(assignableClassrooms.map((classroom) => classroom.id));
  const filteredClassrooms = classrooms.filter((classroom) => assignableIds.has(classroom.id));
  const studentPrograms = buildStudentPrograms(studentProgramIds, studentProgramNames);

  return buildAssignableClassroomGroups(studentPrograms, filteredClassrooms).filter(
    (group) => group.classrooms.length > 0,
  );
}
