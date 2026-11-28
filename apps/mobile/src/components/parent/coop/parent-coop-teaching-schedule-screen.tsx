import { CoopTeachingScheduleGardenScreen } from '@/components/parent/coop/garden/coop-teaching-schedule-garden-screen';
import { useCoopTeachingScheduleController } from '@/components/parent/coop/garden/use-coop-teaching-schedule-controller';

type ParentCoopTeachingScheduleScreenProps = {
  organizationId: string;
  programId: string;
};

/** Co-op Teaching schedule tab: controller (data, actions) → Garden screen. */
export function ParentCoopTeachingScheduleScreen({
  organizationId,
  programId,
}: ParentCoopTeachingScheduleScreenProps) {
  const controller = useCoopTeachingScheduleController({ organizationId, programId });
  return <CoopTeachingScheduleGardenScreen controller={controller} />;
}
