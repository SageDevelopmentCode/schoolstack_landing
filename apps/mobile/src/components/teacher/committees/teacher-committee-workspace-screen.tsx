import { CommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import type { CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { fetchTeacherCommitteeWorkspace } from '@/lib/teacher/teacher-portal-api';

type TeacherCommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
  initialSection?: CommitteeWorkspaceSection;
};

export function TeacherCommitteeWorkspaceScreen({
  organizationId,
  committeeId,
  initialSection,
}: TeacherCommitteeWorkspaceScreenProps) {
  return (
    <CommitteeWorkspaceScreen
      organizationId={organizationId}
      committeeId={committeeId}
      portalApiNamespace="teacher-portal"
      fetchWorkspace={fetchTeacherCommitteeWorkspace}
      initialSection={initialSection}
    />
  );
}
