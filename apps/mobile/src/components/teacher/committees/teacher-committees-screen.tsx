import { CommitteesScreen } from '@/components/parent/committees/parent-committees-screen';
import { useTeacherCommittees } from '@/contexts/teacher-committees-context';

type TeacherCommitteesScreenProps = {
  slug: string;
  organizationId: string;
};

export function TeacherCommitteesScreen({ slug, organizationId }: TeacherCommitteesScreenProps) {
  return (
    <CommitteesScreen
      slug={slug}
      organizationId={organizationId}
      portal="teacher"
      useCommittees={useTeacherCommittees}
    />
  );
}
