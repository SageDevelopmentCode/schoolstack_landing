"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ApplicationFormFieldEditor from "./ApplicationFormFieldEditor";
import {
  checklistFocusKey,
  type ChecklistBuilderFocus,
} from "./checklist-builder-focus";
import EnrollmentChecklistItemEditor from "./EnrollmentChecklistItemEditor";
import EnrollmentChecklistOutline from "./EnrollmentChecklistOutline";

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
  organizationId: string;
  templateId: string;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onPreviewItem: (itemId: string) => void;
  onOpenPicker: () => void;
};

function ItemView({
  C,
  item,
  organizationId,
  templateId,
  orgSlug,
  stripePaymentsReady,
  readOnly,
  onUpdateItem,
  onFocusChange,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  organizationId: string;
  templateId: string;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
}) {
  return (
    <EnrollmentChecklistItemEditor
      C={C}
      item={item}
      organizationId={organizationId}
      templateId={templateId}
      orgSlug={orgSlug}
      stripePaymentsReady={stripePaymentsReady}
      readOnly={readOnly}
      onChange={onUpdateItem}
      onSelectField={(fieldId) =>
        onFocusChange({ kind: "field", itemId: item.id, fieldId })
      }
    />
  );
}

function FieldView({
  C,
  item,
  itemIdx,
  field,
  readOnly,
  onBack,
  onUpdateField,
  onRequestDelete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  field: ApplicationField;
  readOnly?: boolean;
  onBack: () => void;
  onUpdateField: (patch: Partial<ApplicationField>) => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: C.accent }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {item.label || `Item ${itemIdx + 1}`}
        </button>
        <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
          Item {itemIdx + 1} · Question
        </p>
        <h2 className="text-lg font-bold" style={{ color: C.textPrimary }}>
          {field.label || "Untitled question"}
        </h2>
      </div>

      <ApplicationFormFieldEditor
        C={C}
        field={field}
        readOnly={readOnly}
        onChange={onUpdateField}
        onDelete={readOnly ? undefined : onRequestDelete}
      />
    </div>
  );
}

function EmptyCanvasView({ C }: { C: AdminThemeTokens }) {
  return (
    <p className="text-sm" style={{ color: C.textSecondary }}>
      Select a checklist item to edit.
    </p>
  );
}

export default function EnrollmentChecklistFocusCanvas({
  C,
  focus,
  items,
  organizationId,
  templateId,
  orgSlug,
  stripePaymentsReady = true,
  readOnly = false,
  onFocusChange,
  onUpdateItem,
  onDeleteItem,
  onPreviewItem,
  onOpenPicker,
}: EnrollmentChecklistFocusCanvasProps) {
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [pendingDeleteField, setPendingDeleteField] = useState<{
    itemId: string;
    fieldId: string;
    fieldLabel: string;
  } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingDraftLabel, setEditingDraftLabel] = useState("");

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
    setEditingItemId(null);
    onFocusChange({ kind: "item", itemId: items[nextIdx].id });
  };

  const canGoPrev = itemIdx > 0;
  const canGoNext = itemIdx >= 0 && itemIdx < items.length - 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!focus || focus.kind === "field" || editingItemId) return;
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
    if (editingItemId === pendingDeleteItemId) {
      setEditingItemId(null);
    }
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
      <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: C.surface }}>
        <EnrollmentChecklistOutline
          C={C}
          items={items}
          focus={focus}
          readOnly={readOnly}
          editingItemId={editingItemId}
          editingDraftLabel={editingDraftLabel}
          onEditingItemIdChange={setEditingItemId}
          onEditingDraftLabelChange={setEditingDraftLabel}
          onFocusChange={onFocusChange}
          onUpdateItem={onUpdateItem}
          onPreviewItem={onPreviewItem}
          onRequestDeleteItem={setPendingDeleteItemId}
          onOpenPicker={onOpenPicker}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
            <AnimatePresence mode="wait">
              <motion.div key={key} {...canvasTransition}>
                {focus?.kind === "item" && item && itemIdx >= 0 && (
                  <ItemView
                    key={item.id}
                    C={C}
                    item={item}
                    organizationId={organizationId}
                    templateId={templateId}
                    orgSlug={orgSlug}
                    stripePaymentsReady={stripePaymentsReady}
                    readOnly={readOnly}
                    onUpdateItem={onUpdateItem}
                    onFocusChange={onFocusChange}
                  />
                )}

                {focus?.kind === "field" && item && field && itemIdx >= 0 && (
                  <FieldView
                    C={C}
                    item={item}
                    itemIdx={itemIdx}
                    field={field}
                    readOnly={readOnly}
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

                {!focus && <EmptyCanvasView C={C} />}
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
