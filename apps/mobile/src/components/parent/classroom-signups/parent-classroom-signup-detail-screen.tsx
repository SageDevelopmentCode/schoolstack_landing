import { ParentClassroomSignupDetailGardenScreen } from '@/components/parent/classroom-signups/garden/parent-classroom-signup-detail-garden-screen';
import { useParentClassroomSignupDetailController } from '@/components/parent/classroom-signups/garden/use-parent-classroom-signup-detail-controller';

type ParentClassroomSignupDetailScreenProps = {
  slug: string;
  organizationId: string;
  signupId: string;
};

/** One parent classroom signup (Garden). Routes import this name. */
export function ParentClassroomSignupDetailScreen({
  slug,
  organizationId,
  signupId,
}: ParentClassroomSignupDetailScreenProps) {
  const controller = useParentClassroomSignupDetailController({ slug, organizationId, signupId });
  return <ParentClassroomSignupDetailGardenScreen controller={controller} />;
}
