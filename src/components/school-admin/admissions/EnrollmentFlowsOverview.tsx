"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GProgress,
  GTabBar,
  G_INPUT,
  gBtnOnAccent,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import {
  ADMIN_GARDEN_CONTAINER_CLASS,
  AdminGardenPageHeader,
  GardenEmptyState,
  GardenNotice,
  ROW_INTERACTIVE,
} from "@/components/school-admin/garden/kit";
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
  onCreateChecklistForProgram: (programId: string) => void;
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
  onCreateChecklistForProgram,
  onDuplicateForm,
  onOpenPostSubmit,
  onReviewAttentionProgram,
}: EnrollmentFlowsOverviewProps) {
  const reduce = useReducedMotion() === true;
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

  const readyCount = bindings.length - attentionBindings.length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto" data-testid="enrollment-flows-overview">
      <div className={ADMIN_GARDEN_CONTAINER_CLASS}>
        <AdminGardenPageHeader
          kicker="Admissions"
          title={
            <>
              Enrollment <span className="text-[var(--sf-clay)]">flows</span>
            </>
          }
          subtitle={
            programs.length > 0
              ? `${readyCount} of ${programs.length} program${programs.length === 1 ? "" : "s"} ready for families · ${formCount} form${formCount === 1 ? "" : "s"}`
              : "Choose each program's application and what follows acceptance."
          }
          actions={
            <>
              <Link href={programsPath} className={gBtnOutlineSm}>
                View programs
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  disabled={creating}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-busy={creating || undefined}
                  className={attentionBindings.length > 0 ? gBtnOutlineSm : gBtnPopSm}
                  data-testid="flows-new-form"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                  {creating ? "Creating…" : "New form"}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1.5 shadow-[0_6px_0_0_rgba(43,36,29,0.08),0_20px_40px_-20px_rgba(43,36,29,0.4)]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canCreateApplyForm || creating}
                      onClick={() => {
                        setMenuOpen(false);
                        onCreateApply();
                      }}
                      className={`${ROW_INTERACTIVE} !py-2.5 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sf-sky)]">
                        <FileText className="h-4 w-4 text-[var(--sf-ink)]/75" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">Apply form</span>
                        <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">What families fill in to apply</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canCreateChecklist || creating}
                      onClick={() => {
                        setMenuOpen(false);
                        onCreateChecklist();
                      }}
                      className={`${ROW_INTERACTIVE} !py-2.5 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sf-mint)]">
                        <ClipboardList className="h-4 w-4 text-[var(--sf-ink)]/75" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">Enrollment checklist</span>
                        <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">What families complete after acceptance</span>
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />

        {programs.length > 0 ? (
          <div className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-3">
            <GProgress
              value={readyCount}
              total={programs.length}
              label="Programs with a complete, published flow"
              done={readyCount === programs.length}
            />
            <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
              {readyCount}/{programs.length} ready
            </span>
          </div>
        ) : null}

        {attentionBindings.length > 0 ? (
          <button
            type="button"
            onClick={handleReviewAttention}
            className="group flex w-full flex-col items-start gap-3 rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-5 py-4 text-left text-white shadow-[0_4px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
            data-testid="flows-needs-attention"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
                Needs attention
              </span>
              <span className="mt-0.5 block text-[16px] font-extrabold leading-snug">
                {attentionBindings.length === 1
                  ? "1 program has an incomplete or unpublished flow."
                  : `${attentionBindings.length} programs have an incomplete or unpublished flow.`}
              </span>
            </span>
            <span className={gBtnOnAccent}>
              Review
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ) : programs.length > 0 ? (
          <GardenNotice tone="success" title="Every program's flow is complete and published." />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <GTabBar
            ariaLabel="Enrollment flow views"
            activeKey={activeView}
            onChange={handleViewChange}
            items={[
              {
                key: "programs",
                label: "By program",
                suffix: <span className="rounded-full bg-[var(--sf-ink)]/10 px-1.5 text-[11px] tabular-nums">{programs.length}</span>,
              },
              {
                key: "forms",
                label: "All forms",
                suffix: <span className="rounded-full bg-[var(--sf-ink)]/10 px-1.5 text-[11px] tabular-nums">{formCount}</span>,
              },
            ]}
          />
          <label className="relative flex w-full items-center sm:max-w-[280px]">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--sf-ink)]/45" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={activeView === "programs" ? "Find a program…" : "Find a form…"}
              aria-label="Search enrollment flows"
              className={`${G_INPUT} !rounded-full !pl-10`}
              data-garden-skip
            />
          </label>
        </div>

        {programs.length === 0 ? (
          <GardenEmptyState
            icon={CalendarDays}
            title="Create a program first"
            description="Create a program first, then link apply forms and enrollment checklists here."
            action={
              <Link href={programsPath} className={gBtnPopSm}>
                Go to Programs
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {activeView === "programs" && programs.length > 0 ? (
            <motion.section
              key="programs"
              id="view-programs"
              role="tabpanel"
              aria-label="By program"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: PORTAL_EASE }}
            >
              <EnrollmentFlowsProgramTable
                C={C}
                theme={theme}
                bindings={bindings}
                searchQuery={search}
                onSelect={onSelect}
                onSetupApplication={onCreateApplyForProgram}
                onSetupChecklist={onCreateChecklistForProgram}
                onOpenPostSubmit={onOpenPostSubmit}
              />
            </motion.section>
          ) : null}

          {activeView === "forms" ? (
            <motion.section
              key="forms"
              id="view-forms"
              role="tabpanel"
              aria-label="All forms"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: PORTAL_EASE }}
            >
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
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
