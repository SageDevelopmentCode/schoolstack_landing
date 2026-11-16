import { ParentHomeGardenScreen } from '@/components/parent/home/parent-home-garden-screen';
import { notifyUnresolvedNavigation } from '@/components/parent/home/use-parent-home-feedback';
import { useParentHomeScreenController } from '@/components/parent/home/use-parent-home-screen-controller';
import { useGardenToast } from '@/components/parent/garden/toast';

type ParentHomeScreenProps = {
  slug: string;
};

export function ParentHomeScreen({ slug }: ParentHomeScreenProps) {
  const toast = useGardenToast();
  const controller = useParentHomeScreenController(slug, {
    onUnresolvedNavigation: () => notifyUnresolvedNavigation(toast),
  });

  return <ParentHomeGardenScreen controller={controller} />;
}
