import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';
import type {
  ParentFormDetail,
  ParentFormListItem,
  ParentFormsDocumentsPageBundle,
} from '@/lib/parent/parent-forms-documents-types';
import { classifyParentFormListStatus } from '@/lib/parent/parent-forms-documents-utils';
import { createParentPortalCache } from '@/lib/parent/parent-portal-cache';
import { fetchParentFormsDocuments } from '@/lib/parent/parent-portal-api';

type ParentFormsDocumentsContextValue = {
  items: ParentFormListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  applySubmittedForm: (detail: ParentFormDetail) => void;
};

const ParentFormsDocumentsContext = createContext<ParentFormsDocumentsContextValue | null>(null);

const formsCache = createParentPortalCache<ParentFormsDocumentsPageBundle>(
  'parent_forms_documents:v1:',
);

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

async function fetchAndCacheParentFormsDocuments(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentFormsDocumentsPageBundle> {
  const key = cacheKey(organizationId, slug);
  return formsCache.fetchAndCache(
    key,
    () => fetchParentFormsDocuments(organizationId),
    options,
  );
}

type ParentFormsDocumentsProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentFormsDocumentsProvider({
  children,
  organizationId,
  slug,
}: ParentFormsDocumentsProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = formsCache.get(key);

  const [items, setItems] = useState(cached?.items ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const loadRequestedRef = useRef(false);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
    [organizationId],
  );

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(formsCache.get(key));
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentFormsDocuments(organizationId, slug, {
            refresh: isRefresh,
          });
          setItems(nextData.items ?? []);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('parent_forms_documents_load', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load forms.');
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      fetchPromiseRef.current = promise;
      await promise;
    },
    [key, organizationId, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (loadRequestedRef.current) return;
    loadRequestedRef.current = true;
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const applySubmittedForm = useCallback((detail: ParentFormDetail) => {
    const listStatus = classifyParentFormListStatus(detail.response.status);
    setItems((current) => {
      const existing = current.find((item) => item.form.id === detail.form.id);
      if (!existing) {
        return [...current, { form: detail.form, response: detail.response, listStatus }];
      }
      return current.map((item) =>
        item.form.id === detail.form.id
          ? { form: detail.form, response: detail.response, listStatus }
          : item,
      );
    });
  }, []);

  const value = useMemo(
    (): ParentFormsDocumentsContextValue => ({
      items,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      applySubmittedForm,
    }),
    [
      applySubmittedForm,
      ensureLoaded,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      items,
      refresh,
    ],
  );

  return (
    <ParentFormsDocumentsContext.Provider value={value}>
      {children}
    </ParentFormsDocumentsContext.Provider>
  );
}

export function useParentFormsDocuments(): ParentFormsDocumentsContextValue {
  const context = useContext(ParentFormsDocumentsContext);
  if (!context) {
    throw new Error('useParentFormsDocuments must be used within ParentFormsDocumentsProvider');
  }
  return context;
}
