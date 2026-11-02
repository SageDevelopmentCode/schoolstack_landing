"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import {
  computeSupplyListSummary,
  formatSupplyAssignedFamilies,
  formatSupplyEstimatedPrice,
  formatSupplyPriceCents,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  supplyColorLegendDisplayLabel,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyListRowStyle,
  supplyUsageTimingLabel,
  newCoopSupplyListItem,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import {
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
  type CoopSupplyListFilters,
} from "@/lib/admissions/program-coop-supply-list-filters";
import CoopSupplyListFilterBar from "@/components/admissions/CoopSupplyListFilterBar";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CoopSupplyColorLegendEditPanel from "@/components/school-admin/admissions/CoopSupplyColorLegendEditPanel";
import CoopSupplyListItemDetailPanel from "@/components/school-admin/admissions/CoopSupplyListItemDetailPanel";
import { BuilderSectionIntro } from "@/components/school-admin/admissions/builder-question-card";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type PendingSidebarAction =
  | { type: "selectRow"; id: string | null }
  | { type: "openLegend" }
  | { type: "openNewDraft" };

const TABLE_HEADINGS = [
  "Item",
  "Type",
  "When",
  "Qty",
  "Est. price",
  "Member",
  "Where to buy",
] as const;

type CommitteeProjectSupplyListCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  items: CoopSupplyListItem[];
  colorLegend: CoopSupplyColorLegendEntry[];
  memberFamilies: ReadonlyArray<ProgramCoopFamily>;
  readOnly?: boolean;
  loading?: boolean;
  onItemsChange: (items: CoopSupplyListItem[]) => void;
  onLegendChange: (legend: CoopSupplyColorLegendEntry[]) => void | Promise<void>;
  onSaveItem: (item: CoopSupplyListItem) => Promise<CoopSupplyListItem>;
  onCreateItem: (item: CoopSupplyListItem) => Promise<CoopSupplyListItem>;
  onRemoveItem: (item: CoopSupplyListItem) => Promise<void>;
};

function CoopSupplyColorLegendCard({
  C,
  theme,
  legend,
  onEditClick,
  readOnly,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  legend: CoopSupplyColorLegendEntry[];
  onEditClick: () => void;
  readOnly: boolean;
}) {
  return (
    <AdminCard theme={theme} className="p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {legend.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
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
        {!readOnly ? (
          <AdminButton theme={theme} variant="soft" size="compact" className="shrink-0" onClick={onEditClick}>
            Edit
          </AdminButton>
        ) : null}
      </div>
    </AdminCard>
  );
}

