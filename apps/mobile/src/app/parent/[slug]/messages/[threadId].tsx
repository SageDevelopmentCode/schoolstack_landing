import { useLocalSearchParams } from 'expo-router';

import { ParentMessageThreadScreen } from '@/components/parent/messages/parent-message-thread-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentMessageThreadPage() {
  const { slug, threadId } = useLocalSearchParams<{ slug: string; threadId: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !threadId) {
    return null;
  }

  return (
    <ParentMessageThreadScreen
      threadId={threadId}
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
