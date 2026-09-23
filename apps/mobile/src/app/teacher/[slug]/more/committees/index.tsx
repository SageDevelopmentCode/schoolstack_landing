import { useLocalSearchParams } from 'expo-router';

import { TeacherCommitteesScreen } from '@/components/teacher/committees/teacher-committees-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherCommitteesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <TeacherCommitteesScreen slug={slug} organizationId={selectedSchool.id} />;
}
