import { useLocalSearchParams } from 'expo-router';

import { TeacherStudentDetailScreen } from '@/components/teacher/students/teacher-student-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherStudentDetailRoute() {
  const { slug, studentId } = useLocalSearchParams<{ slug: string; studentId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !studentId || !selectedSchool) return null;

  return <TeacherStudentDetailScreen slug={slug} studentId={studentId} />;
}
