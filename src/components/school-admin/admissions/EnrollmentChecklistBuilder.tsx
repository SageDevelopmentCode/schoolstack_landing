"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import { enrollmentChecklistRelativePath } from "@/lib/admissions/enrollment-checklist-templates";
import { createDefaultChecklistItems } from "@/lib/admissions/enrollment-checklist-item-templates";
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
import EnrollmentChecklistTemplatePicker from "./EnrollmentChecklistTemplatePicker";

type EnrollmentChecklistBuilderProps = {
  branding: OrganizationBranding;
  template: EnrollmentChecklistTemplate;
  orgSlug: string;
  stripePaymentsReady?: boolean;
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
  template,
  orgSlug,
  stripePaymentsReady = true,
}: EnrollmentChecklistBuilderProps) {
  const C = buildAdminThemeTokens(branding);
  const defaultItems = createDefaultChecklistItems();
  const [items, setItems] = useState<EnrollmentChecklistItem[]>(() => defaultItems);
  const [focus, setFocus] = useState<ChecklistBuilderFocus | null>(() =>
    initialChecklistFocus(defaultItems),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const checklistPath = enrollmentChecklistRelativePath(template.enrollmentPath);

  const statusStyle =
    template.status === "published"
      ? { backgroundColor: C.successBg, color: C.success, label: "Published" }
      : template.status === "archived"
        ? { backgroundColor: C.elevated, color: C.textTertiary, label: "Archived" }
        : { backgroundColor: C.warningBg, color: C.warning, label: "Draft" };

  const addFromTemplate = (templateId: ChecklistItemTemplateId) => {
    const item = createItemFromTemplate(templateId);
    setItems((prev) => [...prev, item]);
    setFocus({ kind: "item", itemId: item.id });
  };

  const addBlank = (type: ChecklistItemType) => {
    const item = createBlankChecklistItem(type);
    setItems((prev) => [...prev, item]);
    setFocus({ kind: "item", itemId: item.id });
  };

  const updateItem = (updated: EnrollmentChecklistItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const requestDeleteItem = (itemId: string) => {
    setDeleteTargetId(itemId);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== deleteTargetId);
      setFocus((current) => resolveFocusAfterDelete(prev, deleteTargetId, current));
      return next;
    });
    setDeleteTargetId(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: C.surface }}>
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: C.border }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold" style={{ color: C.textPrimary }}>
            {template.name}
          </p>
          <div
            className="mt-1 flex flex-wrap items-center gap-2 text-[11px]"
            style={{ color: C.textTertiary }}
          >
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: statusStyle.backgroundColor,
                color: statusStyle.color,
              }}
            >
              {statusStyle.label}
            </span>
            <span>Checklist</span>
            <span>{checklistPath}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <EnrollmentChecklistItemsMenu
            C={C}
            items={items}
            focus={focus}
            onFocusChange={setFocus}
          />
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
        </div>
        <p className="text-[10px]" style={{ color: C.textTertiary }}>
          Changes are local for now — saving comes later.
        </p>
      </div>

      <EnrollmentChecklistFocusCanvas
        C={C}
        focus={focus}
        items={items}
        orgSlug={orgSlug}
        stripePaymentsReady={stripePaymentsReady}
        onFocusChange={setFocus}
        onUpdateItem={updateItem}
        onDeleteItem={requestDeleteItem}
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
