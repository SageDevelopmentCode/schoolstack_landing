import { useLocalSearchParams } from 'expo-router';

import { TeacherStudentDetailScreen } from '@/components/teacher/students/teacher-student-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherStudentDetailRoute() {
  const { slug, studentId, scope } = useLocalSearchParams<{
    slug: string;
    studentId: string;
    scope?: string;
  }>();
  const { selectedSchool } = useAuth();

  if (!slug || !studentId || !selectedSchool) return null;

  const detailAccess = scope === 'school' ? 'school' : 'assigned';

  return (
    <TeacherStudentDetailScreen slug={slug} studentId={studentId} detailAccess={detailAccess} />
  );
}
