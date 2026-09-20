import { useLocalSearchParams } from 'expo-router';

import { ParentFormsDocumentsScreen } from '@/components/parent/forms-documents/parent-forms-documents-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentFormsDocumentsRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentFormsDocumentsScreen slug={slug} />;
}
