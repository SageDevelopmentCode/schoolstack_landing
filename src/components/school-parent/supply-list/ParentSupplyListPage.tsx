"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import CoopSupplyListFilterBar from "@/components/admissions/CoopSupplyListFilterBar";
import ParentCoopSupplyListItemDetailPanel from "@/components/school-parent/supply-list/ParentCoopSupplyListItemDetailPanel";
import ParentSupplyListMobileItemCard from "@/components/school-parent/supply-list/ParentSupplyListMobileItemCard";
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  computeSupplyListSummary,
  formatSupplyAssignedFamilies,
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  isSupplyFamilyAssigned,
  supplyColorLegendDisplayLabel,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyListRowStyle,
  supplyUsageTimingLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
  type SupplyItemType,
} from "@/lib/admissions/program-coop-supply-list-mock";
import {
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
  type CoopSupplyListFilters,
} from "@/lib/admissions/program-coop-supply-list-filters";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";

type ParentSupplyListPageProps = {
  organizationId: string;
  programId: string;
  initialItems: CoopSupplyListItem[];
  initialLegend: CoopSupplyColorLegendEntry[];
  currentParentName: string;
  previewMode?: boolean;
};

type PendingAction = {
  itemId: string;
  type: "claim" | "unclaim";
};

function parentSupplyChipTone(type: SupplyItemType): ParentChipTone {
  const tone = supplyItemTypeChipTone(type);
  return tone === "purple" ? "info" : tone;
}

function signupStatusLabel(
  item: CoopSupplyListItem,
  currentParentName: string,
): string {
  if (isSupplyFamilyAssigned(item.assignedFamilies, currentParentName)) {
    return "You";
  }
  if (item.assignedFamilies.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES) {
    return "Full";
  }
  return "Open";
}

