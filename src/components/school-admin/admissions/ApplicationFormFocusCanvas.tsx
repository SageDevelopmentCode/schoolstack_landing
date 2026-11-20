"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Copy, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import {
  APPLY_FORM_PUBLIC_SLUG,
  type ProgramOption,
} from "@/lib/admissions/application-forms";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  type ApplicationField,
  type ApplicationFormFeeConfig,
  type ApplicationFormNotificationConfig,
  type ApplicationFormPostSubmitConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
  type ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import {
  APPLY_SYSTEM_ADMIN_CALLOUT,
  isSystemFieldId,
  isSystemSection,
} from "@/lib/admissions/apply-system-fields";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFormAcknowledgmentsEditor from "./ApplicationFormAcknowledgmentsEditor";
import ApplicationFormFieldEditor from "./ApplicationFormFieldEditor";
import BuilderFieldEditorPanel from "./BuilderFieldEditorPanel";
import ApplicationFormFeePanel from "./ApplicationFormFeePanel";
import ApplicationFormPostSubmitEditor from "./ApplicationFormPostSubmitEditor";
import ApplicationFormQuestionList, { orderFieldsSystemFirst } from "./ApplicationFormQuestionList";
import StepFamilyCanvas from "./StepFamilyCanvas";
import { BuilderViewToggle, useBuilderViewMode } from "./builder-view-mode";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  BuilderQuestionCard,
  BuilderQuestionGroup,
  BuilderSectionIntro,
} from "./builder-question-card";
import { builderCanvasTransition } from "./builder-canvas-motion";
import { focusKey, type BuilderFocus } from "./builder-focus";
import { stageOfFocus } from "./builder-stages";
import { BUILDER_CANVAS_BG } from "./outline-item-styles";
import ReuseApplicationStepDialog from "./ReuseApplicationStepDialog";

export type EditableFormSlice = {
  title: string;
  intro: string;
  programId: string | null;
  publicSlug: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  postSubmitConfig: ApplicationFormPostSubmitConfig;
  notificationConfig: ApplicationFormNotificationConfig;
};

type ApplicationFormFocusCanvasProps = {
  C: AdminThemeTokens;
  /** School branding: the family view draws steps with the public form's tokens. */
  branding?: OrganizationBranding;
  theme?: ParentThemeTokens;
  focus: BuilderFocus;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  organizationId: string;
  readOnly: boolean;
  lockSystemFields?: boolean;
  lockApplySlug?: boolean;
  setupHighlight?: "publicSlug" | null;
  slugError?: string | null;
  stripePaymentsReady?: boolean;
  onFocusChange: (focus: BuilderFocus) => void;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
  onUpdateSchema: (
    updater: (schema: ApplicationFormSchema) => ApplicationFormSchema,
  ) => void;
  onDeleteStep: (stepId: string) => void;
  sourceForms?: ApplicationFormVersion[];
  loadedFormIds?: ReadonlySet<string>;
  programNameById?: Map<string, string>;
  onReuseStep?: (targetStepId: string, sourceSection: ApplicationSection) => void;
  onReuseDialogOpen?: () => void;
  programEnrollmentChecklist?: EnrollmentChecklistTemplate | null;
  onOpenEnrollmentChecklist?: (checklistId: string) => void;
  /** Rendered for the Review & publish stage (`focus.kind === "review"`). */
  reviewStage?: React.ReactNode;
};

type PendingDelete =
  | { kind: "step"; stepId: string; stepTitle: string; questionCount: number }
  | { kind: "field"; stepId: string; fieldId: string; fieldLabel: string };

const canvasTransition = builderCanvasTransition;

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: "#FCFDFC",
    border: "1px solid #D9E0DA",
    color: C.textPrimary,
    borderRadius: "7px",
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

