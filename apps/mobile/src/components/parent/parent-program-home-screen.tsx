import { ParentHomeGardenScreen } from '@/components/parent/home/parent-home-garden-screen';
import { notifyUnresolvedNavigation } from '@/components/parent/home/use-parent-home-feedback';
import { useParentProgramHomeScreenController } from '@/components/parent/home/use-parent-program-home-screen-controller';
import { useGardenToast } from '@/components/parent/garden/toast';

type ParentProgramHomeScreenProps = {
  slug: string;
  programSlug: string;
};

export function ParentProgramHomeScreen({ slug, programSlug }: ParentProgramHomeScreenProps) {
  const toast = useGardenToast();
  const controller = useParentProgramHomeScreenController(slug, programSlug, {
    onUnresolvedNavigation: () => notifyUnresolvedNavigation(toast),
  });

  return <ParentHomeGardenScreen controller={controller} />;
}