export default function CommitteeProjectSupplyListCard({
  C,
  theme,
  items,
  colorLegend,
  memberFamilies,
  onItemsChange,
  onLegendChange,
  onSaveItem,
  onCreateItem,
  onRemoveItem,
  readOnly = false,
  loading = false,
}: CommitteeProjectSupplyListCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingNewItem, setPendingNewItem] = useState<CoopSupplyListItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [legendPanelOpen, setLegendPanelOpen] = useState(false);
  const [legendPanelDirty, setLegendPanelDirty] = useState(false);
  const [pendingSidebarAction, setPendingSidebarAction] =
    useState<PendingSidebarAction | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CoopSupplyListFilters>(
    DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  );

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);
  const familyNameMap = useMemo(
    () => new Map(memberFamilies.map((family) => [family.familyId, family.familyName])),
    [memberFamilies],
  );
  const filteredItems = useMemo(
    () => filterCoopSupplyListItems(items, filters, { variant: "admin" }),
    [filters, items],
  );
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const panelItem = pendingNewItem ?? selectedItem;
  const isCreateMode = pendingNewItem !== null;

  const saveItem = async (
    saved: CoopSupplyListItem,
    meta: { savedBaseline: CoopSupplyListItem },
  ) => {
    try {
      if (isCreateMode && pendingNewItem && saved.id === pendingNewItem.id) {
        const persisted = await onCreateItem(saved);
        onItemsChange([...items, persisted]);
        setPendingNewItem(null);
        setPanelDirty(false);
        return persisted;
      }

      const persisted = await onSaveItem(saved);
      onItemsChange(items.map((item) => (item.id === persisted.id ? persisted : item)));
      return persisted;
    } catch (err) {
      adminToast.error(
        formatActionError(
          err,
          isCreateMode ? "Failed to add supply item." : "Failed to save supply item.",
        ),
      );
      throw err;
    }
  };

  const removeItem = async (item: CoopSupplyListItem) => {
    try {
      await onRemoveItem(item);
      onItemsChange(items.filter((row) => row.id !== item.id));
      setSelectedId((current) => (current === item.id ? null : current));
      setPanelDirty(false);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove supply item."));
      throw err;
    }
  };

  const openNewDraft = () => {
    setLegendPanelOpen(false);
    setLegendPanelDirty(false);
    setSelectedId(null);
    setPendingNewItem({ ...newCoopSupplyListItem(), id: crypto.randomUUID() });
    setPanelDirty(false);
  };

  const closeItemPanel = () => {
    setSelectedId(null);
    setPendingNewItem(null);
    setPanelDirty(false);
  };

  const openLegendPanel = () => {
    setPendingNewItem(null);
    setSelectedId(null);
    setPanelDirty(false);
    setLegendPanelOpen(true);
  };

  const executePendingSidebarAction = (action: PendingSidebarAction) => {
    if (action.type === "openLegend") {
      openLegendPanel();
      return;
    }
    if (action.type === "openNewDraft") {
      openNewDraft();
      return;
    }
    setLegendPanelOpen(false);
    setLegendPanelDirty(false);
    setPendingNewItem(null);
    setPanelDirty(false);
    setSelectedId(action.id);
  };

  const requestSidebarAction = (action: PendingSidebarAction) => {
    const itemPanelActive = selectedId !== null || pendingNewItem !== null;
    const itemDirtyBlocked =
      itemPanelActive &&
      panelDirty &&
      (action.type === "openLegend" ||
        action.type === "selectRow" ||
        action.type === "openNewDraft");
    const legendDirtyBlocked = legendPanelOpen && legendPanelDirty;

    if (itemDirtyBlocked || legendDirtyBlocked) {
      setPendingSidebarAction(action);
      setDiscardDialogOpen(true);
      return;
    }

    if (action.type === "openLegend") {
      openLegendPanel();
      return;
    }

    if (action.type === "openNewDraft") {
      openNewDraft();
      return;
    }

    if (legendPanelOpen) {
      setLegendPanelOpen(false);
      setLegendPanelDirty(false);
    }

    setPendingNewItem(null);
    setPanelDirty(false);
    setSelectedId(action.id);
  };

  const addItem = () => {
    if (readOnly) return;
    requestSidebarAction({ type: "openNewDraft" });
  };

  const saveLegend = async (legend: CoopSupplyColorLegendEntry[]) => {
    await onLegendChange(legend);
  };

  const handleRowSelect = (id: string) => {
    if (readOnly) return;
    if (selectedId === id) {
      requestSidebarAction({ type: "selectRow", id: null });
      return;
    }
    requestSidebarAction({ type: "selectRow", id });
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-md border px-4 py-12 text-sm"
        style={{ borderColor: C.border, color: C.textSecondary }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading supply list…
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <BuilderSectionIntro
            C={C}
            theme={theme}
            eyebrow="Project supplies"
            title="Supply list"
            subtitle="Track materials and who is bringing them for this committee project."
          />
          {!readOnly ? (
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              className="shrink-0"
              onClick={() => addItem()}
            >
              <Plus className="h-4 w-4" />
              Add supply item
            </AdminButton>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3">
          <AdminMetricCard theme={theme} value={String(summary.itemCount)} label="Supply items" accent="forest" />
          <AdminMetricCard theme={theme} value={String(summary.assignedCount)} label="Assigned" accent="sky" />
          <AdminMetricCard
            theme={theme}
            value={`~${formatSupplyPriceCents(summary.totalCents)}`}
            label="Estimated total"
            accent="gold"
          />
        </div>

        <CoopSupplyColorLegendCard
          C={C}
          theme={theme}
          legend={colorLegend}
          onEditClick={() => requestSidebarAction({ type: "openLegend" })}
          readOnly={readOnly}
        />

        <CoopSupplyListFilterBar
          variant="admin"
          filters={filters}
          onChange={setFilters}
          colorLegend={colorLegend}
          theme={theme}
          C={C}
          resultCount={filteredItems.length}
          totalCount={items.length}
        />

        <AdminCard theme={theme} padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            {filteredItems.length === 0 ? (
              <p className="px-4 py-8 text-sm" style={{ color: C.textSecondary }}>
                No supply items match the current filters.
              </p>
            ) : (
              <table className="min-w-[860px] w-full border-collapse text-left">
                <thead style={{ backgroundColor: "#FBFCFB" }}>
                  <tr>
                    {TABLE_HEADINGS.map((heading) => (
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
                <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {filteredItems.map((item) => {
                    const isSelected = item.id === selectedId;
                    const isHovered = item.id === hoveredId;
                    const colorEntry = getSupplyColorLegendEntry(colorLegend, item.colorId);
                    const rowStyle = supplyListRowStyle(C, {
                      colorHex: colorEntry?.hex ?? null,
                      isSelected,
                      isHovered,
                    });

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleRowSelect(item.id)}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={readOnly ? undefined : "cursor-pointer transition-colors"}
                        style={{ ...rowStyle, borderTop: "1px solid #EDF1ED" }}
                      >
                        <td className="px-[15px] py-3">
                          <div className="text-xs font-semibold" style={{ color: theme.ink }}>
                            {supplyItemDisplayName(item)}
                          </div>
                        </td>
                        <td className="px-[15px] py-3">
                          <AdminChip theme={theme} tone={supplyItemTypeChipTone(item.itemType)}>
                            {supplyItemTypeLabel(item.itemType)}
                          </AdminChip>
                        </td>
                        <td className="px-[15px] py-3 text-xs" style={{ color: "#607078" }}>
                          {supplyUsageTimingLabel(item)}
                        </td>
                        <td className="px-[15px] py-3 text-xs" style={{ color: "#607078" }}>
                          {formatSupplyQuantity(item)}
                        </td>
                        <td className="px-[15px] py-3 text-xs" style={{ color: "#607078" }}>
                          {formatSupplyEstimatedPrice(item.estimatedPrice)}
                        </td>
                        <td className="max-w-[180px] px-[15px] py-3">
                          <div className="truncate text-xs" style={{ color: "#607078" }}>
                            {formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNameMap)}
                          </div>
                        </td>
                        <td className="max-w-[180px] px-[15px] py-3">
                          <div className="truncate text-xs" style={{ color: "#607078" }}>
                            {item.whereToBuy.trim() || "—"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </motion.tbody>
              </table>
            )}
          </div>
        </AdminCard>

        {!readOnly ? (
          <button
            type="button"
            onClick={() => addItem()}
            className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-4 text-sm font-medium"
            style={{
              border: `2px dashed ${C.borderStrong}`,
              backgroundColor: C.bg,
              color: C.accent,
            }}
          >
            <Plus className="h-4 w-4" />
            Add supply item
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {panelItem && !readOnly ? (
          <CoopSupplyListItemDetailPanel
            item={panelItem}
            mode={isCreateMode ? "create" : "edit"}
            colorLegend={colorLegend}
            enrolledFamilies={memberFamilies}
            C={C}
            theme={theme}
            onClose={closeItemPanel}
            onSave={saveItem}
            onDirtyChange={setPanelDirty}
            onRemove={() => {
              if (selectedItem) void removeItem(selectedItem);
            }}
            canRemove={!isCreateMode}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {legendPanelOpen && !readOnly ? (
          <CoopSupplyColorLegendEditPanel
            legend={colorLegend}
            C={C}
            theme={theme}
            onClose={() => {
              setLegendPanelOpen(false);
              setLegendPanelDirty(false);
            }}
            onSave={saveLegend}
            onDirtyChange={setLegendPanelDirty}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={() => {
          if (pendingSidebarAction) {
            executePendingSidebarAction(pendingSidebarAction);
          } else {
            closeItemPanel();
          }
          setPendingSidebarAction(null);
          setDiscardDialogOpen(false);
        }}
        onClose={() => {
          setPendingSidebarAction(null);
          setDiscardDialogOpen(false);
        }}
      />
    </>
  );
}
