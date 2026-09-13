"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CoopTeachingScheduleFilterBar from "@/components/admissions/CoopTeachingScheduleFilterBar";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  computeTeachingScheduleSummary,
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  sortTeachingScheduleWeeks,
  teachingScheduleRowSurfaceStyle,
  teachingScheduleWeekChipTone,
  type CoopTeachingScheduleWeek,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { listProgramCoopEnrolledFamilies } from "@/lib/admissions/program-coop-family-assignments";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import {
  deleteProgramCoopTeachingScheduleWeek,
  insertProgramCoopTeachingScheduleWeek,
  listProgramCoopTeachingSchedule,
  saveProgramCoopTeachingScheduleWeekAdmin,
} from "@/lib/admissions/program-coop-teaching-schedule-storage";
import { ProgramCoopStorageConflictError } from "@/lib/admissions/program-coop-storage-errors";
import {
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  filterCoopTeachingScheduleWeeks,
  type CoopTeachingScheduleFilters,
} from "@/lib/admissions/program-coop-teaching-schedule-filters";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CoopTeachingScheduleWeekDetailPanel from "./CoopTeachingScheduleWeekDetailPanel";
import { BuilderQuestionCard, BuilderSectionIntro } from "./builder-question-card";

type ProgramCoopTeachingScheduleCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  programId: string;
  coopModeEnabled: boolean;
};

const TABLE_HEADINGS = [
  "Week",
  "Parent instructor",
  "Parent assistant",
  "Seasonal theme",
  "Character lesson",
  "Celebration / event",
] as const;