function BuilderAddButton({
  C,
  onClick,
  label = "Add",
}: {
  C: AdminThemeTokens;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: C.accentLight,
        color: C.accent,
        border: `1px solid ${C.secondaryBtnBorder}`,
      }}
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function SetupView({
  C,
  theme,
  editable,
  programs,
  orgSlug,
  readOnly,
  lockApplySlug = false,
  setupHighlight,
  slugError,
  programEnrollmentChecklist,
  onOpenEnrollmentChecklist,
  onEditableChange,
}: {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  readOnly: boolean;
  lockApplySlug?: boolean;
  setupHighlight?: "publicSlug" | null;
  slugError?: string | null;
  programEnrollmentChecklist?: EnrollmentChecklistTemplate | null;
  onOpenEnrollmentChecklist?: (checklistId: string) => void;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
}) {
  const slugInputRef = useRef<HTMLInputElement>(null);
  const slugHighlighted = !lockApplySlug && setupHighlight === "publicSlug";

  useEffect(() => {
    if (!slugHighlighted) return;
    const input = slugInputRef.current;
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [slugHighlighted]);

  return (
    <div className="w-full space-y-5">
      <BuilderSectionIntro
        C={C}
        theme={theme}
        eyebrow={theme ? "Basics" : undefined}
        title="Name, welcome & apply link"
        subtitle="What families see first, where they apply and which program the application is for."
      />

      <BuilderQuestionGroup title="Welcome" description="What families see first.">
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="What should families call this application?"
        helper="This appears as the main heading on your public apply page."
      >
        <input
          type="text"
          value={editable.title}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ title: e.target.value })}
          placeholder="e.g. Application for Fall 2026"
          style={inputStyle(C)}
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="clay"
        question="What should families read when they first open the form?"
        helper="A short welcome message — explain what to expect or how long it takes."
      >
        <textarea
          rows={theme ? 7 : 4}
          value={editable.intro}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ intro: e.target.value })}
          placeholder="Welcome families and explain what to expect…"
          style={{ ...inputStyle(C), resize: "vertical" }}
        />
      </BuilderQuestionCard>
      </BuilderQuestionGroup>

      <BuilderQuestionGroup title="Where & who" description="The apply link, the program it enrolls into, and what happens after acceptance.">

      <BuilderQuestionCard
        C={C}
        tone="info"
        question={
          lockApplySlug
            ? "Where will families apply?"
            : "What link will families use to apply?"
        }
        helper={
          lockApplySlug
            ? "Families apply at this link and choose their program when you have more than one."
            : "Use lowercase letters, numbers, and hyphens only."
        }
        highlightError={slugHighlighted}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="shrink-0 text-xs"
              style={{ color: C.textTertiary }}
            >
              /school/{orgSlug}/forms/
            </span>
            {lockApplySlug ? (
              <span
                className="flex-1 rounded-md px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.textSecondary,
                }}
              >
                {APPLY_FORM_PUBLIC_SLUG}
              </span>
            ) : (
              <input
                ref={slugInputRef}
                type="text"
                value={editable.publicSlug}
                disabled={readOnly}
                onChange={(e) => onEditableChange({ publicSlug: e.target.value })}
                placeholder="e.g. apply"
                style={{
                  ...inputStyle(C),
                  flex: 1,
                  border: `1px solid ${slugHighlighted ? C.errorBorder : C.inputBorder}`,
                }}
              />
            )}
          </div>
          {slugHighlighted && slugError ? (
            <p className="text-xs font-medium" style={{ color: C.error }}>
              {slugError}
            </p>
          ) : null}
        </div>
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="success"
        question="Which admissions program is this application for?"
        helper="Each submission is tied to one program. Required before you can publish."
      >
        <div className="space-y-2">
          <SchoolAdminSelect
            C={C}
            value={editable.programId ?? ""}
            disabled={readOnly}
            onChange={(value) =>
              onEditableChange({ programId: value || null })
            }
            options={programs.map((program) => ({
              value: program.id,
              label: program.name,
            }))}
            placeholder="Select a program (required)"
            ariaLabel="Admissions program"
          />
          {!editable.programId ? (
            <p className="text-xs font-medium" style={{ color: C.error }}>
              {programs.length === 0 ? (
                <>
                  <Link
                    href={schoolAdminPath(orgSlug, "admissions", "programs")}
                    className="underline underline-offset-2"
                    style={{ color: C.accent }}
                  >
                    Create a program first
                  </Link>{" "}
                  before publishing the form.
                </>
              ) : (
                "Select a program so families can start an application."
              )}
            </p>
          ) : null}
        </div>
      </BuilderQuestionCard>

      {editable.programId ? (
        <BuilderQuestionCard
          C={C}
          tone="info"
          question="Enrollment for this program"
          helper="After acceptance, submissions use the published checklist for this program. Programs without a checklist can be marked enrolled directly."
        >
          {programEnrollmentChecklist ? (
            <div className="space-y-2 text-sm" style={{ color: C.textSecondary }}>
              <p>
                <span className="font-semibold" style={{ color: C.textPrimary }}>
                  {programEnrollmentChecklist.name}
                </span>{" "}
                ·{" "}
                {programEnrollmentChecklist.status === "published"
                  ? "Published"
                  : programEnrollmentChecklist.status === "draft"
                    ? "Draft"
                    : "Archived"}
              </p>
              {onOpenEnrollmentChecklist ? (
                <button
                  type="button"
                  onClick={() => onOpenEnrollmentChecklist(programEnrollmentChecklist.id)}
                  className="text-sm font-medium underline-offset-2 hover:underline"
                  style={{ color: C.accent }}
                >
                  Open enrollment checklist
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm" style={{ color: C.textSecondary }}>
              No enrollment checklist for this program yet. Accepted families can be
              marked enrolled directly until you publish one.
            </p>
          )}
        </BuilderQuestionCard>
      ) : null}
      </BuilderQuestionGroup>

      <BuilderQuestionGroup title="Notifications & reminders" description="Managed in Notifications settings.">
      <BuilderQuestionCard
        C={C}
        tone="info"
        question="Want to be notified when new applications come in?"
        helper="Application notification emails are managed in Notifications settings."
      >
        <Link
          href={schoolAdminPath(orgSlug, "notifications")}
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: C.accent }}
        >
          Manage in Notifications
        </Link>
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="info"
        question="Need to nudge families who haven't finished applying or enrolling?"
        helper="MudKitchen can send up to two reminder emails when a family has an unfinished draft application or enrollment checklist — first after 72 hours of inactivity, then again 7 days later. Reminders are off by default; enable them under Notifications → Parent reminders."
      >
        <Link
          href={schoolAdminPath(orgSlug, "notifications")}
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: C.accent }}
        >
          Enable parent reminders in Notifications
        </Link>
      </BuilderQuestionCard>
      </BuilderQuestionGroup>
    </div>
  );
}

