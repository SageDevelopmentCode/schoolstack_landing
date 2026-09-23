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

import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';
import {
  fetchFridayBranchSchedule,
  saveFridayBranchSchedule,
} from '@/lib/school-admin/friday-branch/friday-branch-api';
import type { FridayBranchBlock } from '@/lib/school-admin/friday-branch/friday-branch-types';
import { diffRemovedFridayBranchFlyerPaths } from '@/lib/school-admin/friday-branch/friday-branch-flyer-paths';
import { removeFridayBranchClassFlyer } from '@/lib/school-admin/friday-branch/friday-branch-flyer-storage';
import {
  cloneFridayBranchBlocks,
  createEmptyBlock,
  duplicateBlock,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { createPortalCache } from '@/lib/portal-cache';
import { getSupabaseClient } from '@/lib/supabase';

type SchoolAdminFridayBranchContextValue = {
  blocks: FridayBranchBlock[];
  savedBlocks: FridayBranchBlock[];
  selectedBlockId: string | null;
  isDirty: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  error: string | null;
  hasLoaded: boolean;
  setSelectedBlockId: (blockId: string | null) => void;
  setBlocks: (blocks: FridayBranchBlock[]) => void;
  updateBlock: (block: FridayBranchBlock) => void;
  addBlock: () => void;
  duplicateSelectedBlock: () => void;
  refresh: () => Promise<void>;
  saveSchedule: () => Promise<void>;
  persistSchedule: (blocksToSave: FridayBranchBlock[]) => Promise<FridayBranchBlock[]>;
};

const SchoolAdminFridayBranchContext = createContext<SchoolAdminFridayBranchContextValue | null>(
  null,
);

const scheduleCache = createPortalCache<FridayBranchBlock[]>('school_admin_friday_branch:');

function cacheKey(organizationId: string): string {
  return organizationId;
}

type SchoolAdminFridayBranchProviderProps = {
  children: ReactNode;
  organizationId: string;
};

export function SchoolAdminFridayBranchProvider({
  children,
  organizationId,
}: SchoolAdminFridayBranchProviderProps) {
  const key = cacheKey(organizationId);
  const cached = scheduleCache.get(key);

  const [blocks, setBlocksState] = useState<FridayBranchBlock[]>(cached ?? []);
  const [savedBlocks, setSavedBlocks] = useState<FridayBranchBlock[]>(
    cloneFridayBranchBlocks(cached ?? []),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(cached?.[0]?.id ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const isDirty = useMemo(
    () => JSON.stringify(blocks) !== JSON.stringify(savedBlocks),
    [blocks, savedBlocks],
  );

  const setBlocks = useCallback((nextBlocks: FridayBranchBlock[]) => {
    setBlocksState(cloneFridayBranchBlocks(nextBlocks));
  }, []);

  const updateBlock = useCallback((block: FridayBranchBlock) => {
    setBlocksState((current) =>
      current.map((entry) => (entry.id === block.id ? block : entry)),
    );
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(scheduleCache.get(key));
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextBlocks = await scheduleCache.fetchAndCache(
            key,
            () => fetchFridayBranchSchedule(organizationId),
            options,
          );
          setBlocksState(cloneFridayBranchBlocks(nextBlocks));
          setSavedBlocks(cloneFridayBranchBlocks(nextBlocks));
          setSelectedBlockId((current) => {
            if (current && nextBlocks.some((block) => block.id === current)) {
              return current;
            }
            return nextBlocks[0]?.id ?? null;
          });
          setHasLoaded(true);
        } catch (loadError) {
          reportError('friday_branch.schedule.load', loadError);
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load Friday Branch.',
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      if (!isRefresh) {
        fetchPromiseRef.current = promise;
      }
      await promise;
    },
    [key, organizationId, reportError],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const persistSchedule = useCallback(
    async (blocksToSave: FridayBranchBlock[]): Promise<FridayBranchBlock[]> => {
      const pathsToDelete = diffRemovedFridayBranchFlyerPaths(savedBlocks, blocksToSave);
      setIsSaving(true);
      try {
        const nextBlocks = await saveFridayBranchSchedule(organizationId, blocksToSave);
        const cloned = cloneFridayBranchBlocks(nextBlocks);
        await scheduleCache.fetchAndCache(key, async () => cloned, { refresh: true });
        setBlocksState(cloned);
        setSavedBlocks(cloneFridayBranchBlocks(cloned));
        setSelectedBlockId((current) => {
          if (current && cloned.some((block) => block.id === current)) {
            return current;
          }
          return cloned[0]?.id ?? null;
        });

        if (pathsToDelete.length > 0) {
          const supabase = getSupabaseClient();
          for (const path of pathsToDelete) {
            try {
              await removeFridayBranchClassFlyer(supabase, path);
            } catch {
              // Best-effort cleanup of orphaned flyer files.
            }
          }
        }

        return cloned;
      } catch (saveError) {
        reportError('friday_branch.schedule.save', saveError);
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, reportError, savedBlocks],
  );

  const saveSchedule = useCallback(async () => {
    await persistSchedule(blocks);
  }, [blocks, persistSchedule]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const addBlock = useCallback(() => {
    setBlocksState((current) => {
      const nextBlock = createEmptyBlock(current.length + 1);
      setSelectedBlockId(nextBlock.id);
      return [...current, nextBlock];
    });
  }, []);

  const duplicateSelectedBlock = useCallback(() => {
    setBlocksState((current) => {
      const selected = current.find((block) => block.id === selectedBlockId);
      if (!selected) return current;
      const copy = duplicateBlock(selected);
      setSelectedBlockId(copy.id);
      return [...current, copy];
    });
  }, [selectedBlockId]);

  const value = useMemo(
    () => ({
      blocks,
      savedBlocks,
      selectedBlockId,
      isDirty,
      isLoading,
      isRefreshing,
      isSaving,
      error,
      hasLoaded,
      setSelectedBlockId,
      setBlocks,
      updateBlock,
      addBlock,
      duplicateSelectedBlock,
      refresh,
      saveSchedule,
      persistSchedule,
    }),
    [
      addBlock,
      blocks,
      duplicateSelectedBlock,
      error,
      hasLoaded,
      isDirty,
      isLoading,
      isRefreshing,
      isSaving,
      persistSchedule,
      refresh,
      saveSchedule,
      savedBlocks,
      selectedBlockId,
      setBlocks,
      updateBlock,
    ],
  );

  return (
    <SchoolAdminFridayBranchContext.Provider value={value}>
      {children}
    </SchoolAdminFridayBranchContext.Provider>
  );
}

export function useSchoolAdminFridayBranch(): SchoolAdminFridayBranchContextValue {
  const context = useContext(SchoolAdminFridayBranchContext);
  if (!context) {
    throw new Error(
      'useSchoolAdminFridayBranch must be used within SchoolAdminFridayBranchProvider',
    );
  }
  return context;
}
