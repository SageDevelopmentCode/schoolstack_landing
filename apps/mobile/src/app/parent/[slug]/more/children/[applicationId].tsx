import { useLocalSearchParams } from 'expo-router';

import { ParentChildDetailScreen } from '@/components/parent/children/parent-child-detail-screen';
import { useAuth } from '@/contexts/auth-context';
import { useParentHome } from '@/contexts/parent-home-context';

export default function ParentChildDetailRoute() {
  const { slug, applicationId } = useLocalSearchParams<{
    slug: string;
    applicationId: string;
  }>();
  const { selectedSchool } = useAuth();
  const { data } = useParentHome();

  if (!slug || !applicationId || !selectedSchool) return null;

  const organizationId = data?.organizationId ?? selectedSchool.id;

  return (
    <ParentChildDetailScreen
      slug={slug}
      applicationId={applicationId}
      organizationId={organizationId}
    />
  );
}
