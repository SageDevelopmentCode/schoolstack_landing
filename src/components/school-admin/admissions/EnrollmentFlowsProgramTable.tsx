"use client";

import type { ReactNode } from "react";
import { Check, ClipboardList, FileText, Info } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { enrollmentFlowStatusChipTone } from "./EnrollmentProgramFlowCard";
import { getStatusLabel } from "./ApplicationFormListBadges";
import EnrollmentFlowStepConnector from "./EnrollmentFlowStepConnector";
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
  onEditFlow: (programId: string, binding: ProgramFlowBinding) => void;
};

function bindingMatchesSearch(binding: ProgramFlowBinding, query: string): boolean {
  if (!query) return true;
  const haystack = [
    binding.program.name,
    binding.applyForm?.title,
    binding.checklist?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
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
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 text-left"
      style={{ color: theme.primary }}
    >
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
    </button>
  );
}

function ApplicationStep({
  C,
  theme,
  applyForm,
  onSelect,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  applyForm?: ApplicationFormVersion;
  onSelect: (selection: FlowListSelection) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p
        className="mb-2 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[#8C9B88] lg:hidden"
      >
        1 · Application
      </p>
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
        <span
          className="flex items-center gap-1.5 text-[11px] leading-relaxed"
          style={{ color: "#A26B22" }}
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          No form selected
        </span>
      )}
    </div>
  );
}

function AfterAcceptanceStep({
  C,
  theme,
  checklist,
  onSelect,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  checklist?: EnrollmentChecklistTemplate;
  onSelect: (selection: FlowListSelection) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p
        className="mb-2 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[#8C9B88] lg:hidden"
      >
        2 · After acceptance
      </p>
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
        <div className="flex gap-2.5" style={{ color: "#526C5A" }}>
          <Check className="mt-0.5 h-[15px] w-[15px] shrink-0 text-[#8AA18A]" />
          <div>
            <strong className="block text-[11px] font-medium leading-relaxed">
              Mark enrolled directly
            </strong>
            <small className="mt-1 block text-[9px] leading-relaxed text-[#8A9A86]">
              In Submissions · No checklist
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowRow({
  C,
  theme,
  binding,
  onSelect,
  onEditFlow,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  binding: ProgramFlowBinding;
  onSelect: (selection: FlowListSelection) => void;
  onEditFlow: (programId: string, binding: ProgramFlowBinding) => void;
}) {
  const { program, applyForm, checklist } = binding;
  const openLabel = formatProgramOpenLabel(program);
  const isOpen = program.status === "open";

  return (
    <article
      className="grid gap-5 border-b border-[#E9EFEA] px-5 py-6 last:border-0 lg:grid-cols-[minmax(180px,1fr)_minmax(420px,2.25fr)_70px] lg:items-center lg:gap-6 lg:px-6"
    >
      <div className="relative min-w-0 pr-14 lg:col-start-1 lg:row-start-1 lg:pr-0">
        <AdminTextLink
          theme={theme}
          className="absolute right-0 top-0 text-[10px] lg:hidden"
          onClick={() => onEditFlow(program.id, binding)}
        >
          Edit flow
        </AdminTextLink>
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

      <div className="hidden min-w-0 lg:col-start-3 lg:row-start-1 lg:flex lg:justify-end">
        <AdminTextLink
          theme={theme}
          className="text-[10px]"
          onClick={() => onEditFlow(program.id, binding)}
        >
          Edit flow
        </AdminTextLink>
      </div>

      <div
        className="min-w-0 border-t border-[#E9EFEA] pt-4 lg:col-start-2 lg:row-start-1 lg:border-0 lg:pt-0"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
          <ApplicationStep
            C={C}
            theme={theme}
            applyForm={applyForm}
            onSelect={onSelect}
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="vertical"
            className="lg:hidden"
          />
          <EnrollmentFlowStepConnector
            theme={theme}
            orientation="horizontal"
            className="hidden lg:flex"
          />
          <AfterAcceptanceStep
            C={C}
            theme={theme}
            checklist={checklist}
            onSelect={onSelect}
          />
        </div>
      </div>
    </article>
  );
}

function StepHeaderLabel({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {children}
    </span>
  );
}

function StepNumberBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="grid h-4 w-4 place-items-center rounded-[5px] bg-[#EDF3E9] text-[8px] text-[#7F987B]"
    >
      {children}
    </span>
  );
}

export default function EnrollmentFlowsProgramTable({
  C,
  theme,
  bindings,
  searchQuery,
  onSelect,
  onEditFlow,
}: EnrollmentFlowsProgramTableProps) {
  const query = searchQuery.toLowerCase().trim();
  const filtered = bindings.filter((binding) => bindingMatchesSearch(binding, query));

  return (
    <AdminCard theme={theme} padding="none" className="overflow-hidden shadow-[0_3px_10px_rgba(50,72,61,0.035)]">
      <div
        className="hidden border-b px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#8A9786] lg:grid lg:grid-cols-[minmax(180px,1fr)_minmax(420px,2.25fr)_70px] lg:gap-6"
        style={{ backgroundColor: "#FCFDFB", borderColor: theme.line }}
        aria-hidden
      >
        <span>Program</span>
        <div className="flex items-center justify-between gap-3 px-0">
          <StepHeaderLabel>
            <StepNumberBadge>1</StepNumberBadge>
            Application
          </StepHeaderLabel>
          <span className="w-8 shrink-0" />
          <StepHeaderLabel>
            <StepNumberBadge>2</StepNumberBadge>
            After acceptance
          </StepHeaderLabel>
        </div>
        <span />
      </div>

      {filtered.length === 0 ? (
        <p className="px-6 py-8 text-center text-xs leading-relaxed" style={{ color: theme.muted }}>
          No matching programs.
        </p>
      ) : (
        filtered.map((binding) => (
          <FlowRow
            key={binding.program.id}
            C={C}
            theme={theme}
            binding={binding}
            onSelect={onSelect}
            onEditFlow={onEditFlow}
          />
        ))
      )}
    </AdminCard>
  );
}
