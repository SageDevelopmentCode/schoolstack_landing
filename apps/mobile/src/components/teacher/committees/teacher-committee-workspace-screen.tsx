import { CommitteeWorkspaceScreen } from '@/components/parent/committees/parent-committee-workspace-screen';
import type { CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { fetchTeacherCommitteeWorkspace } from '@/lib/teacher/teacher-portal-api';

type TeacherCommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
  schoolSlug: string;
  initialSection?: CommitteeWorkspaceSection;
  initialEventId?: string | null;
  initialResourceId?: string | null;
  initialTaskId?: string | null;
  initialProjectId?: string | null;
};

export function TeacherCommitteeWorkspaceScreen({
  organizationId,
  committeeId,
  schoolSlug,
  initialSection,
  initialEventId,
  initialResourceId,
  initialTaskId,
  initialProjectId,
}: TeacherCommitteeWorkspaceScreenProps) {
  return (
    <CommitteeWorkspaceScreen
      organizationId={organizationId}
      committeeId={committeeId}
      schoolSlug={schoolSlug}
      portalApiNamespace="teacher-portal"
      fetchWorkspace={fetchTeacherCommitteeWorkspace}
      initialSection={initialSection}
      initialEventId={initialEventId}
      initialResourceId={initialResourceId}
      initialTaskId={initialTaskId}
      initialProjectId={initialProjectId}
    />
  );
}
