import { TeacherStudentDetailWorkspace } from '@/components/teacher/students/teacher-student-detail-workspace';
import type { TeacherStudentDetailScope } from '@/lib/teacher/teacher-nav';

type TeacherStudentDetailScreenProps = {
  slug: string;
  studentId: string;
  detailAccess?: TeacherStudentDetailScope;
};

export function TeacherStudentDetailScreen({
  slug: _slug,
  studentId,
  detailAccess = 'assigned',
}: TeacherStudentDetailScreenProps) {
  return (
    <TeacherStudentDetailWorkspace
      studentId={studentId}
      detailAccess={detailAccess}
      variant="screen"
    />
  );
}
