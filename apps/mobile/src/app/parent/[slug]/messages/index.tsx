import { useLocalSearchParams } from 'expo-router';

import { ParentMessagesListScreen } from '@/components/parent/messages/parent-messages-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentMessagesPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <ParentMessagesListScreen
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
    />
  );
}