type StepDetailsSection = "title" | "description" | "notice";

/** Step title, instructions and highlighted note (compact list inline, family view in a side panel). */
function StepDetailsFields({
  C,
  step,
  readOnly,
  onUpdateStep,
  initialSection,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  readOnly: boolean;
  onUpdateStep: (patch: Partial<ApplicationSection>) => void;
  /** Opens that section's editor and moves focus into it (side panel). */
  initialSection?: StepDetailsSection;
}) {
  const hasDescription = Boolean(step.description?.trim());
  const hasStepNotice = Boolean(step.stepNotice?.body?.trim());
  const [descriptionEditorOpen, setDescriptionEditorOpen] = useState(initialSection === "description");
  const [stepNoticeEditorOpen, setStepNoticeEditorOpen] = useState(initialSection === "notice");
  const showDescriptionEditor = hasDescription || descriptionEditorOpen;
  const showStepNoticeEditor = hasStepNotice || stepNoticeEditorOpen;

  useEffect(() => {
    if (!initialSection) return;
    // GSidePanel focuses its Close button ~60ms after opening; land in the field after that.
    const timer = window.setTimeout(() => {
      const section = document.getElementById(`step-details-${initialSection}`);
      const input = section?.querySelector<HTMLElement>("input, textarea");
      section?.scrollIntoView({ block: "nearest" });
      input?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [initialSection]);

  return (
    <div className="space-y-5">
      <div id="step-details-title">
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="What should families call this step?"
          helper="This is the heading families see at the top of this screen."
        >
          <input
            type="text"
            value={step.title}
            disabled={readOnly}
            onChange={(e) => onUpdateStep({ title: e.target.value })}
            placeholder="e.g. Parent information"
            style={inputStyle(C)}
          />
        </BuilderQuestionCard>
      </div>

      {readOnly && !hasDescription ? null : (
        <div id="step-details-description">
          <BuilderQuestionCard
            C={C}
            tone="clay"
            question="What instructions should appear at the top of this step?"
            helper={
              showDescriptionEditor
                ? "Optional — add context before families start answering questions."
                : undefined
            }
            action={
              !readOnly && !showDescriptionEditor ? (
                <BuilderAddButton
                  C={C}
                  onClick={() => setDescriptionEditorOpen(true)}
                />
              ) : undefined
            }
          >
            {showDescriptionEditor ? (
              <textarea
                rows={2}
                value={step.description ?? ""}
                disabled={readOnly}
                onChange={(e) => {
                  const description = e.target.value;
                  if (!description.trim()) {
                    onUpdateStep({ description: undefined });
                    setDescriptionEditorOpen(false);
                    return;
                  }
                  onUpdateStep({ description });
                }}
                placeholder="Optional instructions for this step…"
                style={{ ...inputStyle(C), resize: "vertical" }}
              />
            ) : null}
          </BuilderQuestionCard>
        </div>
      )}

      {readOnly && !hasStepNotice ? null : (
        <div id="step-details-notice">
          <BuilderQuestionCard
            C={C}
            tone="info"
            question="Is there a message you want to highlight on this step?"
            helper={
              showStepNoticeEditor
                ? "Optional callout shown to families on this step."
                : undefined
            }
            action={
              !readOnly && !showStepNoticeEditor ? (
                <BuilderAddButton
                  C={C}
                  onClick={() => setStepNoticeEditorOpen(true)}
                />
              ) : undefined
            }
          >
            {showStepNoticeEditor ? (
              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={step.stepNotice?.body ?? ""}
                  disabled={readOnly}
                  onChange={(e) => {
                    const body = e.target.value;
                    if (!body.trim()) {
                      onUpdateStep({ stepNotice: undefined });
                      setStepNoticeEditorOpen(false);
                      return;
                    }
                    onUpdateStep({
                      stepNotice: {
                        body,
                        placement: step.stepNotice?.placement ?? "bottom",
                      },
                    });
                  }}
                  placeholder="Optional callout message for families…"
                  style={{ ...inputStyle(C), resize: "vertical" }}
                />
                {step.stepNotice?.body.trim() ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
                      Show this message at the…
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {(
                        [
                          { value: "top", label: "Top of step" },
                          { value: "bottom", label: "Bottom of step" },
                        ] as const
                      ).map((option) => (
                        <label
                          key={option.value}
                          className="inline-flex items-center gap-2 text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          <input
                            type="radio"
                            name={`step-notice-placement-${step.id}`}
                            value={option.value}
                            checked={step.stepNotice?.placement === option.value}
                            disabled={readOnly}
                            onChange={() =>
                              onUpdateStep({
                                stepNotice: {
                                  body: step.stepNotice!.body,
                                  placement: option.value,
                                },
                              })
                            }
                            className="h-4 w-4"
                            style={{ accentColor: C.accent }}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    <ApplicationStepNotice
                      body={step.stepNotice.body.trim()}
                      C={C}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </BuilderQuestionCard>
        </div>
      )}
    </div>
  );
}

function StepView({
  C,
  familyTheme,
  theme,
  step,
  stepIdx,
  totalSteps,
  readOnly,
  lockSystemFields,
  selectedFieldId,
  onFocusChange,
  onUpdateStep,
  onUpdateField,
  onRequestDeleteStep,
  onRequestDeleteField,
  onRequestReuseStep,
  canReuseStep,
  onAddField,
  onReorderFields,
}: {
  C: AdminThemeTokens;
  familyTheme?: ParentThemeTokens;
  theme?: ParentThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  totalSteps: number;
  readOnly: boolean;
  lockSystemFields: boolean;
  selectedFieldId: string | null;
  onFocusChange: (focus: BuilderFocus) => void;
  onUpdateStep: (patch: Partial<ApplicationSection>) => void;
  onUpdateField: (fieldId: string, patch: Partial<ApplicationField>) => void;
  onRequestDeleteStep: () => void;
  onRequestDeleteField: (fieldId: string) => void;
  onRequestReuseStep?: () => void;
  canReuseStep?: boolean;
  onAddField: (field: ApplicationField) => void;
  onReorderFields: (fields: ApplicationField[]) => void;
}) {
  const isLockedStep = lockSystemFields && isSystemSection(step);
  const [viewMode, setViewMode] = useBuilderViewMode();
  const [detailsSection, setDetailsSection] = useState<StepDetailsSection | null>(null);
  const [detailsStepId, setDetailsStepId] = useState(step.id);
  // Another step: close its details panel (previous-props pattern, no effect).
  if (detailsStepId !== step.id) {
    setDetailsStepId(step.id);
    setDetailsSection(null);
  }

  const addField = (field: ApplicationField) => {
    onAddField(field);
    onFocusChange({ kind: "field", stepId: step.id, fieldId: field.id });
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    const index = step.fields.findIndex((field) => field.id === fieldId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= step.fields.length) return;
    const next = [...step.fields];
    [next[index], next[target]] = [next[target], next[index]];
    onReorderFields(orderFieldsSystemFirst(next, lockSystemFields));
  };

  const openDetails = (section: StepDetailsSection) => {
    onFocusChange({ kind: "step", stepId: step.id });
    setDetailsSection(section);
  };

  const viewToggle = theme ? (
    <BuilderViewToggle mode={viewMode} onChange={setViewMode} label="How to show this step" />
  ) : null;
  const showFamily = Boolean(theme && familyTheme) && viewMode === "family";

  return (
    <div className="w-full space-y-5">
      <div className="flex items-start justify-between gap-4">
        <BuilderSectionIntro
          C={C}
          theme={theme}
          eyebrow={
            theme
              ? `Step ${stepIdx + 1} of ${totalSteps}`
              : `Step ${stepIdx + 1}`
          }
          title={step.title || `Step ${stepIdx + 1}`}
          subtitle={
            isLockedStep
              ? "Required student fields for your school directory."
              : showFamily
                ? "This is the page families see. Click anything to change it."
                : "Configure what families see and answer on this step."
          }
        />
        {!readOnly && !isLockedStep ? (
          <div className="flex shrink-0 items-center gap-2">
            {canReuseStep && onRequestReuseStep ? (
              <button
                type="button"
                onClick={onRequestReuseStep}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium"
                style={{
                  color: C.textSecondary,
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Reuse step
              </button>
            ) : null}
            <button
              type="button"
              onClick={onRequestDeleteStep}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium"
              style={{ color: C.error, backgroundColor: C.errorBg }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete step
            </button>
          </div>
        ) : null}
      </div>

      {viewToggle}

      {isLockedStep ? (
        <div
          className="rounded-md border px-4 py-3 text-sm leading-relaxed"
          style={{
            borderColor: C.infoBorder,
            backgroundColor: C.infoBg,
            color: C.textSecondary,
          }}
        >
          {APPLY_SYSTEM_ADMIN_CALLOUT}
        </div>
      ) : null}

      {showFamily ? (
        <StepFamilyCanvas
          familyTheme={familyTheme!}
          step={step}
          stepIdx={stepIdx}
          totalSteps={totalSteps}
          readOnly={readOnly}
          lockSystemFields={lockSystemFields}
          isLockedStep={isLockedStep}
          selectedFieldId={selectedFieldId}
          onSelectField={(fieldId) => {
            setDetailsSection(null);
            onFocusChange({ kind: "field", stepId: step.id, fieldId });
          }}
          onOpenStepDetails={openDetails}
          onUpdateField={onUpdateField}
          onMoveField={moveField}
          onRequestDeleteField={onRequestDeleteField}
          onAddField={addField}
        />
      ) : (
        <>
          {!isLockedStep ? (
            <StepDetailsFields key={step.id} C={C} step={step} readOnly={readOnly} onUpdateStep={onUpdateStep} />
          ) : null}

          <BuilderQuestionCard
            C={C}
            tone="success"
            question="What questions should families answer on this step?"
            helper="Click a question to edit it. Families answer these on this screen."
          >
            <ApplicationFormQuestionList
              C={C}
              stepId={step.id}
              fields={step.fields}
              selectedFieldId={selectedFieldId}
              readOnly={readOnly}
              lockSystemFields={lockSystemFields}
              onSelectField={(fieldId) =>
                onFocusChange({ kind: "field", stepId: step.id, fieldId })
              }
              onAddField={addField}
              onReorderFields={onReorderFields}
              hideHeader
            />
          </BuilderQuestionCard>
        </>
      )}

      {showFamily && !isLockedStep ? (
        <BuilderFieldEditorPanel
          C={C}
          open={detailsSection !== null}
          eyebrow={`Step ${stepIdx + 1} · Details`}
          title="Step details"
          subtitle="The heading, instructions and note families see on this step."
          onClose={() => setDetailsSection(null)}
        >
          {detailsSection ? (
            <StepDetailsFields
              C={C}
              step={step}
              readOnly={readOnly}
              onUpdateStep={onUpdateStep}
              initialSection={detailsSection}
            />
          ) : null}
        </BuilderFieldEditorPanel>
      ) : null}
    </div>
  );
}

export default function ApplicationFormFocusCanvas({
  C,
  branding,
  theme,
  focus,
  editable,
  programs,
  orgSlug,
  organizationId,
  readOnly,
  lockSystemFields = false,
  lockApplySlug = false,
  setupHighlight,
  slugError,
  stripePaymentsReady = true,
  onFocusChange,
  onEditableChange,
  onUpdateSchema,
  onDeleteStep,
  sourceForms = [],
  loadedFormIds = new Set(),
  programNameById = new Map(),
  onReuseStep,
  onReuseDialogOpen,
  programEnrollmentChecklist = null,
  onOpenEnrollmentChecklist,
  reviewStage,
}: ApplicationFormFocusCanvasProps) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [reuseDialogOpen, setReuseDialogOpen] = useState(false);
  const [reuseTargetStepId, setReuseTargetStepId] = useState<string | null>(null);
  const key = focusKey(focus);
  const stage = stageOfFocus(focus);
  // Same tokens as the public apply page and ApplicationFormPreview; falls back to the admin tokens.
  // The family's own theme, so the Family view matches the Garden apply form exactly.
  const familyTheme = useMemo(
    () => (branding ? buildParentThemeTokens(branding) : theme),
    [branding, theme],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const previousStage = useRef(stage);
  const pendingStageFocus = useRef(false);

  // New stage: start at the top and move keyboard / screen-reader focus to it.
  // The panel may mount after this effect (AnimatePresence "wait"), so the
  // callback ref below finishes the job when it does.
  useEffect(() => {
    if (previousStage.current === stage) return;
    previousStage.current = stage;
    scrollRef.current?.scrollTo({ top: 0 });
    const node = stageRef.current;
    if (node?.isConnected && node.dataset.stageKey === key) {
      node.focus({ preventScroll: true });
    } else {
      pendingStageFocus.current = true;
    }
  }, [stage, key]);

  const setStageNode = (node: HTMLDivElement | null) => {
    stageRef.current = node;
    if (node && pendingStageFocus.current) {
      pendingStageFocus.current = false;
      node.focus({ preventScroll: true });
    }
  };

  // Fees & agreements is one stage: bring the section a readiness row points at into view.
  useEffect(() => {
    if (focus.kind !== "acknowledgments") return;
    document
      .getElementById("flows-acknowledgments")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus.kind]);

  const step =
    focus.kind === "step" || focus.kind === "field"
      ? editable.schema.sections.find((s) => s.id === focus.stepId)
      : undefined;

  const stepIdx =
    step !== undefined
      ? editable.schema.sections.findIndex((s) => s.id === step.id)
      : -1;

  const field =
    focus.kind === "field" && step
      ? step.fields.find((f) => f.id === focus.fieldId)
      : undefined;

  const updateStep = (stepId: string, patch: Partial<ApplicationSection>) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId ? { ...s, ...patch } : s,
      ),
    }));
  };

  const updateField = (
    stepId: string,
    fieldId: string,
    patch: Partial<ApplicationField>,
  ) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...patch } : f,
              ),
            }
          : s,
      ),
    }));
  };

  const deleteField = (stepId: string, fieldId: string) => {
    if (lockSystemFields && isSystemFieldId(fieldId)) return;
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s,
      ),
    }));
    onFocusChange({ kind: "step", stepId });
  };

  const addField = (stepId: string, field: ApplicationField) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId ? { ...s, fields: [...s.fields, field] } : s,
      ),
    }));
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.kind === "step") {
      onDeleteStep(pendingDelete.stepId);
    } else {
      deleteField(pendingDelete.stepId, pendingDelete.fieldId);
    }
    setPendingDelete(null);
  };

  const confirmCopy =
    pendingDelete?.kind === "step"
      ? {
          title: "Delete step?",
          description: `This removes "${pendingDelete.stepTitle}" and all ${pendingDelete.questionCount} question${pendingDelete.questionCount === 1 ? "" : "s"}. This can't be undone until you save.`,
          confirmLabel: "Delete step",
        }
      : pendingDelete?.kind === "field"
        ? {
            title: "Delete question?",
            description: `Remove "${pendingDelete.fieldLabel}" from this step?`,
            confirmLabel: "Delete question",
          }
        : null;

  const isLockedField =
    field &&
    lockSystemFields &&
    (field.system === true || isSystemFieldId(field.id));

  // Counted against the Steps list the admin sees in the outline.
  const totalSteps = editable.schema.sections.length;

  const canvasBody = (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          ref={setStageNode}
          data-stage-key={key}
          tabIndex={-1}
          className={`mx-auto w-full outline-none ${focus.kind === "review" ? "max-w-[1080px]" : "max-w-[880px]"}`}
          {...canvasTransition}
        >
          {focus.kind === "setup" && (
            <SetupView
              C={C}
              theme={theme}
              editable={editable}
              programs={programs}
              orgSlug={orgSlug}
              readOnly={readOnly}
              lockApplySlug={lockApplySlug}
              setupHighlight={setupHighlight}
              slugError={slugError}
              programEnrollmentChecklist={programEnrollmentChecklist}
              onOpenEnrollmentChecklist={onOpenEnrollmentChecklist}
              onEditableChange={onEditableChange}
            />
          )}

          {(focus.kind === "step" || focus.kind === "field") &&
            step &&
            stepIdx >= 0 && (
              <StepView
                C={C}
                familyTheme={familyTheme}
                theme={theme}
                step={step}
                stepIdx={stepIdx}
                totalSteps={totalSteps}
                readOnly={readOnly}
                lockSystemFields={lockSystemFields}
                selectedFieldId={
                  focus.kind === "field" ? focus.fieldId : null
                }
                onFocusChange={onFocusChange}
                onUpdateStep={(patch) => updateStep(step.id, patch)}
                onUpdateField={(fieldId, patch) => updateField(step.id, fieldId, patch)}
                onRequestDeleteField={(fieldId) => {
                  const target = step.fields.find((entry) => entry.id === fieldId);
                  if (!target || (lockSystemFields && isSystemFieldId(fieldId))) return;
                  setPendingDelete({
                    kind: "field",
                    stepId: step.id,
                    fieldId,
                    fieldLabel: target.label || "Untitled question",
                  });
                }}
                onRequestDeleteStep={() => {
                  if (lockSystemFields && isSystemSection(step)) return;
                  setPendingDelete({
                    kind: "step",
                    stepId: step.id,
                    stepTitle: step.title || `Step ${stepIdx + 1}`,
                    questionCount: step.fields.length,
                  });
                }}
                canReuseStep={sourceForms.length > 0 && Boolean(onReuseStep)}
                onRequestReuseStep={() => {
                  setReuseTargetStepId(step.id);
                  onReuseDialogOpen?.();
                  setReuseDialogOpen(true);
                }}
                onAddField={(newField) => addField(step.id, newField)}
                onReorderFields={(fields) =>
                  updateStep(step.id, { fields })
                }
              />
            )}

          {(focus.kind === "step" || focus.kind === "field") && !step && (
            <div className="w-full space-y-5">
              <BuilderSectionIntro
                C={C}
                theme={theme}
                eyebrow="Questions"
                title="No steps yet"
                subtitle="Add a step to start asking families questions. Each step is one page of the application."
              />
            </div>
          )}

          {(focus.kind === "fee" || focus.kind === "acknowledgments") && (
            <div className="w-full space-y-8">
              <BuilderSectionIntro
                C={C}
                theme={theme}
                eyebrow={theme ? "Fees & agreements" : undefined}
                title="Before families submit"
                subtitle="Decide whether families pay an application fee, and what they must agree to before they can submit."
              />
              <section id="flows-fee" aria-labelledby="flows-fee-title" className="scroll-mt-4 space-y-4">
              <BuilderSectionIntro
                C={C}
                theme={theme}
                title="Application fee"
                subtitle="Decide whether families pay before they can submit."
                titleId="flows-fee-title"
                level="h3"
              />
              <ApplicationFormFeePanel
                C={C}
                feeConfig={editable.feeConfig}
                readOnly={readOnly}
                onChange={(feeConfig) => onEditableChange({ feeConfig })}
                hideHeader
                orgSlug={orgSlug}
                stripePaymentsReady={stripePaymentsReady}
              />
              </section>
              <section
                id="flows-acknowledgments"
                aria-labelledby="flows-acknowledgments-title"
                className="scroll-mt-4 space-y-4 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-8"
              >
              <BuilderSectionIntro
                C={C}
                theme={theme}
                title="Acknowledgments"
                subtitle="Add agreements families must confirm before submitting."
                titleId="flows-acknowledgments-title"
                level="h3"
              />
              <ApplicationFormAcknowledgmentsEditor
                C={C}
                acknowledgments={editable.schema.acknowledgments}
                readOnly={readOnly}
                onChange={(acknowledgments) =>
                  onUpdateSchema((schema) => ({ ...schema, acknowledgments }))
                }
                hideHeader
              />
              </section>
            </div>
          )}

          {focus.kind === "review" && (
            <div className="w-full space-y-5">
              <BuilderSectionIntro
                C={C}
                theme={theme}
                eyebrow={theme ? "Review & publish" : undefined}
                title="Check it over, then share it"
                subtitle="Everything families will see, in one place. Fix anything flagged, preview the form, then publish or save from the top bar."
              />
              {reviewStage}
            </div>
          )}

          {focus.kind === "postSubmit" && (
            <div className="w-full space-y-5">
              <BuilderSectionIntro
                C={C}
                theme={theme}
                eyebrow={theme ? "After submit" : undefined}
                title="Post-submit steps"
                subtitle="Guide families on what to do after they submit."
              />
              <ApplicationFormPostSubmitEditor
                C={C}
                organizationId={organizationId}
                postSubmitConfig={editable.postSubmitConfig}
                readOnly={readOnly}
                onChange={(postSubmitConfig) => onEditableChange({ postSubmitConfig })}
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <>
    {theme ? (
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        style={{ backgroundColor: BUILDER_CANVAS_BG }}
        data-flows-canvas
      >
        {canvasBody}
      </div>
    ) : (
      <div
        className="relative flex flex-1 flex-col overflow-hidden"
        style={{ backgroundColor: C.surface }}
      >
        <div className="flex-1 overflow-y-auto px-5 py-8">
          {canvasBody}
        </div>
      </div>
    )}

      {focus.kind === "field" && step && field && stepIdx >= 0 && (
        <BuilderFieldEditorPanel
          C={C}
          open
          eyebrow={`Step ${stepIdx + 1} · Question`}
          onClose={() => onFocusChange({ kind: "step", stepId: step.id })}
        >
          <ApplicationFormFieldEditor
            C={C}
            field={field}
            readOnly={readOnly || isLockedField}
            onChange={(patch) => updateField(step.id, field.id, patch)}
            onDelete={
              isLockedField
                ? undefined
                : () => {
                    if (lockSystemFields && isSystemFieldId(field.id)) return;
                    setPendingDelete({
                      kind: "field",
                      stepId: step.id,
                      fieldId: field.id,
                      fieldLabel: field.label || "Untitled question",
                    });
                  }
            }
          />
        </BuilderFieldEditorPanel>
      )}

    <ConfirmDialog
      C={C}
      open={pendingDelete !== null}
      title={confirmCopy?.title ?? ""}
      description={confirmCopy?.description ?? ""}
      confirmLabel={confirmCopy?.confirmLabel ?? "Delete"}
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirmDelete}
      onClose={() => setPendingDelete(null)}
    />

    <ReuseApplicationStepDialog
      C={C}
      theme={theme}
      open={reuseDialogOpen}
      sourceForms={sourceForms}
      loadedFormIds={loadedFormIds}
      programNameById={programNameById}
      onClose={() => {
        setReuseDialogOpen(false);
        setReuseTargetStepId(null);
      }}
      onConfirm={(sourceSection) => {
        if (reuseTargetStepId && onReuseStep) {
          onReuseStep(reuseTargetStepId, sourceSection);
        }
        setReuseDialogOpen(false);
        setReuseTargetStepId(null);
      }}
    />
    </>
  );
}
