import { useLocalSearchParams } from 'expo-router';

import { ParentClassroomSignupsScreen } from '@/components/parent/classroom-signups/parent-classroom-signups-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentClassroomSignupsRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentClassroomSignupsScreen slug={slug} organizationId={selectedSchool.id} />;
}
