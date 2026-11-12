import { useCallback, useMemo, type ComponentType } from 'react';

import type { ObserveConfig } from 'expo-observe';

export const Observe = {
  configure(_config: ObserveConfig) {
  },
};

type ObserveRootWrap = {
  <P extends Record<string, unknown>>(Component: ComponentType<P>): ComponentType<P>;
};

export const ObserveRoot = {
  wrap: ((Component) => Component) as ObserveRootWrap,
};

export function useObserve() {
  const markInteractive = useCallback(() => {
  }, []);

  return useMemo(() => ({ markInteractive }), [markInteractive]);
}
