"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Asterisk, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";
import ApplicationGardenSection from "@/components/admissions/garden/ApplicationGardenSection";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ApplicationField, ApplicationSection } from "@/lib/admissions/application-form-schema";
import {
  parentThemeToGardenCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import {
  ApplicationFormFieldPresetPicker,
  createBlankField,
} from "./ApplicationFormFieldEditor";
import { isLockedSystemField } from "./ApplicationFormQuestionList";

export type StepDetailsSection = "title" | "description" | "notice";

type StepFamilyCanvasProps = {
  /** The family theme (`buildParentThemeTokens(branding)`): same tokens as the Garden apply form. */
  familyTheme: ParentThemeTokens;
  step: ApplicationSection;
  /**
   * "apply-step": the apply form card (step label, progress, Back / Save and continue).
   * "checklist-form": a checklist form item (kicker only, no step chrome).
   */
  chrome?: "apply-step" | "checklist-form";
  stepIdx?: number;
  totalSteps?: number;
  /** Kicker for checklist items ("Item 2 of 6 · Required"). */
  kicker?: string;
  readOnly: boolean;
  lockSystemFields: boolean;
  isLockedStep: boolean;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onOpenStepDetails: (section: StepDetailsSection) => void;
  onUpdateField: (fieldId: string, patch: Partial<ApplicationField>) => void;
  onMoveField: (fieldId: string, direction: -1 | 1) => void;
  onRequestDeleteField: (fieldId: string) => void;
  onAddField: (field: ApplicationField) => void;
  /** Rendered under the grid, inside the card (checklist "+ Add another entry" preview). */
  belowFields?: ReactNode;
};

/** The always-visible "✎ Edit" chip: muted at rest, accent on hover / focus / selected. */
export function EditChip({ active, label = "Edit" }: { active: boolean; label?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none inline-flex items-center gap-1 rounded-full border-[1.5px] px-2 py-0.5 text-[11.5px] font-extrabold transition-colors ${
        active
          ? "border-[var(--sf-clay)] bg-[var(--sf-clay)] text-white"
          : "border-[var(--sf-ink)]/12 bg-white text-[var(--sf-soft)] group-hover:border-[var(--sf-clay)] group-hover:bg-[var(--sf-clay)] group-hover:text-white group-focus-within:border-[var(--sf-clay)] group-focus-within:bg-[var(--sf-clay)] group-focus-within:text-white"
      }`}
    >
      <Pencil className="h-3 w-3" />
      {label}
    </span>
  );
}

/** Dashed at rest so it reads as editable; accent ring + wash on hover / focus. */
const REGION_SHAPE =
  "group relative -mx-2.5 cursor-pointer rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/25 px-2.5 py-2 transition-colors hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] focus-within:border-solid focus-within:border-[var(--sf-clay)] focus-within:bg-[var(--sf-accent-wash)]";

/** A piece of the family page (heading, note) with a full-size button that opens its editor. */
function EditableRegion({
  label,
  onEdit,
  disabled,
  children,
}: {
  label: string;
  onEdit: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) return <>{children}</>;
  return (
    <div className={REGION_SHAPE}>
      <div inert aria-hidden className="pointer-events-none">
        {children}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={label}
        className={`absolute inset-0 z-[1] cursor-pointer rounded-[14px] ${G_FOCUS}`}
      />
      <span className="absolute right-2.5 top-2 z-[2]">
        <EditChip active={false} />
      </span>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  pressed,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tone?: "default" | "danger" | "accent";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-full px-1.5 text-[11.5px] font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        tone === "danger"
          ? "text-[#9a3422] hover:bg-[#fdf0ec]"
          : tone === "accent"
            ? "bg-[var(--sf-clay)] px-2.5 text-white hover:brightness-105"
            : pressed
              ? "bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
              : "text-[var(--sf-ink)]/70 hover:bg-[var(--sf-ink)]/[0.06] hover:text-[var(--sf-ink)]"
      } ${G_FOCUS}`}
    >
      {children}
    </button>
  );
}

