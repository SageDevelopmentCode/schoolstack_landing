"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { getItemVariantConfig } from "@/lib/admissions/enrollment-checklist-schema";
import { buildChecklistOutlineEntries } from "@/lib/admissions/enrollment-checklist-variants";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ChecklistBuilderFocus } from "./checklist-builder-focus";
import { outlineItemCardStyle } from "./outline-item-styles";

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
  indent = false,
  variantBadge,
  variantOptionPrefix,
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
  indent?: boolean;
  variantBadge?: string;
  variantOptionPrefix?: string;
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
        className={`mb-1.5 rounded-sm px-2 py-1.5 ${indent ? "ml-6 mr-3 w-[calc(100%-36px)]" : "mx-3 w-[calc(100%-24px)]"}`}
        style={outlineItemCardStyle(C, true)}
      >
        <div className="flex items-center gap-1">
          {!indent ? (
            <span
              className="shrink-0 tabular-nums text-[10px] font-medium"
              style={{ color: C.accent }}
            >
              {itemIdx + 1}.
            </span>
          ) : variantOptionPrefix ? (
            <span
              className="shrink-0 tabular-nums text-[10px] font-medium"
              style={{ color: C.textTertiary }}
            >
              {variantOptionPrefix}.
            </span>
          ) : null}
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
      className={`group mb-1.5 flex items-center gap-0.5 rounded-sm transition-colors ${indent ? "ml-6 mr-3 w-[calc(100%-36px)]" : "mx-3 w-[calc(100%-24px)]"}`}
      style={outlineItemCardStyle(C, active)}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = C.elevated;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = C.surface;
        }
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 flex items-center gap-2 px-2.5 py-2 text-left text-xs"
        style={{
          color: active ? C.accent : C.textPrimary,
        }}
      >
        {indent && variantOptionPrefix ? (
          <span
            className="shrink-0 tabular-nums text-[10px] font-medium"
            style={{ color: active ? C.accent : C.textTertiary }}
          >
            {variantOptionPrefix}.
          </span>
        ) : !indent ? (
          <span
            className="shrink-0 tabular-nums font-medium"
            style={{ color: active ? C.accent : C.textTertiary }}
          >
            {itemIdx + 1}.
          </span>
        ) : null}
        <span className="min-w-0 truncate font-medium">{item.label}</span>
        {variantBadge ? (
          <span
            className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium uppercase"
            style={{ backgroundColor: C.elevated, color: C.textTertiary }}
          >
            {variantBadge}
          </span>
        ) : null}
      </button>
      <div className="flex shrink-0 items-center gap-0.5 pr-2.5">
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  const entries = buildChecklistOutlineEntries(items);

  return (
    <div
      className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r"
      style={{ borderColor: C.border, backgroundColor: C.bg }}
    >
      <div className="flex-1 overflow-y-auto">
        <OutlineSectionLabel C={C}>Checklist items</OutlineSectionLabel>

        {entries.length === 0 ? (
          <p className="px-3 py-2 text-[11px]" style={{ color: C.textTertiary }}>
            No items yet
          </p>
        ) : (
          entries.map((entry) => {
            if (entry.kind === "item") {
              const { item, itemIdx } = entry;
              return (
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
              );
            }

            const { group, itemIdx } = entry;
            const expanded = expandedGroups[group.groupId] ?? true;
            const groupActive = group.variants.some((variant) => isItemActive(variant.id));

            return (
              <div key={group.groupId}>
                <div
                  className="group mx-3 mb-1.5 flex w-[calc(100%-24px)] items-center gap-0.5 rounded-sm transition-colors"
                  style={outlineItemCardStyle(C, groupActive)}
                  onMouseEnter={(e) => {
                    if (!groupActive) {
                      e.currentTarget.style.backgroundColor = C.elevated;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!groupActive) {
                      e.currentTarget.style.backgroundColor = C.surface;
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [group.groupId]: !expanded,
                      }))
                    }
                    className="shrink-0 px-2.5 py-2"
                    style={{ color: C.textTertiary }}
                    aria-label={expanded ? "Collapse variants" : "Expand variants"}
                  >
                    {expanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1 py-2 pr-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium" style={{ color: C.textPrimary }}>
                        <span
                          className="mr-1.5 tabular-nums font-medium"
                          style={{ color: C.textTertiary }}
                        >
                          {itemIdx + 1}.
                        </span>
                        {group.groupLabel}
                      </p>
                      {group.needsSetup ? (
                        <span
                          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium uppercase"
                          style={{ backgroundColor: C.warningBg, color: C.warning }}
                        >
                          needs setup
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[10px]" style={{ color: C.textTertiary }}>
                      {group.variants.length} agreement option
                      {group.variants.length === 1 ? "" : "s"} · staff picks one per student
                    </p>
                  </div>
                </div>

                {expanded
                  ? group.variants.map((item, variantIdx) => {
                      const variant = getItemVariantConfig(item);
                      const badge = variant?.isDefault ? "default" : undefined;
                      const optionPrefix = String.fromCharCode(97 + variantIdx);
                      return (
                        <ChecklistOutlineRow
                          key={item.id}
                          C={C}
                          item={item}
                          itemIdx={itemIdx}
                          indent
                          active={isItemActive(item.id)}
                          readOnly={readOnly}
                          isEditing={editingItemId === item.id}
                          draftLabel={editingDraftLabel}
                          variantBadge={badge}
                          variantOptionPrefix={optionPrefix}
                          onSelect={() =>
                            onFocusChange({ kind: "item", itemId: item.id })
                          }
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
                      );
                    })
                  : null}
              </div>
            );
          })
        )}

        {!readOnly ? (
          <button
            type="button"
            onClick={onOpenPicker}
            className="mx-3 mb-1.5 flex w-[calc(100%-24px)] items-center justify-center gap-1.5 rounded-sm py-2 text-[11px] font-medium"
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
