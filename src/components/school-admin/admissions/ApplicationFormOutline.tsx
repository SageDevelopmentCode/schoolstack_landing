"use client";

import { useState } from "react";
import { Lock, Plus, Check, ArrowUpDown } from "lucide-react";
import type { ApplicationSection } from "@/lib/admissions/application-form-schema";
import { isSystemSection } from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { BuilderFocus } from "./builder-focus";
import ApplicationFormStepsReorderDialog from "./ApplicationFormStepsReorderDialog";
import {
  outlineActiveRowStyle,
  outlineRowInteractiveClassName,
} from "./outline-item-styles";

type ApplicationFormOutlineProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  sections: ApplicationSection[];
  focus: BuilderFocus;
  readOnly: boolean;
  lockSystemStep?: boolean;
  onFocusChange: (focus: BuilderFocus) => void;
  onReorderSteps: (sections: ApplicationSection[]) => void;
  onAddStep: () => void;
  /** Steps with publish-checklist problems (amber dot). */
  issueStepIds?: ReadonlySet<string>;
};

function StepOutlineRow({
  C,
  theme,
  step,
  stepIdx,
  active,
  lockSystemStep,
  onSelect,
  hasIssue = false,
}: {
  hasIssue?: boolean;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  active: boolean;
  lockSystemStep: boolean;
  onSelect: () => void;
}) {
  const questionCount = step.fields.length;
  const isLocked = lockSystemStep && isSystemSection(step);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-1 w-full rounded-[11px] border px-3 py-3 text-left ${outlineRowInteractiveClassName(active)}`}
      style={outlineActiveRowStyle(active, theme)}
      data-flows-outline-row={active ? "active" : "idle"}
    >
      <span className="flex items-start gap-2">
        <span
          className="mt-0.5 inline-grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: active ? (theme?.primary ?? C.accent) : "#E0ECE2",
            color: active ? "#fff" : (theme?.primary ?? C.accent),
          }}
        >
          {stepIdx + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: active ? (theme?.primary ?? C.accent) : C.textPrimary }}
          >
            <span className="line-clamp-2 break-words">{step.title || `Step ${stepIdx + 1}`}</span>
            {isLocked ? (
              <span
                className="inline-flex shrink-0 items-center"
                style={{ color: C.textTertiary }}
                title="System step: required for every apply form"
                aria-label="System step"
              >
                <Lock className="h-3 w-3" aria-hidden />
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: C.textTertiary }}>
            {hasIssue ? (
              <span className="inline-flex items-center gap-1 font-bold text-[#9a6a00]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#d9a400]" />
                Needs a fix ·
              </span>
            ) : questionCount > 0 ? (
              <Check className="h-3 w-3 text-[var(--sf-forest,#2f6b45)]" aria-label="Has questions" />
            ) : null}
            {questionCount} question{questionCount === 1 ? "" : "s"}
          </span>
        </span>
      </span>
    </button>
  );
}

/**
 * The Questions stage's step list. From `lg` it is a column beside the step
 * editor; below `lg` it becomes a horizontal row of step chips above it.
 * Form settings, fees and after-submit live in their own stages now.
 */
export default function ApplicationFormOutline({
  C,
  theme,
  sections,
  focus,
  readOnly,
  lockSystemStep = false,
  onFocusChange,
  onReorderSteps,
  onAddStep,
  issueStepIds,
}: ApplicationFormOutlineProps) {
  const [reorderOpen, setReorderOpen] = useState(false);
  const isStepActive = (stepId: string) =>
    focus.kind === "step"
      ? focus.stepId === stepId
      : focus.kind === "field" && focus.stepId === stepId;

  if (!theme) {
    return null;
  }

  const canReorder = !readOnly && sections.length >= 2;

  return (
    <>
      {/* lg and up: step column */}
      <div
        className="hidden h-full w-[264px] shrink-0 flex-col overflow-hidden border-r bg-white lg:flex"
        style={{ borderColor: "#EDF1ED" }}
        data-flows-outline
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
          style={{ borderColor: "#EDF1ED" }}
        >
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: C.textPrimary }}>
              Application steps
            </p>
            <p className="text-[11px] tabular-nums" style={{ color: C.textTertiary }}>
              {sections.length} step{sections.length === 1 ? "" : "s"} · families see them in this order
            </p>
          </div>
          {canReorder ? (
            <AdminTextLink theme={theme} onClick={() => setReorderOpen(true)} aria-label="Reorder steps">
              <span className="inline-flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                Reorder
              </span>
            </AdminTextLink>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {sections.length === 0 ? (
            <p className="px-2 py-2 text-[11px]" style={{ color: C.textTertiary }}>
              No steps yet
            </p>
          ) : (
            sections.map((step, stepIdx) => (
              <StepOutlineRow
                key={step.id}
                C={C}
                theme={theme}
                step={step}
                stepIdx={stepIdx}
                active={isStepActive(step.id)}
                lockSystemStep={lockSystemStep}
                hasIssue={issueStepIds?.has(step.id) ?? false}
                onSelect={() => onFocusChange({ kind: "step", stepId: step.id })}
              />
            ))
          )}

          {!readOnly ? (
            <button
              type="button"
              onClick={onAddStep}
              className="mx-1 mb-2 mt-1 flex w-[calc(100%-8px)] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border border-dashed py-2.5 text-[12px] font-semibold transition-colors hover:bg-[#F3F8F4]"
              style={{
                borderColor: "#DCE4DC",
                color: theme.primary,
                backgroundColor: "transparent",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add step
            </button>
          ) : null}
        </div>
      </div>

      {/* Below lg: horizontal step chips */}
      <div className="shrink-0 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 bg-[#fffdf8] lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 pt-2.5 sm:px-4">
          <p className="m-0 text-[12.5px] font-extrabold text-[var(--sf-ink)]">
            Application steps
            <span className="ml-1.5 font-semibold tabular-nums text-[var(--sf-soft)]">{sections.length}</span>
          </p>
          {canReorder ? (
            <AdminTextLink theme={theme} onClick={() => setReorderOpen(true)} aria-label="Reorder steps">
              <span className="inline-flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                Reorder
              </span>
            </AdminTextLink>
          ) : null}
        </div>
        <ol
          aria-label="Application steps"
          className="m-0 flex list-none gap-1.5 overflow-x-auto px-3 pb-2.5 pt-2 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((step, stepIdx) => {
            const active = isStepActive(step.id);
            const hasIssue = issueStepIds?.has(step.id) ?? false;
            return (
              <li key={step.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onFocusChange({ kind: "step", stepId: step.id })}
                  aria-current={active ? "step" : undefined}
                  className={`inline-flex max-w-[15rem] items-center gap-1.5 rounded-full border-[1.5px] py-1.5 pl-1.5 pr-3 text-[12.5px] font-extrabold transition-colors ${
                    active
                      ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)] text-[var(--sf-ink)]"
                      : "border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/30"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] tabular-nums ${
                      active ? "bg-[var(--sf-clay)] text-white" : "bg-[var(--sf-ink)]/[0.07] text-[var(--sf-ink)]/70"
                    }`}
                  >
                    {stepIdx + 1}
                    {hasIssue ? (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#d9a400]" />
                    ) : null}
                  </span>
                  <span className="truncate">{step.title || `Step ${stepIdx + 1}`}</span>
                  {lockSystemStep && isSystemSection(step) ? (
                    <Lock className="h-3 w-3 shrink-0 text-[var(--sf-ink)]/40" aria-label="System step" />
                  ) : null}
                  {hasIssue ? <span className="sr-only">(needs a fix)</span> : null}
                </button>
              </li>
            );
          })}
          {!readOnly ? (
            <li className="shrink-0">
              <button
                type="button"
                onClick={onAddStep}
                className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-[var(--sf-ink)]/20 px-3 py-1.5 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:bg-[var(--sf-accent-wash)]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add step
              </button>
            </li>
          ) : null}
        </ol>
      </div>

      <ApplicationFormStepsReorderDialog
        C={C}
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        sections={sections}
        readOnly={readOnly}
        lockSystemStep={lockSystemStep}
        onReorderSteps={onReorderSteps}
      />
    </>
  );
}
