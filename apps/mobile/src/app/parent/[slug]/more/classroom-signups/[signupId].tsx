import { useLocalSearchParams } from 'expo-router';

import { ParentClassroomSignupDetailScreen } from '@/components/parent/classroom-signups/parent-classroom-signup-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentClassroomSignupDetailRoute() {
  const { slug, signupId } = useLocalSearchParams<{ slug: string; signupId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !signupId || !selectedSchool) return null;

  return (
    <ParentClassroomSignupDetailScreen
      slug={slug}
      organizationId={selectedSchool.id}
      signupId={signupId}
    />
  );
}
