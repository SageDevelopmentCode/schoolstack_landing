import { useLocalSearchParams } from 'expo-router';

import { TeacherHomeScreen } from '@/components/teacher/teacher-home-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherHomeRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <TeacherHomeScreen slug={slug} />;
}
