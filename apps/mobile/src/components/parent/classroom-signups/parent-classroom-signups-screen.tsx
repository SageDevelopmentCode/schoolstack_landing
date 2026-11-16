import { ParentClassroomSignupsGardenScreen } from '@/components/parent/classroom-signups/garden/parent-classroom-signups-garden-screen';
import { useParentClassroomSignupsScreenController } from '@/components/parent/classroom-signups/garden/use-parent-classroom-signups-screen-controller';

type ParentClassroomSignupsScreenProps = {
  slug: string;
  organizationId: string;
};

/** Parent Classroom signups list (Garden). Routes import this name. */
export function ParentClassroomSignupsScreen({
  slug,
  organizationId: _organizationId,
}: ParentClassroomSignupsScreenProps) {
  const controller = useParentClassroomSignupsScreenController(slug);
  return <ParentClassroomSignupsGardenScreen controller={controller} />;
}
