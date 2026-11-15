"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronRight, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, G_INPUT, gBtnOutlineSm, gBtnPopSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
  GardenField,
  GardenLoadError,
  GardenNotice,
  GardenSaveBar,
  GardenSelect,
  GardenSteps,
  ROW_INTERACTIVE,
  gBtnDangerSm,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { schoolAdminDateRangeBounds } from "@/components/school-admin/ui/SchoolAdminDatePicker";
import {
  PROGRAM_STATUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  programTypeLabel,
  type Program,
  type ProgramStatus,
  type ProgramType,
} from "@/lib/admissions/programs";
import type { ProgramParentPortalOrgConfig } from "@/lib/admissions/program-parent-portal-governance";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import ProgramParentPortalSettingsCard from "./ProgramParentPortalSettingsCard";
import ProgramCoopCurriculumUploadCard from "./ProgramCoopCurriculumUploadCard";
import ProgramCoopFamiliesCard from "./ProgramCoopFamiliesCard";
import ProgramCoopSupplyListCard from "./ProgramCoopSupplyListCard";
import ProgramCoopTeachingScheduleCard from "./ProgramCoopTeachingScheduleCard";
import { BuilderSectionIntro } from "./builder-question-card";
import { useProgramsModel, type ProgramsModel } from "./programs/useProgramsModel";

type ProgramsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  orgFeatures: OrganizationFeatures;
  slug: string;
  programParentPortalConfig: ProgramParentPortalOrgConfig;
  initialPrograms?: Program[];
  initialSelectedProgramId?: string | null;
  previewMode?: boolean;
};

const STATUS_TONES: Record<ProgramStatus, GChipTone> = {
  draft: "neutral",
  open: "success",
  waitlist: "warning",
  full: "info",
  closed: "alert",
};

