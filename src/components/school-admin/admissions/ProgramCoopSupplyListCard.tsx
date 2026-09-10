"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  computeSupplyListSummary,
  defaultCoopSupplyColorLegend,
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
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import {
  deleteProgramCoopSupplyItem,
  insertProgramCoopSupplyItem,
  listProgramCoopSupplyList,
  replaceProgramCoopSupplyColorLegend,
  upsertProgramCoopSupplyItem,
} from "@/lib/admissions/program-coop-supply-list-storage";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CoopSupplyListFilterBar from "@/components/admissions/CoopSupplyListFilterBar";
import {
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
  type CoopSupplyListFilters,
} from "@/lib/admissions/program-coop-supply-list-filters";
import CoopSupplyColorLegendEditPanel from "./CoopSupplyColorLegendEditPanel";
import CoopSupplyListItemDetailPanel from "./CoopSupplyListItemDetailPanel";
import { BuilderQuestionCard, BuilderSectionIntro } from "./builder-question-card";

type ProgramCoopSupplyListCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  programId: string;
  coopModeEnabled: boolean;
};

type PendingSidebarAction =
  | { type: "selectRow"; id: string | null }
  | { type: "openLegend" };

const TABLE_HEADINGS = [
  "Item",
  "Type",
  "When",
  "Qty",
  "Est. price",
  "Parent",
  "Where to buy",
] as const;

type CoopSupplyColorLegendCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  legend: CoopSupplyColorLegendEntry[];
  onEditClick: () => void;
};

function CoopSupplyColorLegendCard({
  C,
  theme,
  legend,
  onEditClick,
}: CoopSupplyColorLegendCardProps) {
  return (
    <AdminCard theme={theme} className="p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {legend.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
              style={{
                borderColor: C.border,
                backgroundColor: C.bg,
              }}
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
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          className="shrink-0"
          onClick={onEditClick}
        >
          Edit
        </AdminButton>
      </div>
    </AdminCard>
  );
}

