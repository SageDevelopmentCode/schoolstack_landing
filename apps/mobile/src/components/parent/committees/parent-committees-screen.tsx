import { CommitteesGardenScreen } from '@/components/parent/committees/garden/committees-garden-screen';
import { useParentCommittees } from '@/contexts/parent-committees-context';
import type {
  CommitteesContextValue,
  CommitteesPortal,
} from '@/lib/committees/committees-portal-config';

type CommitteesScreenProps = {
  slug: string;
  organizationId: string;
  portal: CommitteesPortal;
  useCommittees: () => CommitteesContextValue;
};

/** Generic committees list (parent + teacher wrappers render this). */
function CommitteesScreen(props: CommitteesScreenProps) {
  return <CommitteesGardenScreen {...props} />;
}

export function ParentCommitteesScreen({ slug, organizationId }: { slug: string; organizationId: string }) {
  return (
    <CommitteesScreen
      slug={slug}
      organizationId={organizationId}
      portal="parent"
      useCommittees={useParentCommittees}
    />
  );
}

export { CommitteesScreen };
