import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'expo-router';
import type { Href } from 'expo-router';

import {
  fetchParentPortalContexts,
  type ParentPortalContextOptionMobile,
  type ParentPortalContextsData,
  type ParentPortalProgramContextMobile,
} from '@/lib/parent/parent-portal-api';
import type { ParentPortalFeatures } from '@/lib/parent/parent-features';
import {
  detectMobilePortalContextFromPathname,
  resolveMobileParentTabBar,
  resolveMobilePortalEntryPath,
  type MobileParentTabDefinition,
  type MobilePortalFeatureNav,
} from '@/lib/parent/mobile-parent-portal-nav';
import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';

type ActivePortalFeatures = {
  parent: Record<string, boolean>;
  featureNav?: MobilePortalFeatureNav;
  coopMode: boolean;
  programLabel?: string;
};

type ParentPortalContextValue = {
  slug: string;
  organizationId: string;
  contexts: ParentPortalContextOptionMobile[];
  programsByPortalSlug: Record<string, ParentPortalProgramContextMobile>;
  showSwitcher: boolean;
  activeContext: ParentPortalContextOptionMobile | null;
  activeProgramSlug: string | null;
  activePortalFeatures: ActivePortalFeatures | null;
  tabBarTabs: MobileParentTabDefinition[];
  redirectAwayFromMainPortal: boolean;
  defaultMobileEntryPath: string;
  isLoading: boolean;
  error: string | null;
  switchToContext: (context: ParentPortalContextOptionMobile) => void;
  refresh: () => Promise<void>;
};

const ParentPortalContext = createContext<ParentPortalContextValue | null>(null);

type ParentPortalContextProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
  authReady?: boolean;
  mainPortalFeatures?: ParentPortalFeatures;
};

function buildMainPortalFeatures(
  mainPortalFeatures?: ParentPortalFeatures,
): ActivePortalFeatures | null {
  if (!mainPortalFeatures?.parent) return null;
  return {
    parent: mainPortalFeatures.parent,
    coopMode: false,
  };
}

export function ParentPortalContextProvider({
  children,
  organizationId,
  slug,
  authReady = true,
  mainPortalFeatures,
}: ParentPortalContextProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<ParentPortalContextsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
    [organizationId],
  );

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (!authReady) return;
      if (fetchPromiseRef.current && !options?.refresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        if (!options?.refresh) {
          setIsLoading(true);
        }
        setError(null);
        try {
          const next = await fetchParentPortalContexts(organizationId, slug);
          setData(next);
        } catch (loadError) {
          reportError('parent_portal_contexts_load', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load portals.');
        } finally {
          setIsLoading(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      if (!options?.refresh) {
        fetchPromiseRef.current = promise;
      }
      await promise;
    },
    [authReady, organizationId, reportError, slug],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const detected = useMemo(
    () => detectMobilePortalContextFromPathname(pathname),
    [pathname],
  );

  const activeProgramSlug =
    detected.mode === 'program' ? detected.portalSlug : null;

  const contexts = data?.contexts ?? [];

  const activeContext = useMemo(() => {
    if (contexts.length === 0) return null;
    if (detected.mode === 'program') {
      return (
        contexts.find((context) => context.portalSlug === detected.portalSlug) ??
        contexts[0] ??
        null
      );
    }
    return contexts.find((context) => context.id === 'main') ?? contexts[0] ?? null;
  }, [contexts, detected]);

  const activePortalFeatures = useMemo((): ActivePortalFeatures | null => {
    if (activeProgramSlug && data?.programsByPortalSlug[activeProgramSlug]) {
      const program = data.programsByPortalSlug[activeProgramSlug];
      return {
        parent: program.features.parent ?? {},
        featureNav: program.features.featureNav as MobilePortalFeatureNav | undefined,
        coopMode: program.coopMode,
        programLabel: program.displayLabel,
      };
    }
    return buildMainPortalFeatures(mainPortalFeatures);
  }, [activeProgramSlug, data?.programsByPortalSlug, mainPortalFeatures]);

  const tabBarTabs = useMemo(() => {
    if (!activePortalFeatures?.parent) {
      return resolveMobileParentTabBar({
        mode: 'main',
        parentFeatures: { portal: true, billing: true, messages: true, calendar: true },
      });
    }

    return resolveMobileParentTabBar({
      mode: activeProgramSlug ? 'program' : 'main',
      parentFeatures: activePortalFeatures.parent,
      portalNav: activePortalFeatures.featureNav,
      coopMode: activePortalFeatures.coopMode,
    });
  }, [activePortalFeatures, activeProgramSlug]);

  const switchToContext = useCallback(
    (context: ParentPortalContextOptionMobile) => {
      const href = (context.mobileEntryPath ||
        resolveMobilePortalEntryPath(slug, context)) as Href;
      router.replace(href);
    },
    [router, slug],
  );

  const value = useMemo(
    () => ({
      slug,
      organizationId,
      contexts,
      programsByPortalSlug: data?.programsByPortalSlug ?? {},
      showSwitcher: contexts.length > 1,
      activeContext,
      activeProgramSlug,
      activePortalFeatures,
      tabBarTabs,
      redirectAwayFromMainPortal: data?.redirectAwayFromMainPortal ?? false,
      defaultMobileEntryPath:
        data?.defaultMobileEntryPath ??
        resolveMobilePortalEntryPath(slug, { id: 'main', portalSlug: undefined }),
      isLoading,
      error,
      switchToContext,
      refresh: () => load({ refresh: true }),
    }),
    [
      activeContext,
      activePortalFeatures,
      activeProgramSlug,
      contexts,
      data?.defaultMobileEntryPath,
      data?.programsByPortalSlug,
      data?.redirectAwayFromMainPortal,
      error,
      isLoading,
      load,
      organizationId,
      slug,
      switchToContext,
      tabBarTabs,
    ],
  );

  return (
    <ParentPortalContext.Provider value={value}>{children}</ParentPortalContext.Provider>
  );
}

export function useParentPortalContext(): ParentPortalContextValue {
  const context = useContext(ParentPortalContext);
  if (!context) {
    throw new Error('useParentPortalContext must be used within ParentPortalContextProvider');
  }
  return context;
}

export function useOptionalParentPortalContext(): ParentPortalContextValue | null {
  return useContext(ParentPortalContext);
}
