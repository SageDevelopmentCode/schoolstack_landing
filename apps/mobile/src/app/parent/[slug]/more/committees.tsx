import { useLocalSearchParams } from 'expo-router';

import { ParentPlaceholderScreen } from '@/components/parent/parent-placeholder-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCommitteesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentPlaceholderScreen
      slug={slug}
      schoolName={selectedSchool.name}
      title="Committees"
      description="Browse and join volunteer committees — coming soon in the mobile app."
    />
  );
}
