import { useLocalSearchParams } from 'expo-router';

import { SchoolDashboardScreen } from '@/components/school-admin/school-dashboard-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminDashboardPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <SchoolDashboardScreen
      organizationId={selectedSchool.id}
      slug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
