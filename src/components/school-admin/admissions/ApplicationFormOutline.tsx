"use client";

import { useState } from "react";
import {
  CreditCard,
  Eye,
  Lock,
  ListChecks,
  Plus,
  Settings2,
  ShieldCheck,
  Check,
  ArrowUpDown,
} from "lucide-react";
import type { ApplicationSection } from "@/lib/admissions/application-form-schema";
import { isSystemSection } from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import {
  focusKey,
  type BuilderFocus,
} from "./builder-focus";
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
  postSubmitActionCount?: number;
  onFocusChange: (focus: BuilderFocus) => void;
  onReorderSteps: (sections: ApplicationSection[]) => void;
  onAddStep: () => void;
  onPreview: () => void;
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

function NavRow({
  C,
  theme,
  active,
  onClick,
  icon: Icon,
  label,
  meta,
}: {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-2 rounded-[11px] border px-3 py-2.5 text-left text-xs ${outlineRowInteractiveClassName(active)}`}
      style={{
        ...outlineActiveRowStyle(active, theme),
        color: active ? (theme?.primary ?? C.accent) : C.textSecondary,
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {meta ? (
        <span className="text-[10px] shrink-0" style={{ color: C.textTertiary }}>
          {meta}
        </span>
      ) : null}
    </button>
  );
}

export default function ApplicationFormOutline({
  C,
  theme,
  sections,
  focus,
  readOnly,
  lockSystemStep = false,
  postSubmitActionCount = 0,
  onFocusChange,
  onReorderSteps,
  onAddStep,
  onPreview,
  issueStepIds,
}: ApplicationFormOutlineProps) {
  const [reorderOpen, setReorderOpen] = useState(false);
  const activeKey = focusKey(focus);
  const isStepActive = (stepId: string) =>
    focus.kind === "step"
      ? focus.stepId === stepId
      : focus.kind === "field" && focus.stepId === stepId;

  if (!theme) {
    return null;
  }

  return (
    <div
      className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r bg-white lg:w-[264px]"
      style={{ borderColor: "#EDF1ED" }}
      data-flows-outline
    >
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "#EDF1ED" }}
      >
        <div>
          <p className="text-[15px] font-semibold" style={{ color: C.textPrimary }}>
            Application steps
          </p>
        </div>
        {!readOnly ? (
          <AdminButton theme={theme} variant="soft" size="compact" onClick={onAddStep}>
            + Add
          </AdminButton>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p
          className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.11em]"
          style={{ color: "#98A39F" }}
        >
          Form settings
        </p>
        <NavRow
          C={C}
          theme={theme}
          active={activeKey === "setup"}
          onClick={() => onFocusChange({ kind: "setup" })}
          icon={Settings2}
          label="Title, link & program"
        />

        <div className="flex items-center justify-between px-2 pt-3 pb-1">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.11em]"
            style={{ color: "#98A39F" }}
          >
            Steps
          </p>
          {!readOnly && sections.length >= 2 ? (
            <AdminTextLink theme={theme} onClick={() => setReorderOpen(true)} aria-label="Reorder steps">
              <span className="inline-flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                Reorder
              </span>
            </AdminTextLink>
          ) : null}
        </div>

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
            className="mx-1 mb-2 flex w-[calc(100%-8px)] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border border-dashed py-2 text-[11px] font-semibold transition-colors hover:bg-[#F3F8F4]"
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

        <p
          className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.11em]"
          style={{ color: "#98A39F" }}
        >
          Before submit
        </p>
        <NavRow
          C={C}
          theme={theme}
          active={activeKey === "fee"}
          onClick={() => onFocusChange({ kind: "fee" })}
          icon={CreditCard}
          label="Application fee"
        />
        <NavRow
          C={C}
          theme={theme}
          active={activeKey === "acknowledgments"}
          onClick={() => onFocusChange({ kind: "acknowledgments" })}
          icon={ShieldCheck}
          label="Acknowledgments"
        />

        <p
          className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.11em]"
          style={{ color: "#98A39F" }}
        >
          After submit
        </p>
        <NavRow
          C={C}
          theme={theme}
          active={activeKey === "postSubmit"}
          onClick={() => onFocusChange({ kind: "postSubmit" })}
          icon={ListChecks}
          label="Post-submit steps"
          meta={postSubmitActionCount > 0 ? String(postSubmitActionCount) : undefined}
        />
      </div>

      <div className="shrink-0 border-t p-3" style={{ borderColor: "#EDF1ED" }}>
        <button
          type="button"
          onClick={onPreview}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border py-2 text-xs font-semibold transition-colors hover:bg-[#F3F8F4]"
          style={{
            borderColor: "#DCE4DC",
            color: C.textSecondary,
            backgroundColor: C.surface,
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview form
        </button>
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
    </div>
  );
}
