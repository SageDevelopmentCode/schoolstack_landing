import { useLocalSearchParams } from 'expo-router';

import { AdmissionsListScreen } from '@/components/school-admin/admissions/garden/admissions-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminSubmissionsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AdmissionsListScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />
  );
}
