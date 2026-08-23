import { useLocalSearchParams } from 'expo-router';

import { ParentPlaceholderScreen } from '@/components/parent/parent-placeholder-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentMessagesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentPlaceholderScreen
      slug={slug}
      schoolName={selectedSchool.name}
      title="Messages"
      description="Message teachers and school staff — coming soon in the mobile app."
    />
  );
}
