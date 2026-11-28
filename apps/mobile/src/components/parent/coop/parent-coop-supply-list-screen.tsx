import { CoopSupplyListGardenScreen } from '@/components/parent/coop/garden/coop-supply-list-garden-screen';
import { useCoopSupplyListController } from '@/components/parent/coop/garden/use-coop-supply-list-controller';

type ParentCoopSupplyListScreenProps = {
  organizationId: string;
  programId: string;
};

/** Co-op Supply list: controller (data, actions) → Garden screen. */
export function ParentCoopSupplyListScreen({ organizationId, programId }: ParentCoopSupplyListScreenProps) {
  const controller = useCoopSupplyListController({ organizationId, programId });
  return <CoopSupplyListGardenScreen controller={controller} />;
}
