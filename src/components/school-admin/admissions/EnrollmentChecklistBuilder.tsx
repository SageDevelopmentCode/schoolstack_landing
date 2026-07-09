"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import {
  createBlankChecklistItem,
  type ChecklistItemType,
  type EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { ChecklistItemTemplateId } from "@/lib/admissions/enrollment-checklist-item-templates";
import { createItemFromTemplate } from "@/lib/admissions/enrollment-checklist-item-templates";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import {
  initialChecklistFocus,
  type ChecklistBuilderFocus,
} from "./checklist-builder-focus";
import EnrollmentChecklistFocusCanvas from "./EnrollmentChecklistFocusCanvas";
import EnrollmentChecklistItemsMenu from "./EnrollmentChecklistItemsMenu";
import EnrollmentChecklistPreview from "./EnrollmentChecklistPreview";
import EnrollmentChecklistTemplatePicker from "./EnrollmentChecklistTemplatePicker";

type EnrollmentChecklistBuilderProps = {
  branding: OrganizationBranding;
  schoolName: string;
  organizationId: string;
  template: EnrollmentChecklistTemplate;
  orgSlug: string;
  stripePaymentsReady?: boolean;
  items: EnrollmentChecklistItem[];
  onItemsChange: (items: EnrollmentChecklistItem[]) => void;
  readOnly?: boolean;
};

function resolveFocusAfterDelete(
  items: EnrollmentChecklistItem[],
  deletedId: string,
  currentFocus: ChecklistBuilderFocus | null,
): ChecklistBuilderFocus | null {
  if (!currentFocus) return null;

  const deletedIdx = items.findIndex((i) => i.id === deletedId);
  if (deletedIdx < 0) return currentFocus;

  const remaining = items.filter((i) => i.id !== deletedId);
  if (remaining.length === 0) return null;

  const isFocusedOnDeleted =
    (currentFocus.kind === "item" && currentFocus.itemId === deletedId) ||
    (currentFocus.kind === "field" && currentFocus.itemId === deletedId);

  if (!isFocusedOnDeleted) {
    if (currentFocus.kind === "field") {
      const itemStillExists = remaining.some((i) => i.id === currentFocus.itemId);
      if (!itemStillExists) {
        const nextIdx = Math.min(deletedIdx, remaining.length - 1);
        return { kind: "item", itemId: remaining[nextIdx].id };
      }
    }
    return currentFocus;
  }

  const nextIdx = Math.min(deletedIdx, remaining.length - 1);
  return { kind: "item", itemId: remaining[nextIdx].id };
}

export default function EnrollmentChecklistBuilder({
  branding,
  schoolName,
  organizationId,
  template,
  orgSlug,
  stripePaymentsReady = true,
  items,
  onItemsChange,
  readOnly = false,
}: EnrollmentChecklistBuilderProps) {
  const C = buildAdminThemeTokens(branding);
  const [focus, setFocus] = useState<ChecklistBuilderFocus | null>(() =>
    initialChecklistFocus(items),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInitialItemId, setPreviewInitialItemId] = useState<string | undefined>();

  const addFromTemplate = (templateId: ChecklistItemTemplateId) => {
    if (readOnly) return;
    const item = createItemFromTemplate(templateId);
    onItemsChange([...items, item]);
    setFocus({ kind: "item", itemId: item.id });
  };

  const addBlank = (type: ChecklistItemType) => {
    if (readOnly) return;
    const item = createBlankChecklistItem(type);
    onItemsChange([...items, item]);
    setFocus({ kind: "item", itemId: item.id });
  };

  const updateItem = (updated: EnrollmentChecklistItem) => {
    if (readOnly) return;
    onItemsChange(items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const requestDeleteItem = (itemId: string) => {
    if (readOnly) return;
    setDeleteTargetId(itemId);
  };

  const confirmDelete = () => {
    if (!deleteTargetId || readOnly) return;
    const next = items.filter((item) => item.id !== deleteTargetId);
    onItemsChange(next);
    setFocus((current) => resolveFocusAfterDelete(items, deleteTargetId, current));
    setDeleteTargetId(null);
  };

  const openPreview = (initialItemId?: string) => {
    setPreviewInitialItemId(initialItemId);
    setPreviewOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-5 py-2.5"
        style={{ borderColor: C.border }}
      >
        {items.length > 0 ? (
          <EnrollmentChecklistItemsMenu
            C={C}
            items={items}
            focus={focus}
            onFocusChange={setFocus}
          />
        ) : null}
        {!readOnly ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-medium"
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
        <span className="text-[11px]" style={{ color: C.textTertiary }}>
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <EnrollmentChecklistFocusCanvas
        C={C}
        focus={focus}
        items={items}
        organizationId={organizationId}
        templateId={template.id}
        orgSlug={orgSlug}
        stripePaymentsReady={stripePaymentsReady}
        readOnly={readOnly}
        onFocusChange={setFocus}
        onUpdateItem={updateItem}
        onDeleteItem={requestDeleteItem}
        onPreviewItem={(itemId) => openPreview(itemId)}
      />

      <EnrollmentChecklistPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        branding={branding}
        schoolName={schoolName}
        slug={orgSlug}
        enrollmentPath={template.enrollmentPath}
        title={template.name}
        items={items}
        initialItemId={previewInitialItemId}
      />

      <EnrollmentChecklistTemplatePicker
        C={C}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectTemplate={addFromTemplate}
        onSelectBlank={addBlank}
      />

      <ConfirmDialog
        C={C}
        open={deleteTargetId !== null}
        title="Remove checklist item?"
        description="This item will be removed from the checklist. You can add it back from templates."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
