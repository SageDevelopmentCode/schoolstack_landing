import { useLocalSearchParams } from 'expo-router';

import { TeacherMyStudentsScreen } from '@/components/teacher/teacher-my-students-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMyStudentsRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <TeacherMyStudentsScreen slug={slug} />;
}
