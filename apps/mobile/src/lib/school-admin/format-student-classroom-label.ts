export function formatStudentClassroomLabel(classroomNames: string[]): string {
  return classroomNames.length > 0 ? classroomNames.join(', ') : 'Unassigned';
}
