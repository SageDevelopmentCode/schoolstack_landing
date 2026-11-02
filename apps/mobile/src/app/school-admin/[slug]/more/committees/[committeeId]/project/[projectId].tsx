import { useLocalSearchParams } from 'expo-router';

import { CommitteeProjectDetailLoader } from '@/components/committees/projects/committee-project-detail-loader';
import { useAuth } from '@/contexts/auth-context';
import { firstSearchParam } from '@/lib/expo-router/search-param';

export default function SchoolAdminCommitteeProjectRoute() {
  const { slug: slugParam, committeeId: committeeIdParam, projectId: projectIdParam } =
    useLocalSearchParams<{
      slug: string;
      committeeId: string;
      projectId: string;
    }>();
  const { selectedSchool } = useAuth();

  const slug = firstSearchParam(slugParam);
  const committeeId = firstSearchParam(committeeIdParam);
  const projectId = firstSearchParam(projectIdParam);

  if (!slug || !selectedSchool || selectedSchool.slug !== slug || !committeeId || !projectId) {
    return null;
  }

  return (
    <CommitteeProjectDetailLoader
      organizationId={selectedSchool.id}
      committeeId={committeeId}
      projectId={projectId}
      portalApiNamespace="school-admin"
    />
  );
}
