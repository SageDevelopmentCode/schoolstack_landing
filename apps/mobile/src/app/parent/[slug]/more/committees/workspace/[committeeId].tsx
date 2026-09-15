import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCommitteeWorkspaceRoute() {
  const { slug, committeeId } = useLocalSearchParams<{ slug: string; committeeId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  return (
    <ParentCommitteeWorkspaceScreen
      organizationId={selectedSchool.id}
      committeeId={committeeId}
    />
  );
}
