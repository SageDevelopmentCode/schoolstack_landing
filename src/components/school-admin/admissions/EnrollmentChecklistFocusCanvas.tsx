"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, Trash2 } from "lucide-react";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  getChecklistItemSummary,
  type EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ApplicationFormFieldEditor from "./ApplicationFormFieldEditor";
import {
  checklistFocusKey,
  type ChecklistBuilderFocus,
} from "./checklist-builder-focus";
import EnrollmentChecklistItemEditor from "./EnrollmentChecklistItemEditor";

const canvasTransition = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

type EnrollmentChecklistFocusCanvasProps = {
  C: AdminThemeTokens;
  focus: ChecklistBuilderFocus | null;
  items: EnrollmentChecklistItem[];
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
};

function EmptyView({ C }: { C: AdminThemeTokens }) {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-sm" style={{ color: C.textSecondary }}>
        No checklist items yet. Add one from the outline.
      </p>
    </div>
  );
}

function ItemView({
  C,
  item,
  itemIdx,
  totalItems,
  orgSlug,
  stripePaymentsReady,
  onUpdateItem,
  onRequestDelete,
  onFocusChange,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  totalItems: number;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onRequestDelete: () => void;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
}) {
  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
            Item {itemIdx + 1} of {totalItems}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
            {item.label}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: C.bg, color: C.textTertiary }}
            >
              {CHECKLIST_ITEM_TYPE_LABELS[item.type]}
            </span>
            {!item.required ? (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: C.surface,
                  color: C.textTertiary,
                  border: `1px solid ${C.border}`,
                }}
              >
                Optional
              </span>
            ) : null}
            <span className="text-[11px]" style={{ color: C.textTertiary }}>
              {getChecklistItemSummary(item)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRequestDelete}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium shrink-0"
          style={{ color: C.error, backgroundColor: C.errorBg }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <EnrollmentChecklistItemEditor
        C={C}
        item={item}
        orgSlug={orgSlug}
        stripePaymentsReady={stripePaymentsReady}
        onChange={onUpdateItem}
        onSelectField={(fieldId) =>
          onFocusChange({ kind: "field", itemId: item.id, fieldId })
        }
      />
    </div>
  );
}

