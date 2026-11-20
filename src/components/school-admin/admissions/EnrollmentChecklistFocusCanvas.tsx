"use client";

import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenEmptyState } from "@/components/school-admin/garden/kit";
import { gBtnPopSm } from "@/components/school-parent/garden/ui";
import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  type ChecklistItemType,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ChecklistPreviewMenuButton from "./ChecklistPreviewMenuButton";
import ApplicationFormFieldEditor from "./ApplicationFormFieldEditor";
import BuilderFieldEditorPanel from "./BuilderFieldEditorPanel";
import { BuilderSectionIntro } from "./builder-question-card";
import {
  checklistFocusKey,
  type ChecklistBuilderFocus,
} from "./checklist-builder-focus";
import EnrollmentChecklistItemEditor from "./EnrollmentChecklistItemEditor";
import EnrollmentChecklistOutline from "./EnrollmentChecklistOutline";
import { BUILDER_CANVAS_BG } from "./outline-item-styles";
import { builderCanvasTransition } from "./builder-canvas-motion";
import { BuilderViewToggle, useBuilderViewMode } from "./builder-view-mode";
import ChecklistItemFamilyView from "./ChecklistItemFamilyView";

function itemTypeSubtitle(type: ChecklistItemType): string {
  switch (type) {
    case "document_sign":
    case "document_sign_pdf":
      return "Families read and sign this before completing enrollment.";
    case "form":
      return "Families fill out these questions as part of enrollment.";
    case "file_upload":
      return "Families upload documents you request here.";
    case "payment":
      return "Families pay this amount during enrollment.";
    case "acknowledgment":
      return "Families read and confirm this before moving on.";
    default:
      return "Configure what families see and do for this step.";
  }
}

const canvasTransition = builderCanvasTransition;

type EnrollmentChecklistFocusCanvasProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  /** The family's theme (`buildParentThemeTokens(branding)`) for the Family view. */
  familyTheme?: ParentThemeTokens;
  focus: ChecklistBuilderFocus | null;
  items: EnrollmentChecklistItem[];
  organizationId: string;
  templateId: string;
  orgSlug: string;
  isDirty?: boolean;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onPreviewItem: (itemId: string) => void;
  onOpenPicker: () => void;
  onAddVariant?: (itemId: string) => void;
  onSetDefaultVariant?: (itemId: string) => void;
};

function ItemView({
  C,
  theme,
  familyTheme,
  onRequestDeleteField,
  item,
  itemIdx,
  organizationId,
  templateId,
  orgSlug,
  isDirty = false,
  stripePaymentsReady,
  readOnly,
  selectedFieldId,
  onUpdateItem,
  onFocusChange,
  onAddVariant,
  onSetDefaultVariant,
  onPreviewItem,
  allItems,
}: {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  familyTheme?: ParentThemeTokens;
  onRequestDeleteField: (fieldId: string) => void;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  organizationId: string;
  templateId: string;
  orgSlug: string;
  isDirty?: boolean;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  selectedFieldId?: string | null;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
  onAddVariant?: (itemId: string) => void;
  onSetDefaultVariant?: (itemId: string) => void;
  onPreviewItem: (itemId: string) => void;
  allItems: EnrollmentChecklistItem[];
}) {
  const [viewMode, setViewMode] = useBuilderViewMode();
  const [editorOpen, setEditorOpen] = useState(false);
  const showFamily = Boolean(theme && familyTheme) && viewMode === "family";
  const typeLabel = CHECKLIST_ITEM_TYPE_LABELS[item.type];

  const editor = (
    <EnrollmentChecklistItemEditor
      C={C}
      item={item}
      organizationId={organizationId}
      templateId={templateId}
      orgSlug={orgSlug}
      stripePaymentsReady={stripePaymentsReady}
      readOnly={readOnly}
      selectedFieldId={selectedFieldId}
      onChange={onUpdateItem}
      onSelectField={(fieldId) => {
        setEditorOpen(false);
        onFocusChange({ kind: "field", itemId: item.id, fieldId });
      }}
      onAddVariant={onAddVariant ? () => onAddVariant(item.id) : undefined}
      onSetDefaultVariant={
        onSetDefaultVariant ? () => onSetDefaultVariant(item.id) : undefined
      }
      allItems={allItems}
    />
  );

  return (
    <div className="w-full space-y-5">
      <div className="flex items-start justify-between gap-4">
        <BuilderSectionIntro
          C={C}
          theme={theme}
          eyebrow={`Item ${itemIdx + 1} of ${allItems.length}`}
          title={item.label || "Untitled item"}
          subtitle={
            showFamily
              ? "This is what families see on their enrollment checklist. Click it to change it."
              : itemTypeSubtitle(item.type)
          }
        />
        <ChecklistPreviewMenuButton
          C={C}
          orgSlug={orgSlug}
          checklistId={templateId}
          itemId={item.id}
          isDirty={isDirty}
          onPreviewHere={(previewItemId) => onPreviewItem(previewItemId ?? item.id)}
        />
      </div>

      {theme && familyTheme ? (
        <BuilderViewToggle mode={viewMode} onChange={setViewMode} label="How to show this item" />
      ) : null}

      {showFamily && familyTheme ? (
        <>
          <ChecklistItemFamilyView
            familyTheme={familyTheme}
            item={item}
            itemIdx={itemIdx}
            totalItems={allItems.length}
            readOnly={Boolean(readOnly)}
            selectedFieldId={selectedFieldId ?? null}
            onSelectField={(fieldId) => {
              setEditorOpen(false);
              onFocusChange({ kind: "field", itemId: item.id, fieldId });
            }}
            onUpdateItem={onUpdateItem}
            onRequestDeleteField={onRequestDeleteField}
            onOpenEditor={() => {
              onFocusChange({ kind: "item", itemId: item.id });
              setEditorOpen(true);
            }}
          />
          <BuilderFieldEditorPanel
            C={C}
            open={editorOpen}
            eyebrow={`Item ${itemIdx + 1} · ${typeLabel}`}
            title={`Edit ${typeLabel.toLowerCase()}`}
            subtitle="Changes show on the family view as you make them."
            onClose={() => setEditorOpen(false)}
          >
            {editorOpen ? editor : null}
          </BuilderFieldEditorPanel>
        </>
      ) : (
        editor
      )}
    </div>
  );
}

