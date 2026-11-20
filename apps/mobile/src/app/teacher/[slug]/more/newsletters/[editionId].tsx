import { useLocalSearchParams } from 'expo-router';

import { TeacherNewsletterDetailScreen } from '@/components/teacher/newsletters/teacher-newsletters-screens';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherNewsletterEditionRoute() {
  const { editionId } = useLocalSearchParams<{ slug: string; editionId: string }>();
  const { selectedSchool } = useAuth();

  if (!editionId || !selectedSchool) return null;

  return <TeacherNewsletterDetailScreen organizationId={selectedSchool.id} editionId={editionId} />;
}
