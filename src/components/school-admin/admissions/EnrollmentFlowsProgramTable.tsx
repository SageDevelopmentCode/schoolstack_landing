"use client";

import type { ReactNode } from "react";
import { Check, ClipboardList, FileText, Info, ListTodo } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { enrollmentFlowStatusChipTone } from "./EnrollmentProgramFlowCard";
import { getStatusLabel } from "./ApplicationFormListBadges";
import EnrollmentFlowStepConnector from "./EnrollmentFlowStepConnector";
import {
  getPostSubmitActionLabels,
  getEnabledPostSubmitActions,
} from "./enrollment-flow-post-submit-overview";
import type { ProgramFlowBinding } from "./enrollment-flow-program-bindings";
import {
  formatProgramMetaLine,
  formatProgramOpenLabel,
} from "./enrollment-flow-program-meta";
import type { FlowListSelection } from "./enrollment-flow-selection";

type EnrollmentFlowsProgramTableProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  bindings: ProgramFlowBinding[];
  searchQuery: string;
  onSelect: (selection: FlowListSelection) => void;
  onSetupApplication: (programId: string) => void;
  onSetupChecklist: (programId: string) => void;
  onOpenPostSubmit: (applyFormId: string) => void;
};

const FLOW_STEP_TILE_CLASS =
  "flex w-full cursor-pointer items-start gap-2.5 rounded-[11px] border border-[#E9EFEA] px-3 py-2.5 text-left transition-colors hover:border-[#E5EDE6] hover:bg-[#F3F8F4]";

function bindingMatchesSearch(binding: ProgramFlowBinding, query: string): boolean {
  if (!query) return true;
  const postSubmitLabels =
    binding.applyForm ? getPostSubmitActionLabels(binding.applyForm) : [];
  const haystack = [
    binding.program.name,
    binding.applyForm?.title,
    binding.checklist?.name,
    ...postSubmitLabels,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function StepMobileLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[#8C9B88] lg:hidden">
      {children}
    </p>
  );
}

function StepDesktopLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <span className="mb-2 hidden items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#8A9786] lg:flex">
      <span
        className="grid h-4 w-4 place-items-center rounded-[5px] bg-[#EDF3E9] text-[8px] text-[#7F987B]"
      >
        {number}
      </span>
      {children}
    </span>
  );
}

function FlowStepTile({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`${FLOW_STEP_TILE_CLASS} ${className}`}>
      {children}
    </button>
  );
}

function FormLinkButton({
  theme,
  C,
  title,
  status,
  variant,
  onClick,
}: {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  title: string;
  status: ApplicationFormVersion["status"] | EnrollmentChecklistTemplate["status"];
  variant: "apply" | "checklist";
  onClick: () => void;
}) {
  const Icon = variant === "apply" ? FileText : ClipboardList;
  const tileBg = variant === "checklist" ? "#E9F4F7" : "#EAF2EB";
  const tileColor = variant === "checklist" ? "#39788D" : theme.primary;

  return (
    <FlowStepTile onClick={onClick}>
      <span
        className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
        style={{ backgroundColor: tileBg, color: tileColor }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <strong
          className="block text-[11px] font-semibold leading-relaxed"
          style={{ color: C.textPrimary }}
        >
          {title}
        </strong>
        <AdminChip
          theme={theme}
          tone={enrollmentFlowStatusChipTone(status)}
          className="mt-1.5"
        >
          {getStatusLabel(status)}
        </AdminChip>
      </span>
    </FlowStepTile>
  );
}

function ApplicationStep({
  C,
  theme,
  programId,
  applyForm,
  onSelect,
  onSetupApplication,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  programId: string;
  applyForm?: ApplicationFormVersion;
  onSelect: (selection: FlowListSelection) => void;
  onSetupApplication: (programId: string) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <StepMobileLabel>1 · Application</StepMobileLabel>
      <StepDesktopLabel number="1">Application</StepDesktopLabel>
      {applyForm ? (
        <FormLinkButton
          theme={theme}
          C={C}
          title={applyForm.title || "Untitled form"}
          status={applyForm.status}
          variant="apply"
          onClick={() => onSelect({ kind: "apply", id: applyForm.id })}
        />
      ) : (
        <FlowStepTile onClick={() => onSetupApplication(programId)}>
          <span
            className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: "#FFF4E8", color: "#A26B22" }}
          >
            <Info className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <strong
              className="block text-[11px] font-semibold leading-relaxed"
              style={{ color: "#A26B22" }}
            >
              No form selected
            </strong>
            <span className="mt-1 block text-[9px] leading-relaxed" style={{ color: theme.muted }}>
              Set up application
            </span>
          </span>
        </FlowStepTile>
      )}
    </div>
  );
}

