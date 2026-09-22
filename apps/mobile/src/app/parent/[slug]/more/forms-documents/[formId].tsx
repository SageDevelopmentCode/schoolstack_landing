import { useLocalSearchParams } from 'expo-router';

import { ParentFormDetailScreen } from '@/components/parent/forms-documents/parent-form-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentFormDetailRoute() {
  const { slug, formId } = useLocalSearchParams<{ slug: string; formId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !formId) return null;

  return (
    <ParentFormDetailScreen
      slug={slug}
      organizationId={selectedSchool.id}
      formId={formId}
    />
  );
}
