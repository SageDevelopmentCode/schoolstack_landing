import { useLocalSearchParams } from 'expo-router';

import { ScheduleScreen } from '@/components/school-admin/schedule/schedule-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminSchedulePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <ScheduleScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />;
}
