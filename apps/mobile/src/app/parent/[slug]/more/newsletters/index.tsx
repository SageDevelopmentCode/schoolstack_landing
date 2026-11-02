import { useLocalSearchParams } from 'expo-router';

import { ParentNewslettersScreen } from '@/components/parent/newsletters/parent-newsletters-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentNewslettersRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentNewslettersScreen slug={slug} organizationId={selectedSchool.id} />;
}
