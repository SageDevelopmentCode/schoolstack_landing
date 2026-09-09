"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  computeSupplyListSummary,
  formatSupplyEstimatedPrice,
  formatSupplyPriceCents,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  MOCK_COOP_SUPPLY_COLOR_LEGEND,
  MOCK_COOP_SUPPLY_ITEMS,
  newCoopSupplyListItem,
  supplyColorLegendDisplayLabel,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyListRowStyle,
  supplyParentLabel,
  supplyUsageTimingLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CoopSupplyColorLegendEditPanel from "./CoopSupplyColorLegendEditPanel";
import CoopSupplyListItemDetailPanel from "./CoopSupplyListItemDetailPanel";
import { BuilderQuestionCard } from "./builder-question-card";

type ProgramCoopSupplyListCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
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
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: C.textTertiary }}
        >
          Color categories
        </p>
        <AdminButton theme={theme} variant="soft" size="compact" onClick={onEditClick}>
          Edit
        </AdminButton>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
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
    </AdminCard>
  );
}

export default function ProgramCoopSupplyListCard({
  C,
  theme,
  coopModeEnabled,
}: ProgramCoopSupplyListCardProps) {
  const [items, setItems] = useState<CoopSupplyListItem[]>(() =>
    MOCK_COOP_SUPPLY_ITEMS.map((item) => ({ ...item })),
  );
  const [colorLegend, setColorLegend] = useState<CoopSupplyColorLegendEntry[]>(() =>
    MOCK_COOP_SUPPLY_COLOR_LEGEND.map((entry) => ({ ...entry })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [legendPanelOpen, setLegendPanelOpen] = useState(false);
  const [legendPanelDirty, setLegendPanelDirty] = useState(false);
  const [pendingSidebarAction, setPendingSidebarAction] =
    useState<PendingSidebarAction | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const saveItem = (saved: CoopSupplyListItem) => {
    setItems((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    setPanelDirty(false);
  };

  const addItem = () => {
    const nextItem = newCoopSupplyListItem();
    setItems((current) => [...current, nextItem]);
    setSelectedId(nextItem.id);
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

  if (!coopModeEnabled) {
    return (
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
    );
  }

  return (
    <>
      <div className="space-y-4">
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

        <AdminCard theme={theme} padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
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
                {items.map((item) => {
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
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078" }}
                      >
                        {supplyParentLabel(item.assignedParent)}
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
          </div>
        </AdminCard>

        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-4 text-sm font-medium transition-colors"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            backgroundColor: C.bg,
            color: C.accent,
          }}
        >
          <Plus className="h-4 w-4" />
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
            onRemove={() => removeItem(selectedItem.id)}
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
            onSave={setColorLegend}
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
