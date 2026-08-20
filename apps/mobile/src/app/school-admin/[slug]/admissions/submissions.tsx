import { useLocalSearchParams } from 'expo-router';

import { SubmissionsListScreen } from '@/components/school-admin/submissions-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminSubmissionsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <SubmissionsListScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />
  );
}
