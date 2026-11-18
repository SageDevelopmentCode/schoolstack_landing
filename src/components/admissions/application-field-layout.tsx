"use client";

import type { ReactNode } from "react";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { useApplicationFieldAppearance } from "@/components/admissions/application-field-appearance";

/*
 * Layout shared by the public apply form (`SectionStep` in
 * ApplicationFormExperience) and the admin builder's family view, so the
 * builder always shows the grid families get.
 */

/** Address and multiple-choice fields render in a div (they hold several controls) and always span both columns. */
export function fieldUsesDivWrapper(field: ApplicationField): boolean {
  return field.type === "address" || field.type === "radio";
}

/** Whether `width` applies to this field type (address / radio are always full width). */
export function fieldHonoursWidth(field: Pick<ApplicationField, "type">): boolean {
  return field.type !== "address" && field.type !== "radio";
}

/** Grid cell class inside `APPLICATION_FIELD_GRID_CLASS`. */
export function applicationFieldGridClass(field: ApplicationField): string {
  if (fieldUsesDivWrapper(field)) return "block min-w-0 sm:col-span-2";
  return field.width === "half" ? "block min-w-0" : "block min-w-0 sm:col-span-2";
}

export const APPLICATION_FIELD_GRID_CLASS = "grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2";

/** The label families see above a field ("Label *"). Checkbox fields render their own label. */
export function ApplicationFieldLabel({
  field,
  C,
  label,
  trailing,
}: {
  field: ApplicationField;
  C: AdminThemeTokens;
  /** Override the visible text (e.g. a builder placeholder for an empty label). */
  label?: ReactNode;
  trailing?: ReactNode;
}) {
  const garden = useApplicationFieldAppearance() === "garden";
  if (field.type === "checkbox") return null;
  return (
    <span
      className={`mb-1.5 flex items-center justify-between gap-2 ${
        garden ? "text-[14px] font-extrabold" : "text-sm font-medium"
      }`}
      style={{ color: C.textPrimary }}
    >
      <span>
        {label ?? field.label}
        {field.required ? (
          <span style={{ color: garden ? C.accentDark : C.accent }}> *</span>
        ) : null}
      </span>
      {trailing}
    </span>
  );
}
