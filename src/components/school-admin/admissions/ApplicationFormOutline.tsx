"use client";

import { Reorder, useDragControls } from "framer-motion";
import {
  ChevronRight,
  CreditCard,
  Eye,
  GripVertical,
  Lock,
  ListChecks,
  Plus,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import type { ApplicationSection } from "@/lib/admissions/application-form-schema";
import { isSystemSection } from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  focusKey,
  type BuilderFocus,
} from "./builder-focus";

type ApplicationFormOutlineProps = {
  C: AdminThemeTokens;
  sections: ApplicationSection[];
  focus: BuilderFocus;
  readOnly: boolean;
  lockSystemStep?: boolean;
  postSubmitActionCount?: number;
  onFocusChange: (focus: BuilderFocus) => void;
  onReorderSteps: (sections: ApplicationSection[]) => void;
  onAddStep: () => void;
  onPreview: () => void;
};

function OutlineSectionLabel({
  children,
  C,
}: {
  children: React.ReactNode;
  C: AdminThemeTokens;
}) {
  return (
    <p
      className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: C.textQuaternary }}
    >
      {children}
    </p>
  );
}

function NavButton({
  C,
  active,
  onClick,
  icon: Icon,
  label,
  meta,
}: {
  C: AdminThemeTokens;
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
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors"
      style={{
        backgroundColor: active ? C.accentLight : "transparent",
        color: active ? C.accent : C.textSecondary,
        borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {meta ? (
        <span className="text-[10px] shrink-0" style={{ color: C.textTertiary }}>
          {meta}
        </span>
      ) : null}
      <ChevronRight
        className="h-3 w-3 shrink-0 opacity-40"
        style={{ color: active ? C.accent : C.textQuaternary }}
      />
    </button>
  );
}

function StepOutlineRow({
  C,
  step,
  stepIdx,
  active,
  readOnly,
  lockSystemStep,
  onSelect,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  active: boolean;
  readOnly: boolean;
  lockSystemStep: boolean;
  onSelect: () => void;
}) {
  const dragControls = useDragControls();
  const questionCount = step.fields.length;
  const isLocked = lockSystemStep && isSystemSection(step);
  const canDrag = !readOnly && !isLocked;

  return (
    <Reorder.Item
      as="div"
      value={step}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div
        className="flex items-center"
        style={{
          backgroundColor: active ? C.accentLight : "transparent",
          borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
        }}
      >
        {canDrag ? (
          <button
            type="button"
            aria-label="Drag to reorder step"
            className="touch-none cursor-grab px-1 py-2 active:cursor-grabbing shrink-0"
            style={{ color: C.textQuaternary }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="w-6 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-left"
          style={{ paddingLeft: readOnly ? 12 : 0 }}
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: active ? C.accent : C.accentLight,
              color: active ? "#fff" : C.accent,
            }}
          >
            {stepIdx + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="flex items-center gap-1.5 truncate text-xs font-medium"
              style={{ color: active ? C.accent : C.textPrimary }}
            >
              {step.title || `Step ${stepIdx + 1}`}
              {isLocked ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: C.elevated, color: C.textTertiary }}
                >
                  <Lock className="h-2.5 w-2.5" />
                  System
                </span>
              ) : null}
            </span>
            <span className="text-[10px]" style={{ color: C.textTertiary }}>
              {questionCount} question{questionCount === 1 ? "" : "s"}
            </span>
          </span>
          <ChevronRight
            className="h-3 w-3 shrink-0 opacity-40"
            style={{ color: active ? C.accent : C.textQuaternary }}
          />
        </button>
      </div>
    </Reorder.Item>
  );
}

export default function ApplicationFormOutline({
  C,
  sections,
  focus,
  readOnly,
  lockSystemStep = false,
  postSubmitActionCount = 0,
  onFocusChange,
  onReorderSteps,
  onAddStep,
  onPreview,
}: ApplicationFormOutlineProps) {
  const activeKey = focusKey(focus);
  const isStepActive = (stepId: string) =>
    focus.kind === "step"
      ? focus.stepId === stepId
      : focus.kind === "field" && focus.stepId === stepId;

  return (
    <div
      className="flex h-full w-[200px] shrink-0 flex-col overflow-hidden border-r"
      style={{ borderColor: C.border, backgroundColor: C.bg }}
    >
      <div className="flex-1 overflow-y-auto">
        <OutlineSectionLabel C={C}>Form settings</OutlineSectionLabel>
        <NavButton
          C={C}
          active={activeKey === "setup"}
          onClick={() => onFocusChange({ kind: "setup" })}
          icon={Settings2}
          label="Setup"
        />

        <OutlineSectionLabel C={C}>Steps</OutlineSectionLabel>
        {sections.length === 0 ? (
          <p className="px-3 py-2 text-[11px]" style={{ color: C.textTertiary }}>
            No steps yet
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={(next) => !readOnly && onReorderSteps(next)}
            as="div"
          >
            {sections.map((step, stepIdx) => (
              <StepOutlineRow
                key={step.id}
                C={C}
                step={step}
                stepIdx={stepIdx}
                active={isStepActive(step.id)}
                readOnly={readOnly}
                lockSystemStep={lockSystemStep}
                onSelect={() => onFocusChange({ kind: "step", stepId: step.id })}
              />
            ))}
          </Reorder.Group>
        )}

        {!readOnly && (
          <button
            type="button"
            onClick={onAddStep}
            className="mx-3 mt-2 flex w-[calc(100%-24px)] items-center justify-center gap-1.5 rounded-sm py-2 text-[11px] font-medium"
            style={{
              border: `1px dashed ${C.borderStrong}`,
              color: C.accent,
              backgroundColor: "transparent",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add step
          </button>
        )}

        <OutlineSectionLabel C={C}>Before submit</OutlineSectionLabel>
        <NavButton
          C={C}
          active={activeKey === "fee"}
          onClick={() => onFocusChange({ kind: "fee" })}
          icon={CreditCard}
          label="Application fee"
        />
        <NavButton
          C={C}
          active={activeKey === "acknowledgments"}
          onClick={() => onFocusChange({ kind: "acknowledgments" })}
          icon={ShieldCheck}
          label="Acknowledgments"
        />

        <OutlineSectionLabel C={C}>After submit</OutlineSectionLabel>
        <NavButton
          C={C}
          active={activeKey === "postSubmit"}
          onClick={() => onFocusChange({ kind: "postSubmit" })}
          icon={ListChecks}
          label="Post-submit steps"
          meta={postSubmitActionCount > 0 ? String(postSubmitActionCount) : undefined}
        />
      </div>

      <div className="shrink-0 border-t p-3" style={{ borderColor: C.border }}>
        <button
          type="button"
          onClick={onPreview}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-medium"
          style={{
            border: `1px solid ${C.border}`,
            color: C.textSecondary,
            backgroundColor: C.surface,
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview form
        </button>
      </div>
    </div>
  );
}
