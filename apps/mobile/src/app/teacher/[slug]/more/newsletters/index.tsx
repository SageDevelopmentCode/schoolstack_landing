import { useLocalSearchParams } from 'expo-router';

import { TeacherNewslettersScreen } from '@/components/teacher/newsletters/teacher-newsletters-screens';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherNewslettersRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) return null;

  return <TeacherNewslettersScreen slug={slug} organizationId={selectedSchool.id} />;
}