export default function ParentSupplyListPage({
  organizationId,
  programId,
  initialItems,
  initialLegend,
  currentParentName,
  previewMode = false,
}: ParentSupplyListPageProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const [items, setItems] = useState(initialItems);
  const [filters, setFilters] = useState<CoopSupplyListFilters>(
    DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);

  const filteredItems = useMemo(
    () =>
      filterCoopSupplyListItems(items, filters, {
        variant: "parent",
        currentParentName,
      }),
    [currentParentName, filters, items],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const updateItem = useCallback((updated: CoopSupplyListItem) => {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }, []);

  const runAction = useCallback(
    async (itemId: string, type: "claim" | "unclaim") => {
      if (previewMode) return;

      setPendingAction({ itemId, type });
      setActionError(null);

      try {
        const response = await fetch(
          `/api/parent-portal/supply-list/${type === "claim" ? "claim" : "unclaim"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              programId,
              itemId,
            }),
          },
        );

        const payload = (await response.json()) as {
          item?: CoopSupplyListItem;
          error?: string;
        };

        if (!response.ok || !payload.item) {
          throw new Error(payload.error ?? "Unable to update sign-up.");
        }

        updateItem(payload.item);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Unable to update sign-up.",
        );
      } finally {
        setPendingAction(null);
      }
    },
    [organizationId, previewMode, programId, updateItem],
  );

  return (
    <div className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:py-8 md:px-9">
      <div className="mb-5">
        <ParentSectionKicker theme={theme}>Co-op</ParentSectionKicker>
        <div className="mt-1 flex items-center gap-2.5">
          <ClipboardList
            className="h-7 w-7 shrink-0"
            style={{ color: theme.primary }}
            aria-hidden
          />
          <ParentDisplayHeading theme={theme} size="display">
            Supply list
          </ParentDisplayHeading>
        </div>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: theme.muted }}>
          Review shared supplies for the year and sign up for items your family can
          bring.
        </p>
      </div>

      {initialLegend.length > 0 ? (
        <ParentCard theme={theme} className="mb-4 p-3.5">
          <div className="flex flex-wrap gap-2">
            {initialLegend.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                style={{ borderColor: theme.line, backgroundColor: theme.white }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.hex }}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium" style={{ color: theme.ink }}>
                  {supplyColorLegendDisplayLabel(entry)}
                </span>
              </div>
            ))}
          </div>
        </ParentCard>
      ) : null}

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]" style={{ color: theme.muted }}>
            Items
          </div>
          <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: theme.ink }}>
            {summary.itemCount}
          </div>
        </ParentCard>
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]" style={{ color: theme.muted }}>
            With sign-ups
          </div>
          <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: theme.ink }}>
            {summary.assignedCount}
          </div>
        </ParentCard>
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]" style={{ color: theme.muted }}>
            Signed up as
          </div>
          <div className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: theme.ink }}>
            {currentParentName}
          </div>
        </ParentCard>
      </div>

      {actionError ? (
        <div
          className="mb-4 rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: theme.alert,
            backgroundColor: theme.alertBg,
            color: theme.alert,
          }}
        >
          {actionError}
        </div>
      ) : null}

      <CoopSupplyListFilterBar
        variant="parent"
        filters={filters}
        onChange={setFilters}
        colorLegend={initialLegend}
        theme={theme}
        resultCount={filteredItems.length}
        totalCount={items.length}
      />

      {filteredItems.length === 0 ? (
        <p className="py-8 text-sm" style={{ color: theme.muted }}>
          No supply items match the current filters.
        </p>
      ) : (
        <>
          <div className="space-y-2 md:hidden">
            {filteredItems.map((item) => {
              const colorEntry = getSupplyColorLegendEntry(initialLegend, item.colorId);
              const isSelected = item.id === selectedItemId;
              const rowStyle = supplyListRowStyle(C, {
                colorHex: colorEntry?.hex ?? null,
                isSelected,
                isHovered: false,
                variant: "parent",
                parentTheme: theme,
              });

              return (
                <ParentSupplyListMobileItemCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  rowStyle={rowStyle}
                  statusLabel={signupStatusLabel(item, currentParentName)}
                  isSelected={isSelected}
                  onSelect={() => setSelectedItemId(item.id)}
                />
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[980px] w-full border-collapse text-left">
              <thead style={{ backgroundColor: "#FBFCFB" }}>
                <tr>
                  {[
                    "Item",
                    "Type",
                    "When",
                    "Qty",
                    "Est. price",
                    "Parents",
                    "Where to buy",
                    "Sign up",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                      style={{ color: "#8B9699" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const colorEntry = getSupplyColorLegendEntry(initialLegend, item.colorId);
                  const isSelected = item.id === selectedItemId;
                  const isHovered = item.id === hoveredItemId;
                  const rowStyle = supplyListRowStyle(C, {
                    colorHex: colorEntry?.hex ?? null,
                    isSelected,
                    isHovered,
                    variant: "parent",
                    parentTheme: theme,
                  });
                  const statusLabel = signupStatusLabel(item, currentParentName);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      className="cursor-pointer transition-colors"
                      style={{
                        ...rowStyle,
                        borderTop: `1px solid ${theme.line}`,
                      }}
                    >
                      <td className="px-[15px] py-3">
                        <div className="text-xs font-semibold" style={{ color: theme.ink }}>
                          {supplyItemDisplayName(item)}
                        </div>
                      </td>
                      <td className="px-[15px] py-3">
                        <ParentChip theme={theme} tone={parentSupplyChipTone(item.itemType)}>
                          {supplyItemTypeLabel(item.itemType)}
                        </ParentChip>
                      </td>
                      <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted }}>
                        {supplyUsageTimingLabel(item)}
                      </td>
                      <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted }}>
                        {formatSupplyQuantity(item)}
                      </td>
                      <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted }}>
                        {formatSupplyEstimatedPrice(item.estimatedPrice)}
                      </td>
                      <td className="max-w-[180px] px-[15px] py-3">
                        <div
                          className="truncate text-xs"
                          style={{ color: theme.muted }}
                          title={
                            item.assignedFamilies.length > 0
                              ? formatSupplyAssignedFamilies(item.assignedFamilies)
                              : undefined
                          }
                        >
                          {formatSupplyAssignedFamilies(item.assignedFamilies)}
                        </div>
                      </td>
                      <td className="max-w-[180px] px-[15px] py-3">
                        <div
                          className="truncate text-xs"
                          style={{ color: theme.muted }}
                          title={item.whereToBuy || undefined}
                        >
                          {item.whereToBuy.trim() || "—"}
                        </div>
                      </td>
                      <td className="px-[15px] py-3">
                        <span
                          className="text-xs font-medium"
                          style={{
                            color:
                              statusLabel === "You"
                                ? theme.success
                                : statusLabel === "Full"
                                  ? theme.muted
                                  : theme.primary,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedItem ? (
          <ParentCoopSupplyListItemDetailPanel
            item={selectedItem}
            colorLegend={initialLegend}
            theme={theme}
            currentParentName={currentParentName}
            previewMode={previewMode}
            pendingAction={pendingAction}
            onClose={() => setSelectedItemId(null)}
            onClaim={() => void runAction(selectedItem.id, "claim")}
            onUnclaim={() => void runAction(selectedItem.id, "unclaim")}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
