"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronRight, ClipboardList, GripVertical, Plus, X } from "lucide-react";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ChecklistBuilderFocus } from "./checklist-builder-focus";

type EnrollmentChecklistOutlineProps = {
  C: AdminThemeTokens;
  items: EnrollmentChecklistItem[];
  focus: ChecklistBuilderFocus | null;
  checklistPath: string;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onReorderItems: (items: EnrollmentChecklistItem[]) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
};

function OutlineSectionLabel({
  children,
  C,
}: {
  children: React.ReactNode;
  C: AdminThemeTokens;
}) {
  return (
    <p
      className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: C.textQuaternary }}
    >
      {children}
    </p>
  );
}

function ItemOutlineRow({
  C,
  item,
  active,
  onSelect,
  onDelete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center"
        style={{
          backgroundColor: active ? C.accentLight : "transparent",
          borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
        }}
      >
        <button
          type="button"
          aria-label="Drag to reorder item"
          className="touch-none cursor-grab px-1 py-2 active:cursor-grabbing shrink-0"
          style={{ color: C.textQuaternary }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-1 text-left"
        >
          <span
            className="min-w-0 flex-1 truncate text-xs font-medium"
            style={{ color: active ? C.accent : C.textPrimary }}
          >
            {item.label}
          </span>
          <ChevronRight
            className="h-3 w-3 shrink-0 opacity-40"
            style={{ color: active ? C.accent : C.textQuaternary }}
          />
        </button>
        {hovered && (
          <button
            type="button"
            aria-label="Remove item"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: C.errorBg, color: C.error }}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </Reorder.Item>
  );
}

export default function EnrollmentChecklistOutline({
  C,
  items,
  focus,
  checklistPath,
  onFocusChange,
  onReorderItems,
  onAddItem,
  onDeleteItem,
}: EnrollmentChecklistOutlineProps) {
  const isItemActive = (itemId: string) =>
    focus?.kind === "item"
      ? focus.itemId === itemId
      : focus?.kind === "field" && focus.itemId === itemId;

  return (
    <div
      className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r"
      style={{ borderColor: C.border, backgroundColor: C.bg }}
    >
      <div className="flex-1 overflow-y-auto">
        <OutlineSectionLabel C={C}>Checklist items</OutlineSectionLabel>
        {items.length === 0 ? (
          <p className="px-3 py-2 text-[11px]" style={{ color: C.textTertiary }}>
            No items yet
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorderItems}
            as="div"
          >
            {items.map((item) => (
              <ItemOutlineRow
                key={item.id}
                C={C}
                item={item}
                active={isItemActive(item.id)}
                onSelect={() => onFocusChange({ kind: "item", itemId: item.id })}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))}
          </Reorder.Group>
        )}

        <button
          type="button"
          onClick={onAddItem}
          className="mx-3 mt-2 flex w-[calc(100%-24px)] items-center justify-center gap-1.5 rounded-sm py-2 text-[11px] font-medium"
          style={{
            border: `1px dashed ${C.borderStrong}`,
            color: C.accent,
            backgroundColor: "transparent",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      </div>

      <div
        className="shrink-0 border-t px-3 py-3 text-[10px] leading-relaxed"
        style={{ borderColor: C.border, color: C.textTertiary }}
      >
        <ClipboardList className="mb-1 h-3.5 w-3.5" style={{ color: C.accent }} />
        Families complete all items on one page at {checklistPath}
      </div>
    </div>
  );
}
