import { useLocalSearchParams } from 'expo-router';

import { GardenCommitteeProjectDetailLoader } from '@/components/parent/committees/garden/projects/project-detail';
import { useAuth } from '@/contexts/auth-context';
import { firstSearchParam } from '@/lib/expo-router/search-param';

export default function TeacherCommitteeProjectRoute() {
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
    <GardenCommitteeProjectDetailLoader
      organizationId={selectedSchool.id}
      committeeId={committeeId}
      projectId={projectId}
      portalApiNamespace="teacher-portal"
    />
  );
}
