import { useLocalSearchParams } from 'expo-router';

import { ParentCommitteesScreen } from '@/components/parent/committees/parent-committees-screen';
import { CommitteeUnreadRefreshProvider } from '@/contexts/committee-unread-refresh-context';
import { useAuth } from '@/contexts/auth-context';

export default function ProgramParentCommitteesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <CommitteeUnreadRefreshProvider>
      <ParentCommitteesScreen slug={slug} organizationId={selectedSchool.id} />
    </CommitteeUnreadRefreshProvider>
  );
}
