"use client";

import { useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { ChevronDown, GripVertical, Layers, Plus, X } from "lucide-react";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  getChecklistItemSummary,
  type EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  CHECKLIST_STEP_ICON_COLORS,
  CHECKLIST_STEP_ICON_MAP,
} from "./enrollment-checklist-icons";
import EnrollmentChecklistItemEditor from "./EnrollmentChecklistItemEditor";

type EnrollmentChecklistItemListProps = {
  C: AdminThemeTokens;
  items: EnrollmentChecklistItem[];
  expandedItemId: string | null;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  onExpandItem: (itemId: string | null) => void;
  onReorderItems: (items: EnrollmentChecklistItem[]) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
};

function ChecklistItemRow({
  C,
  item,
  itemIdx,
  totalItems,
  isExpanded,
  orgSlug,
  stripePaymentsReady,
  onToggleExpand,
  onUpdate,
  onDelete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  totalItems: number;
  isExpanded: boolean;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  onToggleExpand: () => void;
  onUpdate: (item: EnrollmentChecklistItem) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const dragControls = useDragControls();
  const summary = getChecklistItemSummary(item);
  const isLast = itemIdx === totalItems - 1;
  const iconColors = CHECKLIST_STEP_ICON_COLORS[item.icon];
  const Icon = CHECKLIST_STEP_ICON_MAP[item.icon];

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex gap-3"
      style={{ listStyle: "none" }}
      layout="position"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex w-6 flex-shrink-0 flex-col items-center">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `2px solid ${C.accent}`,
          }}
        >
          {itemIdx + 1}
        </div>
        {!isLast && (
          <div
            className="mt-1 w-px flex-1 min-h-[12px]"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>

      <div className="mb-3 min-w-0 flex-1">
        <div
          className="overflow-hidden rounded-sm"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${isExpanded ? C.accent : C.border}`,
            boxShadow: isExpanded ? `0 0 0 2px ${C.accentLight}` : C.shadowCard,
          }}
        >
          <div className="flex w-full items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                style={{
                  backgroundColor: iconColors.bg,
                  color: iconColors.color,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {item.label}
                  </div>
                  {!item.required && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: C.surface,
                        color: C.textTertiary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      Optional
                    </span>
                  )}
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                    style={{ backgroundColor: C.bg, color: C.textTertiary }}
                  >
                    {CHECKLIST_ITEM_TYPE_LABELS[item.type]}
                  </span>
                </div>
                {!isExpanded && (
                  <div
                    className="mt-0.5 truncate text-[10px]"
                    style={{ color: C.textTertiary }}
                  >
                    {summary}
                  </div>
                )}
              </div>
            </button>

            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                type="button"
                aria-label="Drag to reorder item"
                title="Drag to reorder"
                className="touch-none cursor-grab rounded p-1 outline-none active:cursor-grabbing"
                style={{ color: C.textQuaternary }}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              {hovered && (
                <button
                  type="button"
                  aria-label="Remove item"
                  title="Remove item"
                  onClick={onDelete}
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                aria-label={isExpanded ? "Collapse item" : "Expand item"}
                onClick={onToggleExpand}
                className="rounded p-1 outline-none"
                style={{ color: C.textTertiary }}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-150"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="space-y-4 px-3 pb-3 pt-2"
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                  }}
                >
                  <EnrollmentChecklistItemEditor
                    C={C}
                    item={item}
                    orgSlug={orgSlug}
                    stripePaymentsReady={stripePaymentsReady}
                    onChange={onUpdate}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function EnrollmentChecklistItemList({
  C,
  items,
  expandedItemId,
  orgSlug,
  stripePaymentsReady,
  onExpandItem,
  onReorderItems,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: EnrollmentChecklistItemListProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Layers className="h-4 w-4" style={{ color: C.accent }} />
        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Checklist items
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          {items.length}
        </span>
      </div>
      <p className="mb-4 text-[11px] leading-snug" style={{ color: C.textTertiary }}>
        Families complete this checklist on a single enrollment page. Each step is an item
        they open and finish from the list.
      </p>

      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-sm py-10"
          style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
        >
          <Layers className="mb-2 h-6 w-6 opacity-40" />
          <p className="mb-3 text-[11px]">No checklist items yet.</p>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.accent}`,
            }}
          >
            <Plus className="h-3 w-3" />
            Add your first item
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={onReorderItems}
          className="flex flex-col"
          as="div"
        >
          {items.map((item, itemIdx) => (
            <ChecklistItemRow
              key={item.id}
              C={C}
              item={item}
              itemIdx={itemIdx}
              totalItems={items.length}
              isExpanded={expandedItemId === item.id}
              orgSlug={orgSlug}
              stripePaymentsReady={stripePaymentsReady}
              onToggleExpand={() =>
                onExpandItem(expandedItemId === item.id ? null : item.id)
              }
              onUpdate={onUpdateItem}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </Reorder.Group>
      )}

      {items.length > 0 && (
        <button
          type="button"
          onClick={onAddItem}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm px-3 py-2.5 text-[11px] font-medium transition-all"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            color: C.textTertiary,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = C.surface;
            e.currentTarget.style.borderColor = C.accent;
            e.currentTarget.style.color = C.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = C.borderStrong;
            e.currentTarget.style.color = C.textTertiary;
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add checklist item
        </button>
      )}
    </div>
  );
}
