import { useLocalSearchParams } from 'expo-router';

import { TeacherCommitteeWorkspaceScreen } from '@/components/teacher/committees/teacher-committee-workspace-screen';
import { useAuth } from '@/contexts/auth-context';
import { isCommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export default function TeacherCommitteeWorkspaceRoute() {
  const { slug, committeeId, section } = useLocalSearchParams<{
    slug: string;
    committeeId: string;
    section?: string;
  }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || !committeeId) return null;

  const initialSection =
    section && isCommitteeWorkspaceSection(section) ? section : undefined;

  return (
    <TeacherCommitteeWorkspaceScreen
      organizationId={selectedSchool.id}
      committeeId={committeeId}
      initialSection={initialSection}
    />
  );
}
