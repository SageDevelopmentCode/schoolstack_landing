import { useLocalSearchParams } from 'expo-router';

import { SchoolAdminCommitteeWorkspaceScreen } from '@/components/school-admin/committees/school-admin-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';
import { isCommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export default function SchoolAdminCommitteeWorkspaceRoute() {
  const { slug, committeeId, section } = useLocalSearchParams<{
    slug: string;
    committeeId: string;
    section?: string;
  }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug || !committeeId) return null;

  const initialSection =
    section && isCommitteeWorkspaceSection(section) ? section : undefined;

  return (
    <SchoolAdminCommitteeWorkspaceScreen
      slug={slug}
      organizationId={selectedSchool.id}
      committeeId={committeeId}
      initialSection={initialSection}
    />
  );
}
