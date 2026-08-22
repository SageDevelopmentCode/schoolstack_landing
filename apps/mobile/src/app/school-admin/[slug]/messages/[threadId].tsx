import { useLocalSearchParams } from 'expo-router';

import { MessageThreadScreen } from '@/components/school-admin/messages/message-thread-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminMessageThreadPage() {
  const { slug, threadId } = useLocalSearchParams<{ slug: string; threadId: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !threadId) {
    return null;
  }

  return (
    <MessageThreadScreen
      threadId={threadId}
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
