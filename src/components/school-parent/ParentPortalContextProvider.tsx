"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNavigationLoading } from "@/components/school/shared/NavigationLoadingProvider";
import {
  getActiveParentPortalContextId,
  resolveParentPortalContextSwitchHref,
} from "@/lib/admissions/program-parent-portal-context-switch";
import {
  needsParentPortalContextSwitcher,
  type ParentPortalContextOption,
} from "@/lib/organization-settings/resolve-program-parent-features";

type ParentPortalContextValue = {
  slug: string;
  contexts: ParentPortalContextOption[];
  previewParentBasePath?: string;
  onPreviewNavigate?: (href: string) => void;
  showSwitcher: boolean;
  activeContext: ParentPortalContextOption | null;
  switchToContext: (context: ParentPortalContextOption) => void;
};

const ParentPortalContext = createContext<ParentPortalContextValue | null>(null);

type ParentPortalContextProviderProps = {
  slug: string;
  contexts: ParentPortalContextOption[];
  previewParentBasePath?: string;
  onPreviewNavigate?: (href: string) => void;
  pathnameOverride?: string;
  children: ReactNode;
};

export function ParentPortalContextProvider({
  slug,
  contexts,
  previewParentBasePath,
  onPreviewNavigate,
  pathnameOverride,
  children,
}: ParentPortalContextProviderProps) {
  const router = useRouter();
  const routerPathname = usePathname();
  const pathname = pathnameOverride ?? routerPathname;
  const { startNavigation } = useNavigationLoading();

  const showSwitcher = needsParentPortalContextSwitcher(contexts);
  const activeContextId = getActiveParentPortalContextId(contexts, pathname);
  const activeContext =
    contexts.find((context) => context.id === activeContextId) ?? contexts[0] ?? null;

  const fallbackEntryHref =
    previewParentBasePath ?? `/school/${slug}/parent`;

  const switchToContext = useCallback(
    (context: ParentPortalContextOption) => {
      if (context.id === activeContextId) {
        return;
      }

      const href = resolveParentPortalContextSwitchHref({
        pathname,
        slug,
        targetContext: context,
        targetEntryHref: context.entryHref ?? `${fallbackEntryHref}/portal`,
        previewParentBasePath,
      });

      startNavigation("Switching portal");
      if (onPreviewNavigate) {
        onPreviewNavigate(href);
        return;
      }
      router.push(href);
    },
    [
      activeContextId,
      fallbackEntryHref,
      onPreviewNavigate,
      pathname,
      previewParentBasePath,
      router,
      slug,
      startNavigation,
    ],
  );

  const value = useMemo(
    () => ({
      slug,
      contexts,
      previewParentBasePath,
      onPreviewNavigate,
      showSwitcher,
      activeContext,
      switchToContext,
    }),
    [
      activeContext,
      contexts,
      onPreviewNavigate,
      previewParentBasePath,
      showSwitcher,
      slug,
      switchToContext,
    ],
  );

  return (
    <ParentPortalContext.Provider value={value}>
      {children}
    </ParentPortalContext.Provider>
  );
}

export function useParentPortalContext(): ParentPortalContextValue {
  const value = useContext(ParentPortalContext);
  if (!value) {
    return {
      slug: "",
      contexts: [],
      showSwitcher: false,
      activeContext: null,
      switchToContext: () => {},
    };
  }
  return value;
}
