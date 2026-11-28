import { useCallback, useEffect, useRef, useState } from 'react';

import type { CoopToggleResult } from '@/components/parent/coop/garden/use-coop-signup-feedback';
import { isSupplyFamilyAssigned } from '@/lib/parent/coop/supply-list-helpers';
import {
  claimParentCoopSupplyItem,
  fetchParentCoopSupplyListPageData,
  unclaimParentCoopSupplyItem,
  type ParentCoopSupplyListItem,
  type ParentCoopSupplyListPageData,
} from '@/lib/parent/parent-portal-api';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type CoopSupplyListController = {
  status: 'loading' | 'error' | 'ready';
  error: string | null;
  items: ParentCoopSupplyListItem[];
  colorLegend: ParentCoopSupplyListPageData['colorLegend'];
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  /** Item id while a claim / unclaim is running. */
  pendingId: string | null;
  readOnly: boolean;
  refresh: () => Promise<void>;
  toggleItem: (item: ParentCoopSupplyListItem) => Promise<CoopToggleResult>;
};

/** Data + actions for the co-op Supply list. Same endpoints and rules as before Garden. */
export function useCoopSupplyListController({
  organizationId,
  programId,
}: {
  organizationId: string;
  programId: string;
}): CoopSupplyListController {
  const readOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParentCoopSupplyListItem[]>([]);
  const [colorLegend, setColorLegend] = useState<ParentCoopSupplyListPageData['colorLegend']>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState('');
  const [familyNameMap, setFamilyNameMap] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const pendingRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchParentCoopSupplyListPageData(organizationId, programId);
      setItems(data.items);
      setColorLegend(data.colorLegend ?? []);
      setCurrentFamilyId(data.currentFamilyId);
      setFamilyNameMap(data.familyNameMap);
      hasLoadedRef.current = true;
      setStatus('ready');
    } catch (loadError) {
      reportError('parent_coop_supply_list_load', loadError, {
        entityType: 'program',
        entityId: programId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load supply list.');
      if (!hasLoadedRef.current) setStatus('error');
    }
  }, [organizationId, programId, reportError]);

  useEffect(() => {
    hasLoadedRef.current = false;
    setStatus('loading');
    void load();
  }, [load]);

  const toggleItem = useCallback(
    async (item: ParentCoopSupplyListItem): Promise<CoopToggleResult> => {
      if (readOnly || pendingRef.current) return { ok: null };
      pendingRef.current = true;
      setPendingId(item.id);
      const signedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
      try {
        const input = { organizationId, programId, itemId: item.id };
        const result = signedUp
          ? await unclaimParentCoopSupplyItem(input)
          : await claimParentCoopSupplyItem(input);
        setItems((prev) => prev.map((row) => (row.id === item.id ? result.item : row)));
        return { ok: true, signedUp: !signedUp };
      } catch (claimError) {
        reportError('parent_coop_supply_list_claim', claimError, {
          entityType: 'program',
          entityId: programId,
        });
        await load();
        return {
          ok: false,
          wasSignedUp: signedUp,
          error:
            claimError instanceof Error && claimError.message
              ? claimError.message
              : 'Unable to update sign-up.',
        };
      } finally {
        pendingRef.current = false;
        setPendingId(null);
      }
    },
    [currentFamilyId, load, organizationId, programId, readOnly, reportError],
  );

  return {
    status,
    error,
    items,
    colorLegend,
    currentFamilyId,
    familyNameMap,
    pendingId,
    readOnly,
    refresh: load,
    toggleItem,
  };
}
