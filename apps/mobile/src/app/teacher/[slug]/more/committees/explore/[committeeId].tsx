import { useLocalSearchParams } from 'expo-router';

import { TeacherCommitteeExploreDetailScreen } from '@/components/teacher/committees/teacher-committee-explore-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherCommitteeExploreDetailRoute() {
  const { slug, committeeId } = useLocalSearchParams<{ slug: string; committeeId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  return (
    <TeacherCommitteeExploreDetailScreen
      slug={slug}
      organizationId={selectedSchool.id}
      schoolName={selectedSchool.name}
      committeeId={committeeId}
    />
  );
}
