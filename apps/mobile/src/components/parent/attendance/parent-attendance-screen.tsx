import { ParentAttendanceGardenScreen } from '@/components/parent/attendance/garden/parent-attendance-garden-screen';
import { useParentAttendanceScreenController } from '@/components/parent/attendance/garden/use-parent-attendance-screen-controller';

type ParentAttendanceScreenProps = {
  slug: string;
  organizationId: string;
};

/** Thin entry: controller (data + callbacks) → Garden screen. */
export function ParentAttendanceScreen({ slug, organizationId }: ParentAttendanceScreenProps) {
  const controller = useParentAttendanceScreenController({ slug, organizationId });
  return <ParentAttendanceGardenScreen controller={controller} />;
}
