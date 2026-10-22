import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';
import { isCommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export default function ParentCommitteeWorkspaceRoute() {
  const { slug, committeeId, section, event, resource, task } = useLocalSearchParams<{
    slug: string;
    committeeId: string;
    section?: string;
    event?: string;
    resource?: string;
    task?: string;
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
      initialEventId={typeof event === 'string' ? event : undefined}
      initialResourceId={typeof resource === 'string' ? resource : undefined}
      initialTaskId={typeof task === 'string' ? task : undefined}
    />
  );
}