export default function ProgramCoopTeachingScheduleCard({
  C,
  theme,
  supabase,
  organizationId,
  programId,
  coopModeEnabled,
}: ProgramCoopTeachingScheduleCardProps) {
  const [weeks, setWeeks] = useState<CoopTeachingScheduleWeek[]>([]);
  const [enrolledFamilies, setEnrolledFamilies] = useState<ProgramCoopFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWeek, setAddingWeek] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CoopTeachingScheduleFilters>(
    DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  );
  const [prevProgramId, setPrevProgramId] = useState(programId);
  const loadGenerationRef = useRef(0);

  if (programId !== prevProgramId) {
    setPrevProgramId(programId);
    setSelectedId(null);
    setPanelDirty(false);
    setWeeks([]);
    setEnrolledFamilies([]);
  }

  const scheduleContext = useMemo(
    () => ({ organizationId, programId }),
    [organizationId, programId],
  );

  const loadSchedule = useCallback(async () => {
    const generation = ++loadGenerationRef.current;
    const requestedProgramId = programId;
    setLoading(true);
    try {
      const [result, families] = await Promise.all([
        listProgramCoopTeachingSchedule(supabase, requestedProgramId),
        listProgramCoopEnrolledFamilies(supabase, organizationId, requestedProgramId),
      ]);
      if (generation !== loadGenerationRef.current) return;
      setWeeks(sortTeachingScheduleWeeks(result));
      setEnrolledFamilies(families);
    } catch (err) {
      if (generation !== loadGenerationRef.current) return;
      setWeeks([]);
      setEnrolledFamilies([]);
      adminToast.error(formatActionError(err, "Failed to load teaching schedule."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_schedule.load",
        error: "",
      }, err);
    } finally {
      if (generation === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [organizationId, programId, supabase]);

  useEffect(() => {
    if (!coopModeEnabled) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => {
      void loadSchedule();
    });
  }, [coopModeEnabled, loadSchedule]);

  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);
  const familyNameMap = useMemo(
    () => new Map(enrolledFamilies.map((family) => [family.familyId, family.familyName])),
    [enrolledFamilies],
  );
  const filteredWeeks = useMemo(
    () => filterCoopTeachingScheduleWeeks(weeks, filters, { variant: "admin" }),
    [filters, weeks],
  );
  const selectedWeek = useMemo(
    () => weeks.find((week) => week.id === selectedId) ?? null,
    [weeks, selectedId],
  );

  const saveWeek = async (
    saved: CoopTeachingScheduleWeek,
    meta: { savedBaseline: CoopTeachingScheduleWeek },
  ) => {
    try {
      const persisted = await saveProgramCoopTeachingScheduleWeekAdmin(
        supabase,
        scheduleContext,
        {
          draft: saved,
          savedBaseline: meta.savedBaseline,
        },
      );
      setWeeks((current) =>
        sortTeachingScheduleWeeks(
          current.map((week) => (week.id === persisted.id ? persisted : week)),
        ),
      );
      return persisted;
    } catch (err) {
      if (err instanceof ProgramCoopStorageConflictError) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_schedule.save",
        error: "",
      }, err);
        adminToast.error(err.message);
        await loadSchedule();
      } else {
        adminToast.error(formatActionError(err, "Failed to save teaching week."));
      }
      throw err;
    }
  };

  const removeWeek = async (id: string) => {
    try {
      await deleteProgramCoopTeachingScheduleWeek(supabase, id);
      setWeeks((current) => current.filter((week) => week.id !== id));
      setSelectedId((current) => (current === id ? null : current));
      setPanelDirty(false);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove teaching week."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_schedule.remove_week",
        error: "",
      }, err);
      throw err;
    }
  };

  const addWeek = async () => {
    if (addingWeek) return;
    setAddingWeek(true);
    try {
      const nextWeek = await insertProgramCoopTeachingScheduleWeek(supabase, scheduleContext);
      setWeeks((current) => sortTeachingScheduleWeeks([...current, nextWeek]));
      setSelectedId(nextWeek.id);
      setPanelDirty(false);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add teaching week."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_schedule.add_week",
        error: "",
      }, err);
    } finally {
      setAddingWeek(false);
    }
  };

  const requestSelectWeek = (id: string) => {
    if (selectedId === id) {
      if (panelDirty) {
        setPendingSelectId(null);
        setDiscardDialogOpen(true);
        return;
      }
      setSelectedId(null);
      return;
    }

    if (selectedId !== null && panelDirty) {
      setPendingSelectId(id);
      setDiscardDialogOpen(true);
      return;
    }

    setSelectedId(id);
  };

  const handleConfirmDiscardSelection = () => {
    if (pendingSelectId !== null) {
      setSelectedId(pendingSelectId);
      setPanelDirty(false);
      setPendingSelectId(null);
    } else {
      setSelectedId(null);
      setPanelDirty(false);
    }
    setDiscardDialogOpen(false);
  };

  const handleCancelDiscardSelection = () => {
    setPendingSelectId(null);
    setDiscardDialogOpen(false);
  };

  const sectionHeader = (
    <div className="flex items-start justify-between gap-4">
      <BuilderSectionIntro
        C={C}
        theme={theme}
        eyebrow="Co-op teaching schedule"
        title="Teaching schedule"
        subtitle="Manage the teaching schedule for this co-op program."
      />
      {coopModeEnabled ? (
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          className="shrink-0"
          onClick={() => void addWeek()}
          disabled={addingWeek || loading}
        >
          {addingWeek ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add teaching week
        </AdminButton>
      ) : null}
    </div>
  );

  if (!coopModeEnabled) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="Co-op teaching schedule"
          helper="Enable co-op mode in portal settings (configured by MudKitchen) to manage the teaching schedule for families."
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Co-op mode is not enabled for this program.
          </p>
        </BuilderQuestionCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <div
          className="flex items-center justify-center gap-2 rounded-md border px-4 py-12 text-sm"
          style={{ borderColor: C.border, color: C.textSecondary }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading teaching schedule…
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sectionHeader}

        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3">
          <AdminMetricCard
            theme={theme}
            value={String(summary.weekCount)}
            label="Teaching weeks"
            accent="forest"
          />
          <AdminMetricCard
            theme={theme}
            value={summary.nextWeekName}
            label="Upcoming week"
            accent="sky"
          />
          <AdminMetricCard
            theme={theme}
            value={String(summary.completedCount)}
            label="Completed weeks"
            accent="gold"
          />
        </div>

        <CoopTeachingScheduleFilterBar
          variant="admin"
          filters={filters}
          onChange={setFilters}
          theme={theme}
          C={C}
          resultCount={filteredWeeks.length}
          totalCount={weeks.length}
        />

        <div className="overflow-x-auto">
          {filteredWeeks.length === 0 ? (
            <p className="px-1 py-8 text-sm" style={{ color: C.textSecondary }}>
              No teaching weeks match the current filters.
            </p>
          ) : (
            <table
              className="min-w-[860px] w-full border-separate text-left"
              style={{ borderSpacing: "0 8px" }}
            >
              <thead>
                <tr>
                  {TABLE_HEADINGS.map((heading) => (
                    <th
                      key={heading}
                      className="px-[10px] py-2 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                      style={{ color: "#8B9699" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {filteredWeeks.map((week) => {
                  const isHovered = week.id === hoveredId;
                  const isSelected = week.id === selectedId;
                  const isPast = isTeachingWeekPast(week);
                  const hasEvent = Boolean(week.celebrationEvent?.trim());
                  const surfaceStyle = teachingScheduleRowSurfaceStyle({
                    variant: "admin",
                    C,
                    isPast,
                    isSelected,
                    isHovered,
                  });
                  const textOpacity = isPast && !isSelected ? 0.82 : 1;

                  return (
                    <tr
                      key={week.id}
                      onClick={() => requestSelectWeek(week.id)}
                      onMouseEnter={() => setHoveredId(week.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="cursor-pointer transition-colors"
                      style={surfaceStyle}
                    >
                      <td className="min-w-[160px] px-[10px] py-2.5" style={{ opacity: textOpacity }}>
                        <AdminChip theme={theme} tone={teachingScheduleWeekChipTone(week)}>
                          {week.weekName.trim() || "New teaching week"}
                        </AdminChip>
                        <div
                          className="mt-1 text-xs font-semibold"
                          style={{ color: isPast ? theme.muted : theme.ink }}
                        >
                          {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
                        </div>
                      </td>
                      <td
                        className="px-[10px] py-2.5 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {formatTeachingAssignedParents(week.instructorFamilyIds, familyNameMap)}
                      </td>
                      <td
                        className="px-[10px] py-2.5 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {formatTeachingAssignedParents(week.assistantFamilyIds, familyNameMap)}
                      </td>
                      <td
                        className="px-[10px] py-2.5 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {week.seasonalTheme}
                      </td>
                      <td
                        className="px-[10px] py-2.5 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {week.characterLesson}
                      </td>
                      <td
                        className="px-[10px] py-2.5 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {hasEvent ? (
                          <span className="flex items-start gap-1.5">
                            <CalendarDays
                              className="mt-0.5 h-3.5 w-3.5 shrink-0"
                              style={{ color: C.accent }}
                              aria-hidden="true"
                            />
                            <span>{week.celebrationEvent}</span>
                          </span>
                        ) : (
                          <span style={{ color: C.textTertiary }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          )}
        </div>

        <button
          type="button"
          onClick={() => void addWeek()}
          disabled={addingWeek}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-4 text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            backgroundColor: C.bg,
            color: C.accent,
          }}
        >
          {addingWeek ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add teaching week
        </button>
      </div>

      <AnimatePresence>
        {selectedWeek ? (
          <CoopTeachingScheduleWeekDetailPanel
            week={selectedWeek}
            enrolledFamilies={enrolledFamilies}
            C={C}
            theme={theme}
            onClose={() => {
              if (panelDirty) {
                setPendingSelectId(null);
                setDiscardDialogOpen(true);
                return;
              }
              setSelectedId(null);
              setPanelDirty(false);
            }}
            onSave={saveWeek}
            onDirtyChange={setPanelDirty}
            onRemove={() => void removeWeek(selectedWeek.id)}
            canRemove={weeks.length > 1}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you switch weeks or close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirmDiscardSelection}
        onClose={handleCancelDiscardSelection}
      />
    </>
  );
}
