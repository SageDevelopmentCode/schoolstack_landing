"use client";

import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import {
  APPLICATION_FIELD_GRID_CLASS,
  ApplicationFieldLabel,
  applicationFieldGridClass,
  fieldUsesDivWrapper,
} from "@/components/admissions/application-field-layout";
import { ApplicationFieldAppearanceProvider } from "@/components/admissions/application-field-appearance";
import type { ApplicationField, ApplicationSection } from "@/lib/admissions/application-form-schema";
import type { ApplicationFileUploadContext } from "@/lib/admissions/application-file-storage";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const noop = () => {};

export type ApplicationGardenSectionProps = {
  /** Garden-compat tokens (`parentThemeToGardenCompat`), used by the inputs and portalled popups. */
  C: AdminThemeTokens;
  section: ApplicationSection;
  values?: Record<string, string>;
  onChange?: (fieldId: string, value: string) => void;
  fieldErrors?: Record<string, string>;
  /** "Reuse answer" link per field (apply form, second child). */
  priorFieldValues?: Record<string, string>;
  onReuseField?: (fieldId: string) => void;
  supabase?: SupabaseClient;
  uploadContext?: ApplicationFileUploadContext;
  hideTopNotice?: boolean;
  /** Read-only / preview: inputs render disabled. */
  disabled?: boolean;
  headingLevel?: "h2" | "h3";
  /** Shown when the section has no title (builder: "Untitled step"). */
  emptyTitle?: ReactNode;
  /** Builder hooks: wrap the heading, a notice or a field in edit affordances. */
  wrapHeader?: (node: ReactNode) => ReactNode;
  wrapNotice?: (node: ReactNode) => ReactNode;
  renderField?: (field: ApplicationField, node: ReactNode, cellClassName: string) => ReactNode;
  /** Builder: replaces the visible label (e.g. an empty-label warning). */
  labelFor?: (field: ApplicationField) => ReactNode | undefined;
  /** Extra content right under the heading (builder "+ Add instructions" buttons). */
  afterHeader?: ReactNode;
  /** Shown instead of the grid when the section has no fields. */
  empty?: ReactNode;
};

/**
 * One application step in the family Garden look: sf-display heading,
 * description, notice (top or bottom) and the half/full field grid. The
 * family apply form renders it live; the admin builders render the same
 * component (wrapped in edit overlays) so their Family view can't drift.
 * Must sit inside a Garden scope (`ParentGardenFrame` / `ParentGardenScope`).
 */
export default function ApplicationGardenSection({
  C,
  section,
  values = {},
  onChange = noop,
  fieldErrors = {},
  priorFieldValues,
  onReuseField,
  supabase,
  uploadContext,
  hideTopNotice = false,
  disabled = false,
  headingLevel = "h2",
  emptyTitle,
  wrapHeader = (node) => node,
  wrapNotice = (node) => node,
  renderField,
  labelFor,
  afterHeader,
  empty,
}: ApplicationGardenSectionProps) {
  const Heading = headingLevel;
  const notice = section.stepNotice?.body.trim() ? section.stepNotice : null;
  const description = section.description?.trim() ?? "";
  const noticeNode = notice
    ? wrapNotice(<ApplicationStepNotice body={notice.body.trim()} C={C} />)
    : null;

  return (
    <ApplicationFieldAppearanceProvider value="garden">
      <div>
        {wrapHeader(
          <div>
            {section.title.trim() || emptyTitle ? (
              <Heading className="sf-display m-0 text-[1.5rem] leading-[1.1] text-[var(--sf-ink)] sm:text-[1.75rem]">
                {section.title.trim() || emptyTitle}
              </Heading>
            ) : null}
            {description ? (
              <p className="m-0 mt-2 max-w-[62ch] whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                {description}
              </p>
            ) : null}
          </div>,
        )}
        {afterHeader}

        {notice?.placement === "top" && !hideTopNotice ? <div className="mt-5">{noticeNode}</div> : null}

        {section.fields.length === 0 && empty ? (
          <div className="mt-6">{empty}</div>
        ) : (
          <div className={`mt-6 ${APPLICATION_FIELD_GRID_CLASS}`}>
            {section.fields.map((field) => {
              const cellClassName = applicationFieldGridClass(field);
              const label = (
                <ApplicationFieldLabel
                  field={field}
                  C={C}
                  label={labelFor?.(field)}
                  trailing={
                    field.type !== "file" && priorFieldValues?.[field.id] && onReuseField ? (
                      <button
                        type="button"
                        onClick={() => onReuseField(field.id)}
                        className="rounded-md text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] underline-offset-2 hover:underline"
                      >
                        Reuse answer
                      </button>
                    ) : null
                  }
                />
              );
              const input = (
                <ApplicationFieldInput
                  field={field}
                  value={values[field.id] ?? ""}
                  onChange={(value) => onChange(field.id, value)}
                  error={fieldErrors[field.id]}
                  disabled={disabled}
                  C={C}
                  supabase={supabase}
                  uploadContext={uploadContext}
                />
              );

              if (renderField) {
                return (
                  <div key={field.id} className={cellClassName}>
                    {renderField(field, <>{label}{input}</>, cellClassName)}
                  </div>
                );
              }

              // Address and multiple choice hold several controls, so they can't be one <label>.
              return fieldUsesDivWrapper(field) ? (
                <div key={field.id} data-field-id={field.id} className={cellClassName}>
                  {label}
                  {input}
                </div>
              ) : (
                <label key={field.id} data-field-id={field.id} className={cellClassName}>
                  {label}
                  {input}
                </label>
              );
            })}
          </div>
        )}

        {notice && notice.placement !== "top" ? <div className="mt-6">{noticeNode}</div> : null}
      </div>
    </ApplicationFieldAppearanceProvider>
  );
}