function PostSubmitStep({
  C,
  theme,
  programId,
  applyForm,
  onSetupApplication,
  onOpenPostSubmit,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  programId: string;
  applyForm?: ApplicationFormVersion;
  onSetupApplication: (programId: string) => void;
  onOpenPostSubmit: (applyFormId: string) => void;
}) {
  const labels = applyForm ? getPostSubmitActionLabels(applyForm) : [];
  const enabledCount = applyForm ? getEnabledPostSubmitActions(applyForm).length : 0;

  return (
    <div className="min-w-0 flex-1">
      <StepMobileLabel>2 · Post-submit steps</StepMobileLabel>
      <StepDesktopLabel number="2">Post-submit steps</StepDesktopLabel>
      {!applyForm ? (
        <FlowStepTile onClick={() => onSetupApplication(programId)}>
          <span
            className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: "#F3F5F4", color: C.textTertiary }}
          >
            <ListTodo className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <strong
              className="block text-[11px] font-semibold leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              Set up application first
            </strong>
            <span className="mt-1 block text-[9px] leading-relaxed" style={{ color: C.textTertiary }}>
              Post-submit steps follow your application form
            </span>
          </span>
        </FlowStepTile>
      ) : enabledCount === 0 ? (
        <FlowStepTile onClick={() => onOpenPostSubmit(applyForm.id)}>
          <span
            className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: "#FFF8ED", color: "#8A7355" }}
          >
            <ListTodo className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <strong
              className="block text-[11px] font-semibold leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              None configured
            </strong>
            <span className="mt-1 block text-[9px] leading-relaxed" style={{ color: C.textTertiary }}>
              Add post-submit steps
            </span>
          </span>
        </FlowStepTile>
      ) : (
        <FlowStepTile onClick={() => onOpenPostSubmit(applyForm.id)}>
          <span
            className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: "#FFF8ED", color: "#8A7355" }}
          >
            <ListTodo className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            {labels.slice(0, 2).map((label) => (
              <strong
                key={label}
                className="block text-[11px] font-semibold leading-relaxed"
                style={{ color: C.textPrimary }}
              >
                {label}
              </strong>
            ))}
            {labels.length > 2 ? (
              <span className="mt-1 block text-[9px]" style={{ color: theme.muted }}>
                + {labels.length - 2} more
              </span>
            ) : null}
            <AdminChip theme={theme} tone="info" className="mt-1.5">
              {enabledCount} {enabledCount === 1 ? "step" : "steps"}
            </AdminChip>
          </span>
        </FlowStepTile>
      )}
    </div>
  );
}

function AfterAcceptanceStep({
  C,
  theme,
  programId,
  checklist,
  onSelect,
  onSetupChecklist,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  programId: string;
  checklist?: EnrollmentChecklistTemplate;
  onSelect: (selection: FlowListSelection) => void;
  onSetupChecklist: (programId: string) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <StepMobileLabel>3 · After acceptance</StepMobileLabel>
      <StepDesktopLabel number="3">After acceptance</StepDesktopLabel>
      {checklist ? (
        <FormLinkButton
          theme={theme}
          C={C}
          title={checklist.name || "Enrollment checklist"}
          status={checklist.status}
          variant="checklist"
          onClick={() => onSelect({ kind: "checklist", id: checklist.id })}
        />
      ) : (
        <FlowStepTile onClick={() => onSetupChecklist(programId)}>
          <span
            className="mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: "#EAF2EB", color: "#8AA18A" }}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <strong
              className="block text-[11px] font-semibold leading-relaxed"
              style={{ color: C.textPrimary }}
            >
              Mark enrolled directly
            </strong>
            <span className="mt-1 block text-[9px] leading-relaxed" style={{ color: "#8A9A86" }}>
              In Submissions · No checklist
            </span>
          </span>
        </FlowStepTile>
      )}
    </div>
  );
}

