import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteeExploreDetailScreen } from '@/components/parent/committees/parent-committee-explore-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCommitteeExploreDetailRoute() {
  const { slug, committeeId } = useLocalSearchParams<{ slug: string; committeeId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  return (
    <ParentCommitteeExploreDetailScreen
      slug={slug}
      organizationId={selectedSchool.id}
      schoolName={selectedSchool.name}
      committeeId={committeeId}
    />
  );
}