function FieldView({
  C,
  item,
  itemIdx,
  field,
  onBack,
  onUpdateField,
  onRequestDelete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  field: ApplicationField;
  onBack: () => void;
  onUpdateField: (patch: Partial<ApplicationField>) => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="w-full max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium"
        style={{ color: C.accent }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {item.label || `Item ${itemIdx + 1}`}
      </button>

      <div>
        <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
          Item {itemIdx + 1} · Question
        </p>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          {field.label || "Untitled question"}
        </h2>
      </div>

      <ApplicationFormFieldEditor
        C={C}
        field={field}
        onChange={onUpdateField}
        onDelete={onRequestDelete}
      />
    </div>
  );
}

export default function EnrollmentChecklistFocusCanvas({
  C,
  focus,
  items,
  orgSlug,
  stripePaymentsReady = true,
  onFocusChange,
  onUpdateItem,
  onDeleteItem,
}: EnrollmentChecklistFocusCanvasProps) {
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [pendingDeleteField, setPendingDeleteField] = useState<{
    itemId: string;
    fieldId: string;
    fieldLabel: string;
  } | null>(null);

  const key = checklistFocusKey(focus);

  const item =
    focus?.kind === "item" || focus?.kind === "field"
      ? items.find((i) => i.id === focus.itemId)
      : undefined;

  const itemIdx = item ? items.findIndex((i) => i.id === item.id) : -1;

  const field =
    focus?.kind === "field" && item?.formSchema
      ? item.formSchema.fields.find((f) => f.id === focus.fieldId)
      : undefined;

  const navigateItem = (delta: number) => {
    if (itemIdx < 0) return;
    const nextIdx = itemIdx + delta;
    if (nextIdx < 0 || nextIdx >= items.length) return;
    onFocusChange({ kind: "item", itemId: items[nextIdx].id });
  };

  const canGoPrev = itemIdx > 0;
  const canGoNext = itemIdx >= 0 && itemIdx < items.length - 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!focus || focus.kind === "field") return;
      if (event.key === "ArrowLeft" && canGoPrev) {
        event.preventDefault();
        navigateItem(-1);
      }
      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        navigateItem(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const updateField = (
    itemId: string,
    fieldId: string,
    patch: Partial<ApplicationField>,
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target?.formSchema) return;
    onUpdateItem({
      ...target,
      formSchema: {
        ...target.formSchema,
        fields: target.formSchema.fields.map((f) =>
          f.id === fieldId ? { ...f, ...patch } : f,
        ),
      },
    });
  };

  const handleConfirmDeleteItem = () => {
    if (!pendingDeleteItemId) return;
    onDeleteItem(pendingDeleteItemId);
    setPendingDeleteItemId(null);
  };

  const handleConfirmDeleteField = () => {
    if (!pendingDeleteField) return;
    const target = items.find((i) => i.id === pendingDeleteField.itemId);
    if (target?.formSchema) {
      onUpdateItem({
        ...target,
        formSchema: {
          ...target.formSchema,
          fields: target.formSchema.fields.filter(
            (f) => f.id !== pendingDeleteField.fieldId,
          ),
        },
      });
    }
    onFocusChange({ kind: "item", itemId: pendingDeleteField.itemId });
    setPendingDeleteField(null);
  };

  const pendingDeleteItem = pendingDeleteItemId
    ? items.find((i) => i.id === pendingDeleteItemId)
    : null;

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: C.surface }}>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div key={key} {...canvasTransition}>
              {!focus && <EmptyView C={C} />}

              {focus?.kind === "item" && item && itemIdx >= 0 && (
                <ItemView
                  C={C}
                  item={item}
                  itemIdx={itemIdx}
                  totalItems={items.length}
                  orgSlug={orgSlug}
                  stripePaymentsReady={stripePaymentsReady}
                  onUpdateItem={onUpdateItem}
                  onRequestDelete={() => setPendingDeleteItemId(item.id)}
                  onFocusChange={onFocusChange}
                />
              )}

              {focus?.kind === "field" && item && field && itemIdx >= 0 && (
                <FieldView
                  C={C}
                  item={item}
                  itemIdx={itemIdx}
                  field={field}
                  onBack={() => onFocusChange({ kind: "item", itemId: item.id })}
                  onUpdateField={(patch) => updateField(item.id, field.id, patch)}
                  onRequestDelete={() =>
                    setPendingDeleteField({
                      itemId: item.id,
                      fieldId: field.id,
                      fieldLabel: field.label || "Untitled question",
                    })
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {focus && (focus.kind === "item" || focus.kind === "field") && items.length > 1 ? (
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3"
            style={{ borderColor: C.border, backgroundColor: C.bg }}
          >
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => navigateItem(-1)}
              className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:opacity-40"
              style={{
                border: `1px solid ${C.border}`,
                color: C.textSecondary,
                backgroundColor: C.surface,
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-[11px]" style={{ color: C.textTertiary }}>
              {itemIdx + 1} of {items.length}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => navigateItem(1)}
              className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:opacity-40"
              style={{
                border: `1px solid ${C.border}`,
                color: C.textSecondary,
                backgroundColor: C.surface,
              }}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        C={C}
        open={pendingDeleteItemId !== null}
        title="Remove checklist item?"
        description={
          pendingDeleteItem
            ? `Remove "${pendingDeleteItem.label}" from the checklist?`
            : "Remove this item from the checklist?"
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleConfirmDeleteItem}
        onClose={() => setPendingDeleteItemId(null)}
      />

      <ConfirmDialog
        C={C}
        open={pendingDeleteField !== null}
        title="Delete question?"
        description={
          pendingDeleteField
            ? `Remove "${pendingDeleteField.fieldLabel}" from this form item?`
            : "Remove this question?"
        }
        confirmLabel="Delete question"
        variant="destructive"
        onConfirm={handleConfirmDeleteField}
        onClose={() => setPendingDeleteField(null)}
      />
    </>
  );
}
