import { useLocalSearchParams } from 'expo-router';

import { SubmissionDetailScreen } from '@/components/school-admin/submission-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminSubmissionDetailPage() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !id) {
    return null;
  }

  return <SubmissionDetailScreen organizationId={selectedSchool.id} applicationId={id} />;
}
