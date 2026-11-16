import { useLocalSearchParams } from 'expo-router';

import { TeacherMessagesInboxScreen } from '@/components/teacher/messages/garden/teacher-messages-inbox-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMessagesPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <TeacherMessagesInboxScreen
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
