import { useLocalSearchParams } from 'expo-router';

import { TeacherMessagesListScreen } from '@/components/teacher/messages/teacher-messages-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMessagesPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <TeacherMessagesListScreen
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
