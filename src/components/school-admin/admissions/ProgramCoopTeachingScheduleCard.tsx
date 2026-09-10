"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  computeTeachingScheduleSummary,
  DEMO_COOP_TEACHING_SCHEDULE,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  newCoopTeachingScheduleWeek,
  sortTeachingScheduleWeeks,
  teachingScheduleEmptyCell,
  teachingScheduleRowStyle,
  teachingScheduleStatusChipTone,
  teachingScheduleStatusLabel,
  teachingScheduleWeekChipTone,
  type CoopTeachingScheduleWeek,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CoopTeachingScheduleWeekDetailPanel from "./CoopTeachingScheduleWeekDetailPanel";
import { BuilderQuestionCard, BuilderSectionIntro } from "./builder-question-card";

type ProgramCoopTeachingScheduleCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  coopModeEnabled: boolean;
};

const TABLE_HEADINGS = [
  "Date range",
  "Parent instructor",
  "Parent assistant",
  "Week name",
  "Seasonal theme",
  "Character lesson",
  "Celebration / event",
  "Status",
] as const;

export default function ProgramCoopTeachingScheduleCard({
  C,
  theme,
  coopModeEnabled,
}: ProgramCoopTeachingScheduleCardProps) {
  const [weeks, setWeeks] = useState<CoopTeachingScheduleWeek[]>(() =>
    sortTeachingScheduleWeeks(DEMO_COOP_TEACHING_SCHEDULE),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);
  const selectedWeek = useMemo(
    () => weeks.find((week) => week.id === selectedId) ?? null,
    [weeks, selectedId],
  );

  const saveWeek = async (saved: CoopTeachingScheduleWeek) => {
    setWeeks((current) =>
      sortTeachingScheduleWeeks(
        current.map((week) => (week.id === saved.id ? saved : week)),
      ),
    );
  };

  const removeWeek = (id: string) => {
    setWeeks((current) => current.filter((week) => week.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    setPanelDirty(false);
  };

  const addWeek = () => {
    const next = newCoopTeachingScheduleWeek();
    setWeeks((current) => sortTeachingScheduleWeeks([...current, next]));
    setSelectedId(next.id);
    setPanelDirty(false);
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
          onClick={addWeek}
        >
          <Plus className="h-4 w-4" />
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

        <AdminCard theme={theme} padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1160px] w-full border-collapse text-left">
              <thead style={{ backgroundColor: "#FBFCFB" }}>
                <tr>
                  {TABLE_HEADINGS.map((heading) => (
                    <th
                      key={heading}
                      className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
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
                {weeks.map((week) => {
                  const isHovered = week.id === hoveredId;
                  const isSelected = week.id === selectedId;
                  const isPast = isTeachingWeekPast(week);
                  const hasEvent = Boolean(week.celebrationEvent?.trim());
                  const rowStyle = teachingScheduleRowStyle(C, {
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
                      style={{
                        ...rowStyle,
                        borderTop: "1px solid #EDF1ED",
                      }}
                    >
                      <td className="whitespace-nowrap px-[15px] py-3" style={{ opacity: textOpacity }}>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: isPast ? theme.muted : theme.ink }}
                        >
                          {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
                        </div>
                      </td>
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {week.parentInstructor}
                      </td>
                      <td
                        className="px-[15px] py-3 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {teachingScheduleEmptyCell(week.parentAssistant)}
                      </td>
                      <td className="px-[15px] py-3" style={{ opacity: textOpacity }}>
                        <AdminChip theme={theme} tone={teachingScheduleWeekChipTone(week)}>
                          {week.weekName}
                        </AdminChip>
                      </td>
                      <td
                        className="max-w-[200px] px-[15px] py-3 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {week.seasonalTheme}
                      </td>
                      <td
                        className="max-w-[220px] px-[15px] py-3 text-xs"
                        style={{ color: "#607078", opacity: textOpacity }}
                      >
                        {week.characterLesson}
                      </td>
                      <td
                        className="max-w-[220px] px-[15px] py-3 text-xs"
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
                      <td className="px-[15px] py-3" style={{ opacity: textOpacity }}>
                        <AdminChip theme={theme} tone={teachingScheduleStatusChipTone(week)}>
                          {teachingScheduleStatusLabel(week)}
                        </AdminChip>
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </AdminCard>

        <button
          type="button"
          onClick={addWeek}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-4 text-sm font-medium transition-colors"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            backgroundColor: C.bg,
            color: C.accent,
          }}
        >
          <Plus className="h-4 w-4" />
          Add teaching week
        </button>
      </div>

      <AnimatePresence>
        {selectedWeek ? (
          <CoopTeachingScheduleWeekDetailPanel
            week={selectedWeek}
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
            onRemove={() => removeWeek(selectedWeek.id)}
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
