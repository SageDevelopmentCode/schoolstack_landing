import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteesScreen } from '@/components/parent/committees/parent-committees-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCommitteesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentCommitteesScreen slug={slug} organizationId={selectedSchool.id} />;
}
