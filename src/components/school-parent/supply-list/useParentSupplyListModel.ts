"use client";

import { useCallback, useMemo, useState } from "react";
import {
  computeSupplyListSummary,
  isSupplyFamilyAssigned,
  supplyItemDisplayName,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import {
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
  type CoopSupplyListFilters,
} from "@/lib/admissions/program-coop-supply-list-filters";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentSupplyListPendingAction } from "./ParentSupplyListSignupButton";

/**
 * View-model for the parent co-op Supply list: items (updated in place after
 * a claim / unclaim), filters, the open drawer item and the pending action.
 * Same endpoints and rules as before the Garden migration.
 */
export function useParentSupplyListModel({
  organizationId,
  programId,
  initialItems,
  currentFamilyId,
  familyNameMap,
  previewMode,
}: {
  organizationId: string;
  programId: string;
  initialItems: CoopSupplyListItem[];
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  previewMode: boolean;
}) {
  const familyNames = useMemo(() => new Map(Object.entries(familyNameMap)), [familyNameMap]);
  const [items, setItems] = useState(initialItems);
  const [filters, setFilters] = useState<CoopSupplyListFilters>(DEFAULT_COOP_SUPPLY_LIST_FILTERS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ParentSupplyListPendingAction | null>(null);

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);
  const mySignupCount = useMemo(
    () => items.filter((item) => isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId)).length,
    [currentFamilyId, items],
  );

  const filteredItems = useMemo(
    () => filterCoopSupplyListItems(items, filters, { variant: "parent", currentFamilyId }),
    [currentFamilyId, filters, items],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const runAction = useCallback(
    async (itemId: string, type: "claim" | "unclaim") => {
      if (previewMode) return;
      const target = items.find((item) => item.id === itemId);
      const itemName = target ? supplyItemDisplayName(target) : "this item";

      setPendingAction({ itemId, type });
      let response: Response | undefined;
      try {
        response = await fetch(`/api/parent-portal/supply-list/${type === "claim" ? "claim" : "unclaim"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, programId, itemId }),
        });
        const payload = (await response.json()) as { item?: CoopSupplyListItem; error?: string };
        if (!response.ok || !payload.item) {
          throw new Error(payload.error ?? "Unable to update sign-up.");
        }
        const updated = payload.item;
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        if (type === "claim") {
          parentToast.success(`Signed up for ${itemName}`, {
            description: "Thanks! It's on your family's list for the co-op.",
          });
        } else {
          parentToast.success(`Removed you from ${itemName}`, {
            description: "The spot is open for another family.",
          });
        }
      } catch (error) {
        parentToast.error(type === "claim" ? "Couldn't sign you up" : "Couldn't remove your sign-up", {
          description: error instanceof Error ? error.message : "Unable to update sign-up.",
        });
        void reportPortalOperationalError(
          "parent_portal",
          { organizationId, operation: "supply_list.update_signup", error: "" },
          error,
          response?.status,
        );
      } finally {
        setPendingAction(null);
      }
    },
    [items, organizationId, previewMode, programId],
  );

  return {
    items,
    familyNames,
    filters,
    setFilters,
    filteredItems,
    summary,
    mySignupCount,
    selectedItem,
    selectedItemId,
    openItem: setSelectedItemId,
    closeItem: useCallback(() => setSelectedItemId(null), []),
    pendingAction,
    claim: useCallback((itemId: string) => void runAction(itemId, "claim"), [runAction]),
    unclaim: useCallback((itemId: string) => void runAction(itemId, "unclaim"), [runAction]),
  };
}

export type ParentSupplyListModel = ReturnType<typeof useParentSupplyListModel>;
