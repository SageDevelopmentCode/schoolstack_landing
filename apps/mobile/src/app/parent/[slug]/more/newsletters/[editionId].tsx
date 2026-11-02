import { useLocalSearchParams } from 'expo-router';

import { ParentNewsletterDetailScreen } from '@/components/parent/newsletters/parent-newsletter-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentNewsletterEditionRoute() {
  const { editionId } = useLocalSearchParams<{ slug: string; editionId: string }>();
  const { selectedSchool } = useAuth();

  if (!editionId || !selectedSchool) return null;

  return (
    <ParentNewsletterDetailScreen organizationId={selectedSchool.id} editionId={editionId} />
  );
}
