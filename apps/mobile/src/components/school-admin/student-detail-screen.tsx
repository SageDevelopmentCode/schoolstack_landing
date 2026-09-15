import { StudentDetailWorkspace } from '@/components/school-admin/students/student-detail-workspace';

type StudentDetailScreenProps = {
  organizationId: string;
  studentId: string;
  slug: string;
};

export function StudentDetailScreen({ organizationId, studentId, slug }: StudentDetailScreenProps) {
  return (
    <StudentDetailWorkspace
      organizationId={organizationId}
      studentId={studentId}
      slug={slug}
      variant="screen"
    />
  );
}
