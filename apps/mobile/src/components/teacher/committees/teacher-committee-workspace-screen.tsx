import { CommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import { fetchTeacherCommitteeWorkspace } from '@/lib/teacher/teacher-portal-api';

type TeacherCommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
};

export function TeacherCommitteeWorkspaceScreen({
  organizationId,
  committeeId,
}: TeacherCommitteeWorkspaceScreenProps) {
  return (
    <CommitteeWorkspaceScreen
      organizationId={organizationId}
      committeeId={committeeId}
      fetchWorkspace={fetchTeacherCommitteeWorkspace}
    />
  );
}
