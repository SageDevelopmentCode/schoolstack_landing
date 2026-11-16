import { useLocalSearchParams } from 'expo-router';

import { AdminMessagesInboxScreen } from '@/components/school-admin/messages/garden/admin-messages-inbox-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminMessagesPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AdminMessagesInboxScreen
      organizationId={selectedSchool.id}
      organizationSlug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
