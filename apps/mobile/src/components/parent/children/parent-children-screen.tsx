import { useEffect } from 'react';

import { ParentChildrenGardenScreen } from '@/components/parent/children/garden/parent-children-garden-screen';
import { useParentChildrenScreenController } from '@/components/parent/children/garden/use-parent-children-screen-controller';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentProgramHome } from '@/contexts/parent-program-home-context';
import type { ParentChildrenPortalScope } from '@/lib/parent/parent-children-utils';

type ParentChildrenScreenProps = {
  slug: string;
  initialApplicationId?: string;
  portalScope?: ParentChildrenPortalScope;
};

function ParentChildrenScreenMain({ slug, initialApplicationId }: ParentChildrenScreenProps) {
  const home = useParentHome();
  const controller = useParentChildrenScreenController({
    slug,
    initialApplicationId,
    home: {
      data: home.data,
      isLoading: home.isLoading,
      isRefreshing: home.isRefreshing,
      error: home.error,
      refresh: home.refresh,
    },
  });
  return <ParentChildrenGardenScreen controller={controller} />;
}

function ParentChildrenScreenProgram({ slug, initialApplicationId }: ParentChildrenScreenProps) {
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useParentProgramHome();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const controller = useParentChildrenScreenController({
    slug,
    initialApplicationId,
    home: { data, isLoading, isRefreshing, error, refresh },
    programPortalLabel: data?.programPortalLabel,
  });
  return <ParentChildrenGardenScreen controller={controller} />;
}

/** Thin entry: main or program home data → controller → Garden screen. */
export function ParentChildrenScreen({ portalScope = 'main', ...props }: ParentChildrenScreenProps) {
  if (portalScope === 'program') return <ParentChildrenScreenProgram {...props} />;
  return <ParentChildrenScreenMain {...props} />;
}
