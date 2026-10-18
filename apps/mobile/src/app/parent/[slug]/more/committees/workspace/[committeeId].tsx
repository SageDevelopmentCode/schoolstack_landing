import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';
import { isCommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export default function ParentCommitteeWorkspaceRoute() {
  const { slug, committeeId, section } = useLocalSearchParams<{
    slug: string;
    committeeId: string;
    section?: string;
  }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  const initialSection =
    section && isCommitteeWorkspaceSection(section) ? section : undefined;

  return (
    <ParentCommitteeWorkspaceScreen
      organizationId={selectedSchool.id}
      committeeId={committeeId}
      initialSection={initialSection}
    />
  );
}
