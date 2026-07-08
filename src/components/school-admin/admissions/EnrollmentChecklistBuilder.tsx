"use client";

import { useState } from "react";
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
import EnrollmentChecklistItemList from "./EnrollmentChecklistItemList";
import EnrollmentChecklistTemplatePicker from "./EnrollmentChecklistTemplatePicker";

type EnrollmentChecklistBuilderProps = {
  branding: OrganizationBranding;
  template: EnrollmentChecklistTemplate;
  orgSlug: string;
  stripePaymentsReady?: boolean;
};

export default function EnrollmentChecklistBuilder({
  branding,
  template,
  orgSlug,
  stripePaymentsReady = true,
}: EnrollmentChecklistBuilderProps) {
  const C = buildAdminThemeTokens(branding);
  const [items, setItems] = useState<EnrollmentChecklistItem[]>(() =>
    createDefaultChecklistItems(),
  );
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const statusStyle =
    template.status === "published"
      ? { backgroundColor: C.successBg, color: C.success, label: "Published" }
      : template.status === "archived"
        ? { backgroundColor: C.elevated, color: C.textTertiary, label: "Archived" }
        : { backgroundColor: C.warningBg, color: C.warning, label: "Draft" };

  const addFromTemplate = (templateId: ChecklistItemTemplateId) => {
    const item = createItemFromTemplate(templateId);
    setItems((prev) => [...prev, item]);
    setExpandedItemId(item.id);
  };

  const addBlank = (type: ChecklistItemType) => {
    const item = createBlankChecklistItem(type);
    setItems((prev) => [...prev, item]);
    setExpandedItemId(item.id);
  };

  const updateItem = (updated: EnrollmentChecklistItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteTargetId));
    setExpandedItemId((prev) => (prev === deleteTargetId ? null : prev));
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
            <span>{enrollmentChecklistRelativePath(template.enrollmentPath)}</span>
          </div>
        </div>
        <p className="text-[10px]" style={{ color: C.textTertiary }}>
          Changes are local for now — saving comes later.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <EnrollmentChecklistItemList
          C={C}
          items={items}
          expandedItemId={expandedItemId}
          orgSlug={orgSlug}
          stripePaymentsReady={stripePaymentsReady}
          onExpandItem={setExpandedItemId}
          onReorderItems={setItems}
          onUpdateItem={updateItem}
          onDeleteItem={setDeleteTargetId}
          onAddItem={() => setPickerOpen(true)}
        />
      </div>

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