function EmptyCanvasView({
  C,
  hasItems,
  readOnly,
  onOpenPicker,
}: {
  C: AdminThemeTokens;
  hasItems?: boolean;
  readOnly?: boolean;
  onOpenPicker?: () => void;
}) {
  const skin = useAdminGardenSkin();
  if (skin) {
    return hasItems ? (
      <GardenEmptyState
        icon={ListChecks}
        title="Pick an item to edit"
        description="Choose a checklist item on the left to change what families complete."
      />
    ) : (
      <GardenEmptyState
        icon={ListChecks}
        tint="bg-[var(--sf-mint)]"
        title="Add your first checklist item"
        description="Checklist items are what accepted families complete to enroll: agreements to sign, forms, uploads and payments."
        action={
          !readOnly && onOpenPicker ? (
            <button type="button" onClick={onOpenPicker} className={gBtnPopSm}>
              <Plus className="h-4 w-4" aria-hidden />
              Add item
            </button>
          ) : null
        }
      />
    );
  }
  return (
    <p className="text-sm" style={{ color: C.textSecondary }}>
      Select a checklist item to edit.
    </p>
  );
}

export default function EnrollmentChecklistFocusCanvas({
  C,
  theme,
  familyTheme,
  focus,
  items,
  organizationId,
  templateId,
  orgSlug,
  isDirty = false,
  stripePaymentsReady = true,
  readOnly = false,
  onFocusChange,
  onUpdateItem,
  onDeleteItem,
  onPreviewItem,
  onOpenPicker,
  onAddVariant,
  onSetDefaultVariant,
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

  const canvasContent = (
    <AnimatePresence mode="wait">
      <motion.div key={key} className="mx-auto w-full max-w-[880px]" {...canvasTransition}>
        {(focus?.kind === "item" || focus?.kind === "field") &&
          item &&
          itemIdx >= 0 && (
            <ItemView
              key={item.id}
              C={C}
              theme={theme}
              familyTheme={familyTheme}
              onRequestDeleteField={(fieldId) => {
                const target = item.formSchema?.fields.find((entry) => entry.id === fieldId);
                setPendingDeleteField({
                  itemId: item.id,
                  fieldId,
                  fieldLabel: target?.label || "Untitled question",
                });
              }}
              item={item}
              itemIdx={itemIdx}
              organizationId={organizationId}
              templateId={templateId}
              orgSlug={orgSlug}
              isDirty={isDirty}
              stripePaymentsReady={stripePaymentsReady}
              readOnly={readOnly}
              selectedFieldId={
                focus?.kind === "field" ? focus.fieldId : null
              }
              onUpdateItem={onUpdateItem}
              onFocusChange={onFocusChange}
              onAddVariant={onAddVariant}
              onSetDefaultVariant={onSetDefaultVariant}
              onPreviewItem={onPreviewItem}
              allItems={items}
            />
          )}

        {!focus && <EmptyCanvasView C={C} hasItems={items.length > 0} readOnly={readOnly} onOpenPicker={onOpenPicker} />}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div
        className="flex min-h-0 flex-1 overflow-hidden bg-white"
      >
        <EnrollmentChecklistOutline
          C={C}
          theme={theme}
          items={items}
          focus={focus}
          readOnly={readOnly}
          orgSlug={orgSlug}
          checklistId={templateId}
          isDirty={isDirty}
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

        <div
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: BUILDER_CANVAS_BG }}
          data-flows-canvas
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            {canvasContent}
          </div>

          {focus?.kind === "field" && item && field && itemIdx >= 0 && (
            <BuilderFieldEditorPanel
              C={C}
              open
              eyebrow={`Item ${itemIdx + 1} · Question`}
              onClose={() => onFocusChange({ kind: "item", itemId: item.id })}
            >
              <ApplicationFormFieldEditor
                C={C}
                field={field}
                readOnly={readOnly}
                onChange={(patch) => updateField(item.id, field.id, patch)}
                onDelete={
                  readOnly
                    ? undefined
                    : () =>
                        setPendingDeleteField({
                          itemId: item.id,
                          fieldId: field.id,
                          fieldLabel: field.label || "Untitled question",
                        })
                }
              />
            </BuilderFieldEditorPanel>
          )}
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
