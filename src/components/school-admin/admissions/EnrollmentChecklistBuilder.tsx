"use client";

import { useState } from "react";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import {
  createBlankChecklistItem,
  createChecklistItemKeyForItem,
  deriveVariantKey,
  newChecklistItemId,
  readItemVariantDraft,
  setItemVariantConfig,
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
  onPreviewItem: (itemId?: string) => void;
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
  onPreviewItem,
  readOnly = false,
}: EnrollmentChecklistBuilderProps) {
  const C = buildAdminThemeTokens(branding);
  const [focus, setFocus] = useState<ChecklistBuilderFocus | null>(() =>
    initialChecklistFocus(items),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
    const draft = readItemVariantDraft(updated);
    let nextUpdated = updated;

    if (draft) {
      const prev = items.find((item) => item.id === updated.id);
      if (prev && prev.label !== updated.label) {
        nextUpdated = setItemVariantConfig(updated, {
          ...draft,
          variantKey: deriveVariantKey(updated),
        });
      }
    }

    let nextItems = items.map((item) => {
      if (item.id !== nextUpdated.id) return item;
      return nextUpdated;
    });

    if (draft) {
      const syncedDraft = readItemVariantDraft(nextUpdated);
      if (syncedDraft) {
        nextItems = nextItems.map((item) => {
          if (item.id === nextUpdated.id) return item;
          const itemDraft = readItemVariantDraft(item);
          if (itemDraft?.groupId !== syncedDraft.groupId) return item;
          return setItemVariantConfig(item, {
            ...itemDraft,
            groupLabel: syncedDraft.groupLabel,
          });
        });
      }
    }

    onItemsChange(nextItems);
  };

  const addVariantSibling = (sourceItemId: string) => {
    if (readOnly) return;
    const source = items.find((item) => item.id === sourceItemId);
    if (!source) return;
    const sourceDraft = readItemVariantDraft(source);
    if (!sourceDraft) return;

    const sourceIdx = items.findIndex((item) => item.id === sourceItemId);
    const lastSiblingIdx = items.reduce((maxIdx, item, idx) => {
      const draft = readItemVariantDraft(item);
      return draft?.groupId === sourceDraft.groupId ? idx : maxIdx;
    }, sourceIdx);

    const siblingCount = items.filter((item) => {
      const draft = readItemVariantDraft(item);
      return draft?.groupId === sourceDraft.groupId;
    }).length;

    const id = newChecklistItemId();
    const label = `Option ${siblingCount + 1}`;
    const blank = createBlankChecklistItem(source.type, label);
    const sibling: EnrollmentChecklistItem = {
      ...blank,
      id,
      itemKey: createChecklistItemKeyForItem(label, id),
      label,
      required: source.required,
      metadata: {},
    };
    const withVariant = setItemVariantConfig(sibling, {
      groupId: sourceDraft.groupId,
      groupLabel: sourceDraft.groupLabel,
      variantKey: deriveVariantKey(sibling),
      isDefault: false,
    });

    const next = [...items];
    next.splice(lastSiblingIdx + 1, 0, withVariant);
    onItemsChange(next);
    setFocus({ kind: "item", itemId: withVariant.id });
  };

  const setDefaultVariantOption = (itemId: string) => {
    if (readOnly) return;
    const target = items.find((item) => item.id === itemId);
    const draft = target ? readItemVariantDraft(target) : null;
    if (!draft) return;

    const nextItems = items.map((item) => {
      const itemDraft = readItemVariantDraft(item);
      if (itemDraft?.groupId !== draft.groupId) return item;
      return setItemVariantConfig(item, {
        ...itemDraft,
        isDefault: item.id === itemId,
      });
    });
    onItemsChange(nextItems);
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
        onPreviewItem={(itemId) => onPreviewItem(itemId)}
        onOpenPicker={() => setPickerOpen(true)}
        onAddVariant={addVariantSibling}
        onSetDefaultVariant={setDefaultVariantOption}
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