function FlowRow({
  C,
  theme,
  binding,
  onSelect,
  onSetupApplication,
  onSetupChecklist,
  onOpenPostSubmit,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  binding: ProgramFlowBinding;
  onSelect: (selection: FlowListSelection) => void;
  onSetupApplication: (programId: string) => void;
  onSetupChecklist: (programId: string) => void;
  onOpenPostSubmit: (applyFormId: string) => void;
}) {
  const { program, applyForm, checklist } = binding;
  const openLabel = formatProgramOpenLabel(program);
  const isOpen = program.status === "open";

  return (
    <article>
      <div className="min-w-0">
        <AdminDisplayHeading
          theme={theme}
          as="h2"
          size="section"
          className="text-xl leading-tight tracking-[-0.025em] lg:text-[21px]"
        >
          {program.name}
        </AdminDisplayHeading>
        <p className="mt-2 text-[10px] leading-relaxed" style={{ color: theme.muted }}>
          {formatProgramMetaLine(program)}
        </p>
        <div
          className="mt-2 flex items-center gap-1.5 text-[9px]"
          style={{ color: "#7F977E" }}
        >
          <span
            className="h-1 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: isOpen ? "#85AF8F" : "#B0B8B0" }}
            aria-hidden
          />
          {openLabel}
        </div>
      </div>

      <div className="mt-5 border-t border-[#E9EFEA] pt-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-2">
          <ApplicationStep
            C={C}
            theme={theme}
            programId={program.id}
            applyForm={applyForm}
            onSelect={onSelect}
            onSetupApplication={onSetupApplication}
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="vertical"
            className="lg:hidden"
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="horizontal"
            className="hidden shrink-0 self-center lg:flex"
          />
          <PostSubmitStep
            C={C}
            theme={theme}
            programId={program.id}
            applyForm={applyForm}
            onSetupApplication={onSetupApplication}
            onOpenPostSubmit={onOpenPostSubmit}
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="vertical"
            className="lg:hidden"
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="horizontal"
            className="hidden shrink-0 self-center lg:flex"
          />
          <AfterAcceptanceStep
            C={C}
            theme={theme}
            programId={program.id}
            checklist={checklist}
            onSelect={onSelect}
            onSetupChecklist={onSetupChecklist}
          />
        </div>
      </div>
    </article>
  );
}

export default function EnrollmentFlowsProgramTable({
  C,
  theme,
  bindings,
  searchQuery,
  onSelect,
  onSetupApplication,
  onSetupChecklist,
  onOpenPostSubmit,
}: EnrollmentFlowsProgramTableProps) {
  const query = searchQuery.toLowerCase().trim();
  const filtered = bindings.filter((binding) => bindingMatchesSearch(binding, query));

  return (
    <div className="space-y-4">
      {filtered.length === 0 ? (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-center text-xs leading-relaxed" style={{ color: theme.muted }}>
            No matching programs.
          </p>
        </AdminCard>
      ) : (
        filtered.map((binding) => (
          <AdminCard key={binding.program.id} theme={theme} padding="canvas">
            <FlowRow
              C={C}
              theme={theme}
              binding={binding}
              onSelect={onSelect}
              onSetupApplication={onSetupApplication}
              onSetupChecklist={onSetupChecklist}
              onOpenPostSubmit={onOpenPostSubmit}
            />
          </AdminCard>
        ))
      )}
    </div>
  );
}
