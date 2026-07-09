"use client";

import { useEffect, useRef } from "react";
import { Check, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ChecklistBuilderFocus } from "./checklist-builder-focus";

type EnrollmentChecklistOutlineProps = {
  C: AdminThemeTokens;
  items: EnrollmentChecklistItem[];
  focus: ChecklistBuilderFocus | null;
  readOnly?: boolean;
  editingItemId: string | null;
  editingDraftLabel: string;
  onEditingItemIdChange: (itemId: string | null) => void;
  onEditingDraftLabelChange: (label: string) => void;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onPreviewItem: (itemId: string) => void;
  onRequestDeleteItem: (itemId: string) => void;
  onOpenPicker: () => void;
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

function ChecklistOutlineRow({
  C,
  item,
  itemIdx,
  active,
  readOnly,
  isEditing,
  draftLabel,
  onSelect,
  onStartEdit,
  onDraftChange,
  onCommitEdit,
  onCancelEdit,
  onPreview,
  onRemove,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  active: boolean;
  readOnly?: boolean;
  isEditing: boolean;
  draftLabel: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onDraftChange: (label: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onPreview: () => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div
        className="px-2 py-1.5"
        style={{
          backgroundColor: C.accentLight,
          borderLeft: `2px solid ${C.accent}`,
        }}
      >
        <div className="flex items-center gap-1">
          <span
            className="shrink-0 tabular-nums text-[10px] font-medium"
            style={{ color: C.accent }}
          >
            {itemIdx + 1}.
          </span>
          <input
            ref={inputRef}
            type="text"
            value={draftLabel}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCommitEdit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onCancelEdit();
              }
            }}
            placeholder="Item title"
            className="min-w-0 flex-1 rounded-sm px-1.5 py-1 text-[11px] font-medium outline-none"
            style={{
              color: C.textPrimary,
              backgroundColor: C.input,
              border: `1px solid ${C.inputBorder}`,
            }}
          />
          <button
            type="button"
            onClick={onCommitEdit}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Save title"
            className="rounded p-0.5 shrink-0"
            style={{ color: C.accent }}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Discard changes"
            className="rounded p-0.5 shrink-0"
            style={{ color: C.textTertiary }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-0.5"
      style={{
        backgroundColor: active ? C.accentLight : "transparent",
        borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 flex items-center gap-2 px-3 py-2 text-left text-xs"
        style={{ color: active ? C.accent : C.textPrimary }}
      >
        <span
          className="shrink-0 tabular-nums font-medium"
          style={{ color: active ? C.accent : C.textTertiary }}
        >
          {itemIdx + 1}.
        </span>
        <span className="min-w-0 truncate font-medium">{item.label}</span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5 pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          aria-label="Preview item"
          className="rounded p-1 opacity-70 group-hover:opacity-100"
          style={{ color: C.textSecondary }}
        >
          <Eye className="h-3 w-3" />
        </button>
        {!readOnly ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              aria-label="Edit title"
              className="rounded p-1 opacity-70 group-hover:opacity-100"
              style={{ color: C.textSecondary }}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove item"
              className="rounded p-1 opacity-70 group-hover:opacity-100"
              style={{ color: C.error }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function EnrollmentChecklistOutline({
  C,
  items,
  focus,
  readOnly = false,
  editingItemId,
  editingDraftLabel,
  onEditingItemIdChange,
  onEditingDraftLabelChange,
  onFocusChange,
  onUpdateItem,
  onPreviewItem,
  onRequestDeleteItem,
  onOpenPicker,
}: EnrollmentChecklistOutlineProps) {
  const isItemActive = (itemId: string) =>
    focus?.kind === "item"
      ? focus.itemId === itemId
      : focus?.kind === "field" && focus.itemId === itemId;

  const commitEdit = (item: EnrollmentChecklistItem) => {
    const trimmed = editingDraftLabel.trim();
    if (trimmed && trimmed !== item.label) {
      onUpdateItem({ ...item, label: trimmed });
    }
    onEditingItemIdChange(null);
  };

  const cancelEdit = (item: EnrollmentChecklistItem) => {
    onEditingDraftLabelChange(item.label);
    onEditingItemIdChange(null);
  };

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
          items.map((item, itemIdx) => (
            <ChecklistOutlineRow
              key={item.id}
              C={C}
              item={item}
              itemIdx={itemIdx}
              active={isItemActive(item.id)}
              readOnly={readOnly}
              isEditing={editingItemId === item.id}
              draftLabel={editingDraftLabel}
              onSelect={() => onFocusChange({ kind: "item", itemId: item.id })}
              onStartEdit={() => {
                onFocusChange({ kind: "item", itemId: item.id });
                onEditingDraftLabelChange(item.label);
                onEditingItemIdChange(item.id);
              }}
              onDraftChange={onEditingDraftLabelChange}
              onCommitEdit={() => commitEdit(item)}
              onCancelEdit={() => cancelEdit(item)}
              onPreview={() => onPreviewItem(item.id)}
              onRemove={() => onRequestDeleteItem(item.id)}
            />
          ))
        )}

        {!readOnly ? (
          <button
            type="button"
            onClick={onOpenPicker}
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
        ) : null}
      </div>
    </div>
  );
}