export default function ProgramCoopSupplyListCard({
  C,
  theme,
  supabase,
  organizationId,
  programId,
  coopModeEnabled,
}: ProgramCoopSupplyListCardProps) {
  const [items, setItems] = useState<CoopSupplyListItem[]>([]);
  const [colorLegend, setColorLegend] = useState<CoopSupplyColorLegendEntry[]>(() =>
    defaultCoopSupplyColorLegend(),
  );
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const supplyListContext = useMemo(
    () => ({ organizationId, programId }),
    [organizationId, programId],
  );

  const loadSupplyList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProgramCoopSupplyList(supabase, programId);
      setItems(result.items);
      setColorLegend(result.colorLegend);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load supply list."));
    } finally {
      setLoading(false);
    }
  }, [programId, supabase]);

  useEffect(() => {
    setSelectedId(null);
    setLegendPanelOpen(false);
    setPanelDirty(false);
    setLegendPanelDirty(false);
  }, [programId]);

  useEffect(() => {
    if (!coopModeEnabled) {
      setLoading(false);
      return;
    }
    queueMicrotask(() => {
      void loadSupplyList();
    });
  }, [coopModeEnabled, loadSupplyList]);

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);
  const filteredItems = useMemo(
    () => filterCoopSupplyListItems(items, filters, { variant: "admin" }),
    [filters, items],
  );
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const saveItem = async (saved: CoopSupplyListItem) => {
    try {
      const persisted = await upsertProgramCoopSupplyItem(
        supabase,
        supplyListContext,
        saved,
      );
      setItems((current) =>
        current.map((item) => (item.id === persisted.id ? persisted : item)),
      );
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save supply item."));
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteProgramCoopSupplyItem(supabase, id);
      setItems((current) => current.filter((item) => item.id !== id));
      setSelectedId((current) => (current === id ? null : current));
      setPanelDirty(false);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove supply item."));
      throw err;
    }
  };

  const addItem = async () => {
    if (addingItem) return;
    setAddingItem(true);
    try {
      const nextItem = await insertProgramCoopSupplyItem(supabase, supplyListContext);
      setItems((current) => [...current, nextItem]);
      setSelectedId(nextItem.id);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add supply item."));
    } finally {
      setAddingItem(false);
    }
  };

  const saveLegend = async (legend: CoopSupplyColorLegendEntry[]) => {
    try {
      const persisted = await replaceProgramCoopSupplyColorLegend(
        supabase,
        supplyListContext,
        legend,
      );
      setColorLegend(persisted);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save color categories."));
      throw err;
    }
  };

  const openLegendPanel = () => {
    setSelectedId(null);
    setPanelDirty(false);
    setLegendPanelOpen(true);
  };

  const executePendingSidebarAction = (action: PendingSidebarAction) => {
    if (action.type === "openLegend") {
      openLegendPanel();
      return;
    }
    setLegendPanelOpen(false);
    setLegendPanelDirty(false);
    setSelectedId(action.id);
  };

  const requestSidebarAction = (action: PendingSidebarAction) => {
    const itemDirtyBlocked =
      selectedId !== null &&
      panelDirty &&
      (action.type === "openLegend" || action.type === "selectRow");
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

    if (legendPanelOpen) {
      setLegendPanelOpen(false);
      setLegendPanelDirty(false);
    }

    setSelectedId(action.id);
  };

  const handleRowSelect = (id: string) => {
    if (selectedId === id) {
      requestSidebarAction({ type: "selectRow", id: null });
      return;
    }
    requestSidebarAction({ type: "selectRow", id });
  };

  const handleEditLegend = () => {
    requestSidebarAction({ type: "openLegend" });
  };

  const handleConfirmDiscardSelection = () => {
    if (pendingSidebarAction) {
      if (selectedId !== null && panelDirty) {
        setSelectedId(null);
        setPanelDirty(false);
      }
      executePendingSidebarAction(pendingSidebarAction);
    }
    setPendingSidebarAction(null);
    setDiscardDialogOpen(false);
  };

  const handleCancelDiscardSelection = () => {
    setPendingSidebarAction(null);
    setDiscardDialogOpen(false);
  };

  const sectionHeader = (
    <div className="flex items-start justify-between gap-4">
      <BuilderSectionIntro
        C={C}
        theme={theme}
        eyebrow="Co-op supply list"
        title="Supply list"
        subtitle="Manage the supply list families need for this co-op program."
      />
      {coopModeEnabled ? (
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          className="shrink-0"
          onClick={() => void addItem()}
          disabled={addingItem || loading}
        >
          {addingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add supply item
        </AdminButton>
      ) : null}
    </div>
  );

  if (!coopModeEnabled) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="Co-op supply list"
          helper="Enable co-op mode in portal settings (configured by MudKitchen) to manage the supply list for families."
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Co-op mode is not enabled for this program.
          </p>
        </BuilderQuestionCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <div
          className="flex items-center justify-center gap-2 rounded-md border px-4 py-12 text-sm"
          style={{ borderColor: C.border, color: C.textSecondary }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading supply list…
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sectionHeader}
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3">
          <AdminMetricCard
            theme={theme}
            value={String(summary.itemCount)}
            label="Supply items"
            accent="forest"
          />
          <AdminMetricCard
            theme={theme}
            value={String(summary.assignedCount)}
            label="Assigned"
            accent="sky"
          />
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
          onEditClick={handleEditLegend}
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
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
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
                      className="cursor-pointer transition-colors"
                      style={{
                        ...rowStyle,
                        borderTop: "1px solid #EDF1ED",
                      }}
                    >
                      <td className="px-[15px] py-3">
                        <div
                          className="text-xs font-semibold"
                          style={{ color: theme.ink }}
                        >
                          {supplyItemDisplayName(item)}
                        </div>
                      </td>
                      <td className="px-[15px] py-3">
                        <AdminChip theme={theme} tone={supplyItemTypeChipTone(item.itemType)}>
                          {supplyItemTypeLabel(item.itemType)}
                        </AdminChip>
                      </td>
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078" }}
                      >
                        {supplyUsageTimingLabel(item)}
                      </td>
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078" }}
                      >
                        {formatSupplyQuantity(item)}
                      </td>
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078" }}
                      >
                        {formatSupplyEstimatedPrice(item.estimatedPrice)}
                      </td>
                      <td className="max-w-[180px] px-[15px] py-3">
                        <div
                          className="truncate text-xs"
                          style={{ color: "#607078" }}
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
                          style={{ color: "#607078" }}
                          title={item.whereToBuy || undefined}
                        >
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

        <button
          type="button"
          onClick={() => void addItem()}
          disabled={addingItem}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-4 text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            backgroundColor: C.bg,
            color: C.accent,
          }}
        >
          {addingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add supply item
        </button>
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <CoopSupplyListItemDetailPanel
            item={selectedItem}
            colorLegend={colorLegend}
            C={C}
            theme={theme}
            onClose={() => {
              setSelectedId(null);
              setPanelDirty(false);
            }}
            onSave={saveItem}
            onDirtyChange={setPanelDirty}
            onRemove={() => void removeItem(selectedItem.id)}
            canRemove={items.length > 1}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {legendPanelOpen ? (
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
        onConfirm={handleConfirmDiscardSelection}
        onClose={handleCancelDiscardSelection}
      />
    </>
  );
}
