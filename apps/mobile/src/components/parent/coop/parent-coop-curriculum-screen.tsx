import { CoopCurriculumGardenScreen } from '@/components/parent/coop/garden/coop-curriculum-garden-screen';
import { useCoopCurriculumController } from '@/components/parent/coop/garden/use-coop-curriculum-controller';

type ParentCoopCurriculumScreenProps = {
  organizationId: string;
  programId: string;
};

/** Co-op Curriculum: controller (data, PDF URL, discussion) → Garden screen. */
export function ParentCoopCurriculumScreen({ organizationId, programId }: ParentCoopCurriculumScreenProps) {
  const controller = useCoopCurriculumController({ organizationId, programId });
  return <CoopCurriculumGardenScreen controller={controller} />;
}
