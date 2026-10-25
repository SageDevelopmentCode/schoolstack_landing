"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { EnrollmentFlowProgramSummary } from "@/lib/school-admin/load-enrollment-flows-list-data";
import {
  firstAttentionProgramId,
  programsNeedingAttention,
} from "./enrollment-flow-attention";
import { buildProgramFlowBindings } from "./enrollment-flow-program-bindings";
import type { ProgramFlowBinding } from "./enrollment-flow-program-bindings";
import EnrollmentFlowsFormsTable from "./EnrollmentFlowsFormsTable";
import EnrollmentFlowsProgramTable from "./EnrollmentFlowsProgramTable";
import type { FlowListSelection } from "./enrollment-flow-selection";

type OverviewView = "programs" | "forms";

type EnrollmentFlowsOverviewProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  slug: string;
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  programs: EnrollmentFlowProgramSummary[];
  creating: boolean;
  canCreateApplyForm: boolean;
  canCreateChecklist: boolean;
  onSelect: (selection: FlowListSelection) => void;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
  onCreateApplyForProgram: (programId: string) => void;
  onDuplicateForm: (formId: string) => void;
  onOpenPostSubmit: (applyFormId: string) => void;
  onReviewAttentionProgram?: (programId: string) => void;
};

export default function EnrollmentFlowsOverview({
  C,
  theme,
  slug,
  forms,
  checklists,
  programs,
  creating,
  canCreateApplyForm,
  canCreateChecklist,
  onSelect,
  onCreateApply,
  onCreateChecklist,
  onCreateApplyForProgram,
  onDuplicateForm,
  onOpenPostSubmit,
  onReviewAttentionProgram,
}: EnrollmentFlowsOverviewProps) {
  const [activeView, setActiveView] = useState<OverviewView>("programs");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const bindings = useMemo(
    () => buildProgramFlowBindings(programs, forms, checklists),
    [programs, forms, checklists],
  );

  const attentionBindings = useMemo(
    () => programsNeedingAttention(bindings),
    [bindings],
  );

  const programsPath = schoolAdminPath(slug, "admissions", "programs");
  const formCount = forms.length + checklists.length;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleViewChange = (key: string) => {
    setActiveView(key as OverviewView);
    setSearch("");
  };

  const handleEditFlow = (programId: string, binding: ProgramFlowBinding) => {
    if (binding.applyForm) {
      onSelect({ kind: "apply", id: binding.applyForm.id });
      return;
    }
    onCreateApplyForProgram(programId);
  };

  const handleReviewAttention = () => {
    const programId = firstAttentionProgramId(bindings);
    if (!programId) return;
    if (onReviewAttentionProgram) {
      onReviewAttentionProgram(programId);
      return;
    }
    const binding = bindings.find((row) => row.program.id === programId);
    if (binding) {
      handleEditFlow(programId, binding);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div
        className="border-b px-4 py-6 sm:px-8 lg:px-8"
        style={{ borderColor: theme.line, backgroundColor: "#fff" }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-xl">
            <AdminSectionKicker theme={theme}>Admissions</AdminSectionKicker>
            <AdminDisplayHeading theme={theme} as="h1" size="canvas" className="mt-2">
              Enrollment flows
            </AdminDisplayHeading>
            <p className="mt-3 text-xs leading-[1.9]" style={{ color: theme.muted }}>
              Choose each program&apos;s application and what follows acceptance.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link href={programsPath}>
              <AdminButton theme={theme} variant="outline" size="compact">
                View programs
              </AdminButton>
            </Link>
            <div className="relative" ref={menuRef}>
              <AdminButton
                theme={theme}
                variant="primary"
                size="compact"
                onClick={() => setMenuOpen((open) => !open)}
                disabled={creating}
              >
                <Plus className="h-3.5 w-3.5" />
                New form
                <ChevronDown className="h-3 w-3 opacity-70" />
              </AdminButton>
              {menuOpen ? (
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border py-1 shadow-lg"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <button
                    type="button"
                    disabled={!canCreateApplyForm || creating}
                    onClick={() => {
                      setMenuOpen(false);
                      onCreateApply();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                    style={{ color: C.textPrimary }}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: theme.primary }} />
                    <span className="font-semibold">Apply form</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canCreateChecklist || creating}
                    onClick={() => {
                      setMenuOpen(false);
                      onCreateChecklist();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                    style={{ color: C.textPrimary }}
                  >
                    <ClipboardList
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: theme.primary }}
                    />
                    <span className="font-semibold">Enrollment checklist</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex-1 px-4 py-5 sm:px-8 lg:px-8"
        style={{ backgroundColor: theme.paper }}
      >
        <div className="mx-auto max-w-[1650px] space-y-5">
          {attentionBindings.length > 0 ? (
            <div
              className="flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
              style={{
                backgroundColor: "#EAF4EB",
                borderColor: "#C7DFCB",
                color: "#42694F",
              }}
            >
              <span className="text-[11px] leading-[1.9]">
                <strong>Needs attention:</strong>{" "}
                {attentionBindings.length === 1
                  ? "1 program has an incomplete or unpublished flow."
                  : `${attentionBindings.length} programs have an incomplete or unpublished flow.`}
              </span>
              <AdminTextLink
                theme={theme}
                className="text-[11px] whitespace-nowrap"
                onClick={handleReviewAttention}
              >
                Review →
              </AdminTextLink>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ParentStoryPillNav
              theme={theme}
              ariaLabel="Enrollment flow views"
              activeKey={activeView}
              onChange={handleViewChange}
              items={[
                {
                  key: "programs",
                  label: "By program",
                  suffix: (
                    <span
                      className="text-[9px] font-bold"
                      style={{
                        color: activeView === "programs" ? theme.primary : "#80917E",
                      }}
                    >
                      {programs.length}
                    </span>
                  ),
                },
                {
                  key: "forms",
                  label: "All forms",
                  suffix: (
                    <span
                      className="text-[9px] font-bold"
                      style={{
                        color: activeView === "forms" ? theme.primary : "#80917E",
                      }}
                    >
                      {formCount}
                    </span>
                  ),
                },
              ]}
            />
            <label
              className="flex max-w-[230px] flex-1 items-center gap-2 rounded-[10px] border border-[#DCE4D8] bg-white px-3 py-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 sm:max-w-[230px]"
              style={{ outlineColor: theme.primary }}
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-[#90A18E]" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeView === "programs" ? "Find a program…" : "Find a form…"
                }
                aria-label="Search enrollment flows"
                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
                style={{ color: theme.ink }}
              />
            </label>
          </div>

          {programs.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                Create a program first, then link apply forms and enrollment checklists here.{" "}
                <Link
                  href={programsPath}
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: theme.primary }}
                >
                  Go to Programs
                </Link>
              </p>
            </AdminCard>
          ) : null}

          {activeView === "programs" && programs.length > 0 ? (
            <section id="view-programs" role="tabpanel" aria-labelledby="tab-programs">
              <EnrollmentFlowsProgramTable
                C={C}
                theme={theme}
                bindings={bindings}
                searchQuery={search}
                onSelect={onSelect}
                onEditFlow={handleEditFlow}
                onOpenPostSubmit={onOpenPostSubmit}
              />
            </section>
          ) : null}

          {activeView === "forms" ? (
            <section id="view-forms" role="tabpanel" aria-labelledby="tab-forms">
              <EnrollmentFlowsFormsTable
                C={C}
                theme={theme}
                forms={forms}
                checklists={checklists}
                programs={programs}
                searchQuery={search}
                onSelect={onSelect}
                onDuplicateForm={onDuplicateForm}
                duplicating={creating}
              />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
