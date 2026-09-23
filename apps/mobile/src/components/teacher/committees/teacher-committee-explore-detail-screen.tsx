import { CommitteeExploreDetailScreen } from '@/components/parent/committees/parent-committee-explore-detail-screen';
import { useTeacherCommittees } from '@/contexts/teacher-committees-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import {
  submitTeacherCommitteeJoinRequest,
  withdrawTeacherCommitteeJoinRequest,
} from '@/lib/teacher/teacher-portal-api';

type TeacherCommitteeExploreDetailScreenProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  committeeId: string;
};

export function TeacherCommitteeExploreDetailScreen({
  slug,
  organizationId,
  schoolName,
  committeeId,
}: TeacherCommitteeExploreDetailScreenProps) {
  const { data: homeData } = useTeacherHome();
  const requesterName = homeData?.userProfile.displayName ?? 'Staff member';

  return (
    <CommitteeExploreDetailScreen
      slug={slug}
      organizationId={organizationId}
      schoolName={schoolName}
      committeeId={committeeId}
      portal="teacher"
      showGradeField={false}
      requesterName={requesterName}
      useCommittees={useTeacherCommittees}
      onSubmitJoinRequest={async ({ organizationId, committeeId, preferredDutyRoleId, note }) => {
        await submitTeacherCommitteeJoinRequest({
          organizationId,
          committeeId,
          preferredDutyRoleId,
          note,
        });
      }}
      onWithdrawJoinRequest={({ requestId, organizationId, committeeName, requesterName }) =>
        withdrawTeacherCommitteeJoinRequest(
          requestId,
          organizationId,
          committeeName,
          requesterName,
        )
      }
    />
  );
}
