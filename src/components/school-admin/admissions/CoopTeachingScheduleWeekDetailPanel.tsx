"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import {
  areCoopTeachingScheduleWeeksEqual,
  canAddTeachingAssignedParent,
  formatTeachingScheduleDateRange,
  isCoopTeachingScheduleWeekComplete,
  teachingScheduleStatusChipTone,
  teachingScheduleStatusLabel,
  teachingScheduleWeekDisplayName,
  type CoopTeachingScheduleWeek,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { adminToast } from "@/lib/school-admin/admin-toast";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { BuilderQuestionCard } from "./builder-question-card";

type CoopTeachingScheduleWeekDetailPanelProps = {
  week: CoopTeachingScheduleWeek;
  enrolledFamilies: ReadonlyArray<ProgramCoopFamily>;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  onClose: () => void;
  onSave: (
    week: CoopTeachingScheduleWeek,
    meta: { savedBaseline: CoopTeachingScheduleWeek },
  ) => CoopTeachingScheduleWeek | void | Promise<CoopTeachingScheduleWeek | void>;
  onRemove: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  canRemove: boolean;
};

function controlStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

export default function CoopTeachingScheduleWeekDetailPanel({
  week,
  enrolledFamilies,
  C,
  theme,
  onClose,
  onSave,
  onRemove,
  onDirtyChange,
  canRemove,
}: CoopTeachingScheduleWeekDetailPanelProps) {
  const [draftWeek, setDraftWeek] = useState<CoopTeachingScheduleWeek>(() => ({ ...week }));
  const [savedWeek, setSavedWeek] = useState<CoopTeachingScheduleWeek>(() => ({ ...week }));
  const [prevWeek, setPrevWeek] = useState(week);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instructorFamilyIdDraft, setInstructorFamilyIdDraft] = useState("");
  const [assistantFamilyIdDraft, setAssistantFamilyIdDraft] = useState("");

  if (week !== prevWeek) {
    setPrevWeek(week);
    setDraftWeek({ ...week });
    setSavedWeek({ ...week });
    setInstructorFamilyIdDraft("");
    setAssistantFamilyIdDraft("");
  }

  const isDirty = useMemo(
    () => !areCoopTeachingScheduleWeeksEqual(draftWeek, savedWeek),
    [draftWeek, savedWeek],
  );

  const isComplete = useMemo(
    () => isCoopTeachingScheduleWeekComplete(draftWeek),
    [draftWeek],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateDraft = (patch: Partial<CoopTeachingScheduleWeek>) => {
    setDraftWeek((current) => ({ ...current, ...patch }));
  };

  const familyNameById = useMemo(
    () => new Map(enrolledFamilies.map((family) => [family.familyId, family.familyName])),
    [enrolledFamilies],
  );

  const familyPickerOptions = useMemo(
    () =>
      enrolledFamilies.map((family) => ({
        value: family.familyId,
        label: family.familyName,
      })),
    [enrolledFamilies],
  );

  const addAssignedParent = (role: "instructor" | "assistant") => {
    const draft = role === "instructor" ? instructorFamilyIdDraft : assistantFamilyIdDraft;
    const current =
      role === "instructor" ? draftWeek.instructorFamilyIds : draftWeek.assistantFamilyIds;
    if (!canAddTeachingAssignedParent(current, draft)) return;

    updateDraft(
      role === "instructor"
        ? { instructorFamilyIds: [...draftWeek.instructorFamilyIds, draft] }
        : { assistantFamilyIds: [...draftWeek.assistantFamilyIds, draft] },
    );
    if (role === "instructor") {
      setInstructorFamilyIdDraft("");
    } else {
      setAssistantFamilyIdDraft("");
    }
  };

  const removeAssignedParent = (role: "instructor" | "assistant", familyId: string) => {
    updateDraft(
      role === "instructor"
        ? {
            instructorFamilyIds: draftWeek.instructorFamilyIds.filter((id) => id !== familyId),
          }
        : {
            assistantFamilyIds: draftWeek.assistantFamilyIds.filter((id) => id !== familyId),
          },
    );
  };

  const renderAssignedParentsEditor = (
    role: "instructor" | "assistant",
    question: string,
    helper: string,
    tone: "clay" | "accent",
    familyIds: string[],
    draft: string,
    setDraft: (value: string) => void,
  ) => (
    <BuilderQuestionCard C={C} tone={tone} question={question} helper={helper}>
      <div className="space-y-3">
        {familyIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {familyIds.map((familyId) => {
              const familyName = familyNameById.get(familyId) ?? "Unknown family";
              return (
              <span
                key={familyId}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.bg,
                  color: C.textPrimary,
                }}
              >
                {familyName}
                <button
                  type="button"
                  onClick={() => removeAssignedParent(role, familyId)}
                  className="inline-flex rounded p-0.5 transition-colors hover:opacity-70"
                  style={{ color: C.textTertiary }}
                  aria-label={`Remove ${familyName}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <SchoolAdminSelect
            value={draft}
            onChange={setDraft}
            options={[
              { value: "", label: "Select a family" },
              ...familyPickerOptions.filter((option) => !familyIds.includes(option.value)),
            ]}
            disabled={familyPickerOptions.length === 0}
            ariaLabel={`Select enrolled family for ${role}`}
            C={C}
            className="sm:flex-1"
          />
          <button
            type="button"
            onClick={() => addAssignedParent(role)}
            disabled={!canAddTeachingAssignedParent(familyIds, draft)}
            className="inline-flex shrink-0 items-center justify-center gap-1 px-3 py-2 text-xs font-medium disabled:opacity-50"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
              borderRadius: C.r.md,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </BuilderQuestionCard>
  );

  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    setDiscardDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const persisted = await onSave(draftWeek, { savedBaseline: savedWeek });
      const nextWeek = persisted ?? draftWeek;
      setDraftWeek({ ...nextWeek });
      setSavedWeek({ ...nextWeek });
      adminToast.success("Teaching week saved");
    } catch {
      // Parent surfaces persistence errors.
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    onClose();
  };

  const handleConfirmRemove = () => {
    setRemoveDialogOpen(false);
    onRemove();
  };

  const displayName = teachingScheduleWeekDisplayName(draftWeek);
  const statusLabel = teachingScheduleStatusLabel(draftWeek);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
          onClick={requestClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
          style={{
            backgroundColor: "#F8FAF8",
            borderLeft: "1px solid #E0E8E0",
            boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
            style={{ borderBottom: "1px solid #E0E8E0" }}
          >
            <div className="min-w-0 flex-1">
              <AdminSectionKicker theme={theme}>Teaching week</AdminSectionKicker>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
                  {displayName}
                </AdminDisplayHeading>
                <AdminChip theme={theme} tone={teachingScheduleStatusChipTone(draftWeek)}>
                  {statusLabel}
                </AdminChip>
              </div>
              <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                {formatTeachingScheduleDateRange(draftWeek.startDate, draftWeek.endDate)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AdminButton
                theme={theme}
                variant="danger"
                size="compact"
                onClick={() => setRemoveDialogOpen(true)}
                disabled={!canRemove}
              >
                Remove week
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="soft"
                size="compact"
                onClick={requestClose}
                aria-label="Close"
              >
                Close ×
              </AdminButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-[21px] py-5">
            <div className="space-y-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <BuilderQuestionCard C={C} tone="accent" question="Start date">
                    <SchoolAdminDatePicker
                      id={`teaching-week-start-${draftWeek.id}`}
                      C={C}
                      value={draftWeek.startDate}
                      onChange={(value) => updateDraft({ startDate: value })}
                      maxDate={draftWeek.endDate || schoolAdminDateRangeBounds().maxDate}
                      placeholder="Select start date"
                    />
                  </BuilderQuestionCard>
                </div>
                <div className="min-w-0">
                  <BuilderQuestionCard C={C} tone="accent" question="End date">
                    <SchoolAdminDatePicker
                      id={`teaching-week-end-${draftWeek.id}`}
                      C={C}
                      value={draftWeek.endDate}
                      onChange={(value) => updateDraft({ endDate: value })}
                      minDate={draftWeek.startDate || schoolAdminDateRangeBounds().minDate}
                      placeholder="Select end date"
                    />
                  </BuilderQuestionCard>
                </div>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  {renderAssignedParentsEditor(
                    "instructor",
                    "Parent instructor",
                    "Who is leading this week? Add one or more enrolled families.",
                    "clay",
                    draftWeek.instructorFamilyIds,
                    instructorFamilyIdDraft,
                    setInstructorFamilyIdDraft,
                  )}
                </div>
                <div className="min-w-0">
                  {renderAssignedParentsEditor(
                    "assistant",
                    "Parent assistant",
                    "Optional. Add one or more enrolled families.",
                    "clay",
                    draftWeek.assistantFamilyIds,
                    assistantFamilyIdDraft,
                    setAssistantFamilyIdDraft,
                  )}
                </div>
              </div>

              <BuilderQuestionCard
                C={C}
                tone="info"
                question="Week name"
                helper="e.g. Apple Week"
              >
                <input
                  type="text"
                  value={draftWeek.weekName}
                  onChange={(event) => updateDraft({ weekName: event.target.value })}
                  placeholder="e.g. Apple Week"
                  style={controlStyle(C)}
                />
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="accent"
                question="Seasonal theme"
                helper="What seasonal activities or focus does this week cover?"
              >
                <textarea
                  rows={2}
                  value={draftWeek.seasonalTheme}
                  onChange={(event) => updateDraft({ seasonalTheme: event.target.value })}
                  placeholder="e.g. Apple Picking & Grain Grinding"
                  style={{ ...controlStyle(C), resize: "vertical" }}
                />
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="clay"
                question="Character lesson / good habit"
                helper="The virtue or habit families are practicing this week."
              >
                <textarea
                  rows={3}
                  value={draftWeek.characterLesson}
                  onChange={(event) => updateDraft({ characterLesson: event.target.value })}
                  placeholder="e.g. Appreciation of Nature: Careful harvesting, generosity"
                  style={{ ...controlStyle(C), resize: "vertical" }}
                />
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="info"
                question="Celebration / event"
                helper="Optional. Include date, time, and location if applicable."
              >
                <textarea
                  rows={2}
                  value={draftWeek.celebrationEvent ?? ""}
                  onChange={(event) =>
                    updateDraft({
                      celebrationEvent: event.target.value.trim() ? event.target.value : null,
                    })
                  }
                  placeholder="e.g. Family Gathering Potluck — Sept 11, at 5:30"
                  style={{ ...controlStyle(C), resize: "vertical" }}
                />
              </BuilderQuestionCard>
            </div>
          </div>

          <div
            className="flex flex-shrink-0 justify-end bg-white px-[21px] py-4"
            style={{ borderTop: "1px solid #E0E8E0" }}
          >
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              className="inline-flex items-center gap-1.5"
              onClick={() => void handleSave()}
              disabled={!isDirty || !isComplete || saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save changes
            </AdminButton>
          </div>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirmDiscard}
        onClose={() => setDiscardDialogOpen(false)}
      />

      <ConfirmDialog
        C={C}
        open={removeDialogOpen}
        title="Remove this teaching week?"
        description="This week will be removed from the teaching schedule. This cannot be undone."
        confirmLabel="Remove week"
        variant="destructive"
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveDialogOpen(false)}
      />
    </>
  );
}