function FamilyFieldBlock({
  field,
  index,
  fields,
  selected,
  readOnly,
  lockSystemFields,
  onSelect,
  onUpdate,
  onMove,
  onRequestDelete,
  children,
}: {
  field: ApplicationField;
  index: number;
  fields: ApplicationField[];
  selected: boolean;
  readOnly: boolean;
  lockSystemFields: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<ApplicationField>) => void;
  onMove: (direction: -1 | 1) => void;
  onRequestDelete: () => void;
  children: ReactNode;
}) {
  const locked = isLockedSystemField(field, lockSystemFields);
  const untitled = !field.label.trim();
  const previous = fields[index - 1];
  const next = fields[index + 1];
  const canMoveUp = !locked && Boolean(previous) && !isLockedSystemField(previous, lockSystemFields);
  const canMoveDown = !locked && Boolean(next);
  const name = field.label.trim() || "Untitled question";

  return (
    <div
      className={`group relative -m-2 h-[calc(100%+16px)] rounded-[16px] border-[1.5px] p-2 transition-colors ${
        selected
          ? "border-solid border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--sf-clay)_18%,transparent)]"
          : "border-dashed border-[var(--sf-ink)]/25 hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] focus-within:border-solid focus-within:border-[var(--sf-clay)] focus-within:bg-[var(--sf-accent-wash)]"
      }`}
      data-field-id={field.id}
      data-family-field={selected ? "selected" : "idle"}
    >
      {/* What families see: the real label + input, inert. */}
      <div inert aria-hidden className="pointer-events-none select-none">
        {children}
      </div>
      {untitled ? (
        <p className="m-0 mt-1.5 text-[12px] font-bold text-[#9a6a00]">Add a label so families know what to answer.</p>
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        aria-label={`Edit question: ${name}${field.required ? " (required)" : ""}`}
        aria-current={selected ? "true" : undefined}
        className={`absolute inset-0 z-[1] cursor-pointer rounded-[16px] ${G_FOCUS}`}
      />

      {/* At rest: a visible Edit chip. Hover / focus / selected: the full toolbar. */}
      <span
        className={`absolute right-2.5 top-2 z-[2] ${selected ? "hidden" : readOnly ? "" : "group-hover:hidden group-focus-within:hidden"}`}
      >
        <EditChip active={false} label={locked ? "View" : "Edit"} />
      </span>

      {!readOnly ? (
        <div
          className={`absolute -top-3.5 right-2 z-[2] items-center gap-0.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-0.5 shadow-[0_2px_0_0_rgba(43,36,29,0.08)] ${
            selected ? "flex" : "hidden group-hover:flex group-focus-within:flex"
          }`}
        >
          <ToolbarButton label={`Edit "${name}"`} onClick={onSelect} tone="accent">
            <Pencil className="h-3 w-3" aria-hidden />
            <span>Edit</span>
          </ToolbarButton>
          {locked ? (
            <span className="px-2 text-[11.5px] font-extrabold text-[var(--sf-soft)]">System question</span>
          ) : (
            <>
              <ToolbarButton label={`Move "${name}" up`} onClick={() => onMove(-1)} disabled={!canMoveUp}>
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </ToolbarButton>
              <ToolbarButton label={`Move "${name}" down`} onClick={() => onMove(1)} disabled={!canMoveDown}>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </ToolbarButton>
              <span aria-hidden className="mx-0.5 h-4 w-px bg-[var(--sf-ink)]/12" />
              <ToolbarButton
                label={field.required ? `Make "${name}" optional` : `Make "${name}" required`}
                onClick={() => onUpdate({ required: !field.required })}
                pressed={Boolean(field.required)}
              >
                <Asterisk className="h-3.5 w-3.5" aria-hidden />
                <span className="pr-0.5">Required</span>
              </ToolbarButton>
              <ToolbarButton label={`Delete "${name}"`} onClick={onRequestDelete} tone="danger">
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </ToolbarButton>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Builders' "Family view": the step (or checklist form) drawn with the same
 * `ApplicationGardenSection` the family apply form renders, inside the family
 * Garden scope, with every part clickable to edit. Inputs are inert; editing
 * happens in side panels (`BuilderFieldEditorPanel`).
 */
export default function StepFamilyCanvas({
  familyTheme,
  step,
  chrome = "apply-step",
  stepIdx = 0,
  totalSteps = 1,
  kicker,
  readOnly,
  lockSystemFields,
  isLockedStep,
  selectedFieldId,
  onSelectField,
  onOpenStepDetails,
  onUpdateField,
  onMoveField,
  onRequestDeleteField,
  onAddField,
  belowFields,
}: StepFamilyCanvasProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const C = useMemo(() => parentThemeToGardenCompat(familyTheme), [familyTheme]);
  const canEditStep = !readOnly && !isLockedStep;
  const canAddQuestions =
    !readOnly && !(lockSystemFields && step.fields.some((field) => isLockedSystemField(field, true)));
  const hasNotice = Boolean(step.stepNotice?.body.trim());
  const hasDescription = Boolean(step.description?.trim());
  const stepLabel = `Step ${stepIdx + 1} of ${totalSteps}${step.title.trim() ? ` · ${step.title.trim()}` : ""}`;
  const ghostButton = `inline-flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-[var(--sf-ink)]/20 px-3 py-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`;

  return (
    <div className="w-full">
      {!readOnly ? (
        <p className="m-0 mb-3 flex items-center gap-1.5 px-1 text-[12.5px] font-bold text-[var(--sf-soft)]">
          <MousePointerClick className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
          Click any question, heading or note to edit it.
        </p>
      ) : null}

      <ParentGardenScope theme={familyTheme}>
        <section
          aria-label={chrome === "apply-step" ? `Step ${stepIdx + 1} as families see it` : "As families see it"}
          data-family-preview
          className="rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-5 pb-6 pt-6 text-[var(--sf-ink)] shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-8 sm:pb-8 sm:pt-8"
        >
          {/* Same label + progress as the family form card. */}
          <div aria-hidden>
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
              {chrome === "apply-step" ? stepLabel : kicker}
            </p>
            {chrome === "apply-step" ? (
              <div className="mb-6 mt-2.5 flex items-center gap-1.5">
                {Array.from({ length: Math.max(totalSteps, 1) }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${
                      index <= stepIdx ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/12"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-4" />
            )}
          </div>

          <ApplicationGardenSection
            C={C}
            section={step}
            emptyTitle={<span className="italic text-[#9a6a00]">Untitled · click to name it</span>}
            wrapHeader={(node) => (
              <EditableRegion
                label={step.title.trim() ? `Edit heading: ${step.title}` : "Name this step"}
                onEdit={() => onOpenStepDetails("title")}
                disabled={!canEditStep}
              >
                {node}
              </EditableRegion>
            )}
            wrapNotice={(node) => (
              <EditableRegion label="Edit the highlighted note" onEdit={() => onOpenStepDetails("notice")} disabled={!canEditStep}>
                {node}
              </EditableRegion>
            )}
            afterHeader={
              canEditStep && (!hasDescription || !hasNotice) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {!hasDescription ? (
                    <button type="button" onClick={() => onOpenStepDetails("description")} className={ghostButton}>
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add instructions
                    </button>
                  ) : null}
                  {!hasNotice ? (
                    <button type="button" onClick={() => onOpenStepDetails("notice")} className={ghostButton}>
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add a highlighted note
                    </button>
                  ) : null}
                </div>
              ) : null
            }
            labelFor={(field) =>
              field.label.trim() ? undefined : <span className="italic text-[#9a6a00]">Untitled question</span>
            }
            renderField={(field, node) => {
              const index = step.fields.findIndex((entry) => entry.id === field.id);
              return (
                <FamilyFieldBlock
                  field={field}
                  index={index}
                  fields={step.fields}
                  selected={selectedFieldId === field.id}
                  readOnly={readOnly}
                  lockSystemFields={lockSystemFields}
                  onSelect={() => onSelectField(field.id)}
                  onUpdate={(patch) => onUpdateField(field.id, patch)}
                  onMove={(direction) => onMoveField(field.id, direction)}
                  onRequestDelete={() => onRequestDeleteField(field.id)}
                >
                  {node}
                </FamilyFieldBlock>
              );
            }}
            empty={
              <p className="m-0 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-4 py-8 text-center text-[14px] font-semibold text-[var(--sf-soft)]">
                No questions here yet.
              </p>
            }
          />

          {belowFields}

          {canAddQuestions ? (
            pickerOpen ? (
              <div className="mt-6 space-y-2 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] p-3">
                <p className="m-0 text-[12.5px] font-extrabold text-[var(--sf-ink)]">Add a question</p>
                <ApplicationFormFieldPresetPicker
                  C={C}
                  stepId={step.id}
                  onAddPreset={(_stepId, field) => {
                    onAddField(field);
                    setPickerOpen(false);
                  }}
                  onAddBlank={() => {
                    onAddField(createBlankField());
                    setPickerOpen(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className={`rounded-md text-[12.5px] font-bold text-[var(--sf-soft)] hover:text-[var(--sf-ink)] ${G_FOCUS}`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={`mt-7 flex w-full items-center justify-center gap-1.5 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 py-3 text-[13px] font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                data-testid="family-add-question"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add question
              </button>
            )
          ) : null}

          {chrome === "apply-step" ? (
            /* The page's own buttons, for context only. */
            <div
              aria-hidden
              inert
              className="mt-7 flex items-center justify-between border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4 opacity-60"
            >
              {stepIdx > 0 ? (
                <span className="rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white px-4 py-2 text-sm font-extrabold">
                  Back
                </span>
              ) : (
                <span />
              )}
              <span className="rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-5 py-2.5 text-[15px] font-extrabold text-white shadow-[0_4px_0_0_var(--sf-ink)]">
                Save and continue
              </span>
            </div>
          ) : null}
        </section>
      </ParentGardenScope>
    </div>
  );
}
