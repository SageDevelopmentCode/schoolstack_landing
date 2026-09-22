import { useLocalSearchParams } from 'expo-router';

import { ParentAttendanceScreen } from '@/components/parent/attendance/parent-attendance-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentAttendanceRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentAttendanceScreen slug={slug} organizationId={selectedSchool.id} />;
}