function statusLabel(status: ProgramStatus): string {
  return PROGRAM_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function programMeta(program: Program): string {
  const start = formatDate(program.start_date);
  const end = formatDate(program.end_date);
  const parts = [programTypeLabel(program.type)];
  if (start || end) parts.push([start, end].filter(Boolean).join(" – "));
  if (program.capacity != null) parts.push(`${program.capacity} seats`);
  return parts.join(" · ");
}

export default function ProgramsPage({
  organizationId,
  branding,
  orgFeatures,
  slug,
  programParentPortalConfig,
  initialPrograms,
  initialSelectedProgramId,
  previewMode = false,
}: ProgramsPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useProgramsModel({
    organizationId,
    orgFeatures,
    slug,
    programParentPortalConfig,
    initialPrograms,
    initialSelectedProgramId,
    previewMode,
  });

  const count = model.programs.length;
  const subtitle =
    count === 0
      ? "Programs are the enrollment periods families apply to, like a school year or summer session."
      : `${count} program${count === 1 ? "" : "s"} · ${model.openCount} open for enrollment`;

  let content;
  if (model.loading) {
    content = <AdminGardenPageSkeleton label="Loading programs" layout="split" />;
  } else if (model.error && count === 0 && !model.isNew) {
    content = (
      <GardenLoadError
        title="Programs didn't load"
        description={model.error}
        onRetry={() => void model.reload()}
        retrying={model.loading}
      />
    );
  } else if (count === 0 && !model.isNew && !model.editable) {
    content = <ProgramsFirstRun model={model} previewMode={previewMode} />;
  } else {
    content = (
      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <ProgramsList model={model} previewMode={previewMode} />
        <ProgramEditor
          model={model}
          C={C}
          theme={theme}
          branding={branding}
          organizationId={organizationId}
          orgFeatures={orgFeatures}
          slug={slug}
          programParentPortalConfig={programParentPortalConfig}
          previewMode={previewMode}
        />
      </div>
    );
  }

  return (
    <AdminGardenPage
      theme={theme}
      data-testid="admin-programs-page"
      overlays={
        <ConfirmDialog
          C={C}
          open={model.deleteOpen}
          title="Delete program?"
          description="This cannot be undone. Programs linked to applications cannot be deleted."
          confirmLabel="Delete program"
          variant="destructive"
          loading={model.deleting}
          onConfirm={model.handleDelete}
          onClose={() => {
            if (!model.deleting) model.setDeleteOpen(false);
          }}
        />
      }
    >
      <AdminGardenPageHeader
        kicker="Enrollment setup"
        title={
          <>
            Your <span className="text-[var(--sf-clay)]">programs</span>
          </>
        }
        subtitle={subtitle}
        actions={
          count > 0 || model.isNew ? (
            <button
              type="button"
              onClick={model.handleCreate}
              disabled={previewMode || model.isNew}
              className={gBtnOutlineSm}
              data-testid="programs-new"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New program
            </button>
          ) : null
        }
      />
      {content}
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */
/* First run                                                           */
/* ------------------------------------------------------------------ */

function ProgramsFirstRun({ model, previewMode }: { model: ProgramsModel; previewMode: boolean }) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
      <GCard index={1} kicker="Admissions setup" title="Create your first program">
        <p className="m-0 mb-5 max-w-[60ch] text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/75">
          Programs represent enrollment periods like a school year or summer session. You will link each
          application form to one program.
        </p>
        <GardenSteps
          showProgress={false}
          steps={[
            {
              id: "program",
              title: "Create a program",
              description: "Name it, pick the type and set dates and capacity.",
              status: "current",
              detail: (
                <button
                  type="button"
                  onClick={model.handleCreate}
                  disabled={previewMode}
                  className={gBtnPopSm}
                  data-testid="programs-create-first"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  New program
                </button>
              ),
            },
            {
              id: "flow",
              title: "Build an enrollment flow",
              description: "Link an application form to the program on Enrollment Flows.",
              status: "todo",
              href: model.flowsPath,
            },
            {
              id: "publish",
              title: "Publish and share your apply link",
              description: "Families apply from your public apply page.",
              status: "todo",
            },
          ]}
        />
      </GCard>
      <GCard index={2} tone="paper" kicker="Good to know" title="What a program holds">
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/80">
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            Dates, type and an optional seat limit.
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            The application form and enrollment checklist families complete.
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            Its own parent portal settings.
          </li>
        </ul>
      </GCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function ProgramsList({ model, previewMode }: { model: ProgramsModel; previewMode: boolean }) {
  return (
    <GCard
      index={1}
      kicker="Programs"
      title={`${model.programs.length} total`}
      className="lg:sticky lg:top-4"
      bodyClassName="!px-2 sm:!px-3"
    >
      <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Programs">
        {model.isNew ? (
          <li>
            <div
              className={`${ROW_INTERACTIVE} bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/30`}
              aria-current="true"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                  {model.editable?.name.trim() || "New program"}
                </span>
                <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">Not saved yet</span>
              </span>
              <GChip tone="warning">Draft</GChip>
            </div>
          </li>
        ) : null}
        {model.programs.map((program) => {
          const selected = program.id === model.selectedId;
          return (
            <li key={program.id}>
              <button
                type="button"
                onClick={() => model.handleSelect(program.id)}
                aria-current={selected ? "true" : undefined}
                className={`${ROW_INTERACTIVE} ${
                  selected ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/30" : ""
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {program.name}
                  </span>
                  <span className="mt-1 flex min-w-0 items-center gap-1.5">
                    <GChip tone={STATUS_TONES[program.status] ?? "neutral"} className="!px-2 !text-[11px]">
                      {statusLabel(program.status)}
                    </GChip>
                    <span className="min-w-0 truncate text-[12px] font-semibold text-[var(--sf-soft)]">
                      {programMeta(program)}
                    </span>
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
      {!previewMode && !model.isNew ? (
        <div className="mt-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-1 pt-3">
          <button type="button" onClick={model.handleCreate} className={gLinkSm}>
            <Plus className="h-4 w-4" aria-hidden />
            Add a program
          </button>
        </div>
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function ProgramEditor({
  model,
  C,
  theme,
  branding,
  organizationId,
  orgFeatures,
  slug,
  programParentPortalConfig,
  previewMode,
}: {
  model: ProgramsModel;
  C: ReturnType<typeof parentThemeToAdminCompat>;
  theme: ReturnType<typeof buildParentThemeTokens>;
  branding: OrganizationBranding;
  organizationId: string;
  orgFeatures: OrganizationFeatures;
  slug: string;
  programParentPortalConfig: ProgramParentPortalOrgConfig;
  previewMode: boolean;
}) {
  const reduce = useReducedMotion() === true;
  const { editable, selectedProgram, visibleEditorTab, isNew } = model;
  if (!editable) return null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <GCard
        index={2}
        kicker={isNew ? "New program" : selectedProgram ? programTypeLabel(selectedProgram.type) : "Program"}
        title={isNew ? editable.name.trim() || "New program" : selectedProgram?.name ?? "Programs"}
        headingLevel="h2"
        action={
          !isNew && selectedProgram ? (
            <button
              type="button"
              onClick={() => model.setDeleteOpen(true)}
              disabled={previewMode || model.saving || model.deleting}
              className={`${gBtnDangerSm} !px-3 !py-1.5 !text-[12.5px]`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Delete
            </button>
          ) : null
        }
      >
        {!isNew ? (
          <div className="mb-5">
            <TuitionSubTabBar
              theme={theme}
              tabs={model.programEditorTabs}
              activeTab={visibleEditorTab}
              onTabChange={model.setActiveEditorTab}
              ariaLabel="Program editor sections"
              testIdPrefix="program-editor"
            />
          </div>
        ) : null}

        {model.error ? (
          <GardenNotice tone="alert" role="alert" className="mb-4">
            {model.error}
          </GardenNotice>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${model.canvasKey}-${visibleEditorTab}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: PORTAL_EASE }}
            className="flex flex-col gap-4"
            role="tabpanel"
            id={`program-editor-panel-${visibleEditorTab}`}
          >
            {visibleEditorTab === "details" || isNew ? (
              <ProgramDetailsForm model={model} previewMode={previewMode} />
            ) : visibleEditorTab === "portal" ? (
              <ProgramParentPortalSettingsCard
                C={C}
                theme={theme}
                branding={branding}
                organizationId={organizationId}
                programName={editable.name}
                orgFeatures={orgFeatures}
                schoolSlug={slug}
                schoolName={branding.logo.alt || slug}
                portalSlug={selectedProgram?.portal_slug ?? null}
                editor={editable.parentPortalEditor}
                isolationAllowed={model.portalGovernance.isolationAllowed}
                programParentPortalEnabled={programParentPortalConfig.enabled}
                canEditPortalConfig={false}
                documentationHref={`/school/${slug}/admin/documentation`}
                onChange={(parentPortalEditor) => model.updateField("parentPortalEditor", parentPortalEditor)}
              />
            ) : visibleEditorTab === "curriculum" && selectedProgram ? (
              <>
                <BuilderSectionIntro
                  C={C}
                  theme={theme}
                  eyebrow="Co-op curriculum"
                  title="Curriculum guide"
                  subtitle="Upload a PDF for families on the Curriculum tab in this program's parent portal."
                />
                <ProgramCoopCurriculumUploadCard
                  C={C}
                  theme={theme}
                  supabase={model.supabase}
                  organizationId={organizationId}
                  programId={selectedProgram.id}
                  coopModeEnabled={model.coopModeEnabled}
                />
              </>
            ) : visibleEditorTab === "supply_list" && selectedProgram ? (
              <ProgramCoopSupplyListCard
                C={C}
                theme={theme}
                supabase={model.supabase}
                organizationId={organizationId}
                programId={selectedProgram.id}
                coopModeEnabled={model.coopModeEnabled}
              />
            ) : visibleEditorTab === "teaching_schedule" && selectedProgram ? (
              <ProgramCoopTeachingScheduleCard
                C={C}
                theme={theme}
                supabase={model.supabase}
                organizationId={organizationId}
                programId={selectedProgram.id}
                coopModeEnabled={model.coopModeEnabled}
              />
            ) : visibleEditorTab === "families" && selectedProgram ? (
              <ProgramCoopFamiliesCard
                C={C}
                theme={theme}
                schoolSlug={slug}
                supabase={model.supabase}
                organizationId={organizationId}
                programId={selectedProgram.id}
                coopModeEnabled={model.coopModeEnabled}
                onNavigateTab={model.setActiveEditorTab}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </GCard>

      {visibleEditorTab === "details" || isNew ? (
        <GardenSaveBar
          dirty={model.isProgramDirty}
          saving={model.saving}
          savedAt={model.savedAt}
          onSave={() => void model.handleSave()}
          onDiscard={model.discardChanges}
          saveLabel={isNew ? "Create program" : "Save"}
          savingLabel={isNew ? "Creating…" : "Saving…"}
          disabled={previewMode}
          disabledReason={isNew && !editable.name.trim() ? "Add a name to create it" : null}
          data-testid="program-save-bar"
        />
      ) : null}
    </div>
  );
}

function ProgramDetailsForm({ model, previewMode }: { model: ProgramsModel; previewMode: boolean }) {
  const editable = model.editable!;
  const bounds = schoolAdminDateRangeBounds();
  return (
    <>
      <p className="m-0 text-[13.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        Define the enrollment period families apply to. Link it to an application form on Enrollment Flows.
      </p>
      <fieldset className="m-0 grid gap-4 border-0 p-0" disabled={previewMode}>
        <GardenField
          id="program-name"
          label="Program name"
          required
          error={model.fieldErrors.name}
          counter={editable.name.length > 60 ? { value: editable.name.length, max: 80 } : undefined}
        >
          <input
            id="program-name"
            type="text"
            value={editable.name}
            onChange={(event) => model.updateField("name", event.target.value)}
            placeholder="e.g. School Year 2026–27"
            aria-invalid={model.fieldErrors.name ? true : undefined}
            className={gInputClass(model.fieldErrors.name)}
            data-garden-skip
            autoFocus={model.isNew}
          />
        </GardenField>

        <GardenField
          id="program-description"
          label="Description"
          optional
          hint="Shown internally to help your team distinguish programs."
        >
          <textarea
            id="program-description"
            rows={3}
            value={editable.description}
            onChange={(event) => model.updateField("description", event.target.value)}
            placeholder="e.g. Friday enrichment program for K–2 families"
            className={`${G_INPUT} resize-y`}
            data-garden-skip
          />
        </GardenField>

        <div className="grid gap-4 sm:grid-cols-2">
          <GardenField id="program-type" label="Type">
            <GardenSelect
              id="program-type"
              value={editable.type}
              onChange={(value) => model.updateField("type", value as ProgramType)}
              options={PROGRAM_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              aria-label="Program type"
            />
          </GardenField>
          <GardenField
            id="program-status"
            label="Status"
            hint={editable.status === "open" ? "Families can apply." : undefined}
          >
            <GardenSelect
              id="program-status"
              value={editable.status}
              onChange={(value) => model.updateField("status", value as ProgramStatus)}
              options={PROGRAM_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              aria-label="Program status"
            />
          </GardenField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GardenField id="program-start-date" label="Start date" optional>
            <input
              id="program-start-date"
              type="date"
              value={editable.startDate}
              onChange={(event) => model.updateField("startDate", event.target.value)}
              min={bounds.minDate}
              max={editable.endDate || bounds.maxDate}
              className={G_INPUT}
              data-garden-skip
            />
          </GardenField>
          <GardenField id="program-end-date" label="End date" optional>
            <input
              id="program-end-date"
              type="date"
              value={editable.endDate}
              onChange={(event) => model.updateField("endDate", event.target.value)}
              min={editable.startDate || bounds.minDate}
              max={bounds.maxDate}
              className={G_INPUT}
              data-garden-skip
            />
          </GardenField>
        </div>

        <GardenField
          id="program-capacity"
          label="Capacity"
          optional
          hint="Maximum number of enrolled students."
          error={model.fieldErrors.capacity}
        >
          <input
            id="program-capacity"
            type="number"
            min={1}
            inputMode="numeric"
            value={editable.capacity}
            onChange={(event) => model.updateField("capacity", event.target.value)}
            placeholder="Optional"
            aria-invalid={model.fieldErrors.capacity ? true : undefined}
            className={`${gInputClass(model.fieldErrors.capacity)} sm:max-w-[12rem]`}
            data-garden-skip
          />
        </GardenField>
      </fieldset>

      {!model.isNew && model.selectedProgram ? (
        <GardenNotice
          tone="info"
          title="Next step"
          action={
            <Link href={model.flowsPath} className={gLinkSm}>
              Enrollment Flows
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          Link this program to an application form on Enrollment Flows. Updated{" "}
          {new Date(model.selectedProgram.updated_at).toLocaleDateString()}.
        </GardenNotice>
      ) : null}
    </>
  );
}
