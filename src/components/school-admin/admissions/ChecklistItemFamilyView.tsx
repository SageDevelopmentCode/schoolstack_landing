"use client";

import { useMemo } from "react";
import { MousePointerClick, Plus } from "lucide-react";
import EnrollmentChecklistItemPanel from "@/components/admissions/EnrollmentChecklistItemPanel";
import { ApplicationFieldAppearanceProvider } from "@/components/admissions/application-field-appearance";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  type EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import {
  parentThemeToGardenCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import StepFamilyCanvas, { EditChip } from "./StepFamilyCanvas";

type ChecklistItemFamilyViewProps = {
  familyTheme: ParentThemeTokens;
  item: EnrollmentChecklistItem;
  itemIdx: number;
  totalItems: number;
  readOnly: boolean;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onUpdateItem: (item: EnrollmentChecklistItem) => void;
  onRequestDeleteField: (fieldId: string) => void;
  /** Opens the item's settings (the compact editor) in a side panel. */
  onOpenEditor: () => void;
};

/**
 * Enrollment checklist builder, "Family view": the item drawn as families see
 * it on the enrollment checklist. Form items reuse the apply builder's
 * clickable family canvas (per-question editing); every other type renders
 * the real family panel (preview mode, inert) under one "Edit" overlay.
 */
export default function ChecklistItemFamilyView({
  familyTheme,
  item,
  itemIdx,
  totalItems,
  readOnly,
  selectedFieldId,
  onSelectField,
  onUpdateItem,
  onRequestDeleteField,
  onOpenEditor,
}: ChecklistItemFamilyViewProps) {
  const C = useMemo(() => parentThemeToGardenCompat(familyTheme), [familyTheme]);
  const kicker = `Item ${itemIdx + 1} of ${totalItems} · ${item.required ? "Required" : "Optional"}`;
  const typeLabel = CHECKLIST_ITEM_TYPE_LABELS[item.type].toLowerCase();

  if (item.type === "form" && item.formSchema) {
    const formSchema = item.formSchema;
    const setFields = (fields: ApplicationField[]) =>
      onUpdateItem({ ...item, formSchema: { ...formSchema, fields } });

    return (
      <StepFamilyCanvas
        familyTheme={familyTheme}
        step={formSchema}
        chrome="checklist-form"
        kicker={kicker}
        readOnly={readOnly}
        lockSystemFields={false}
        isLockedStep={false}
        selectedFieldId={selectedFieldId}
        onSelectField={onSelectField}
        onOpenStepDetails={onOpenEditor}
        onUpdateField={(fieldId, patch) =>
          setFields(formSchema.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)))
        }
        onMoveField={(fieldId, direction) => {
          const index = formSchema.fields.findIndex((field) => field.id === fieldId);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= formSchema.fields.length) return;
          const next = [...formSchema.fields];
          [next[index], next[target]] = [next[target], next[index]];
          setFields(next);
        }}
        onRequestDeleteField={onRequestDeleteField}
        onAddField={(field) => {
          setFields([...formSchema.fields, field]);
          onSelectField(field.id);
        }}
        belowFields={
          formSchema.allowMultiple ? (
            <p
              aria-hidden
              className="m-0 mt-5 flex items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 py-2.5 text-[13px] font-extrabold text-[var(--sf-soft)]"
            >
              <Plus className="h-4 w-4" />
              Families can add another entry
            </p>
          ) : null
        }
      />
    );
  }

  return (
    <div className="w-full">
      {!readOnly ? (
        <p className="m-0 mb-3 flex items-center gap-1.5 px-1 text-[12.5px] font-bold text-[var(--sf-soft)]">
          <MousePointerClick className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
          Click the {typeLabel} to edit it.
        </p>
      ) : null}
      <ParentGardenScope theme={familyTheme}>
        <section
          aria-label="As families see it"
          data-family-preview
          className="rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-5 pb-6 pt-6 text-[var(--sf-ink)] shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-8 sm:pb-8 sm:pt-8"
        >
          <p className="m-0 mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
            {kicker}
          </p>
          <div
            className={
              readOnly
                ? ""
                : "group relative -mx-2.5 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/25 px-2.5 py-3 transition-colors hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] focus-within:border-solid focus-within:border-[var(--sf-clay)] focus-within:bg-[var(--sf-accent-wash)]"
            }
          >
            <div inert aria-hidden={!readOnly || undefined} className={readOnly ? "" : "pointer-events-none select-none"}>
              <ApplicationFieldAppearanceProvider value="garden">
                <EnrollmentChecklistItemPanel C={C} item={item} mode="preview" />
              </ApplicationFieldAppearanceProvider>
            </div>
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={onOpenEditor}
                  aria-label={`Edit ${typeLabel}: ${item.label || "Untitled item"}`}
                  className={`absolute inset-0 z-[1] cursor-pointer rounded-[18px] ${G_FOCUS}`}
                  data-testid="checklist-family-edit"
                />
                <span className="absolute right-3 top-2.5 z-[2]">
                  <EditChip active={false} label={`Edit ${typeLabel}`} />
                </span>
              </>
            ) : null}
          </div>
        </section>
      </ParentGardenScope>
    </div>
  );
}
