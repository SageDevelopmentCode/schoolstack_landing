import { ParentCalendarGardenScreen } from '@/components/parent/calendar/garden/parent-calendar-garden-screen';
import { useParentCalendarScreenController } from '@/components/parent/calendar/garden/use-parent-calendar-screen-controller';

type ParentCalendarScreenProps = {
  organizationId: string;
};

/**
 * Parent Calendar tab (main portal and program routes). Thin shell: the
 * controller owns data + navigation, the Garden screen renders it.
 */
export function ParentCalendarScreen({ organizationId }: ParentCalendarScreenProps) {
  const controller = useParentCalendarScreenController(organizationId);
  return <ParentCalendarGardenScreen controller={controller} />;
}
