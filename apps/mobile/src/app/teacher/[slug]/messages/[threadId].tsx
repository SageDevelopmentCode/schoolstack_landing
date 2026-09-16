import { useLocalSearchParams } from 'expo-router';

import { TeacherMessageThreadScreen } from '@/components/teacher/messages/teacher-message-thread-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMessageThreadPage() {
  const { slug, threadId, contactKey } = useLocalSearchParams<{
    slug: string;
    threadId: string;
    contactKey?: string;
  }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !threadId) {
    return null;
  }

  return (
    <TeacherMessageThreadScreen
      threadId={threadId}
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
      pendingContactKey={threadId === 'new' ? (contactKey ?? null) : null}
    />
  );
}
