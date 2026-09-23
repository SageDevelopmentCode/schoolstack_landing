import { useLocalSearchParams } from 'expo-router';

import { TeacherCommitteeWorkspaceScreen } from '@/components/teacher/committees/teacher-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherCommitteeWorkspaceRoute() {
  const { slug, committeeId } = useLocalSearchParams<{ slug: string; committeeId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  return (
    <TeacherCommitteeWorkspaceScreen
      organizationId={selectedSchool.id}
      committeeId={committeeId}
    />
  );
}
