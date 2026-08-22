import { useLocalSearchParams } from 'expo-router';

import { MessagesListScreen } from '@/components/school-admin/messages/messages-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminMessagesPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <MessagesListScreen
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
