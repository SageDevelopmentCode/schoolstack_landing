"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  areCoopTeachingScheduleWeeksEqual,
  formatTeachingScheduleDateRange,
  teachingScheduleStatusChipTone,
  teachingScheduleStatusLabel,
  teachingScheduleWeekDisplayName,
  type CoopTeachingScheduleWeek,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
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
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  onClose: () => void;
  onSave: (week: CoopTeachingScheduleWeek) => void | Promise<void>;
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
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftWeek({ ...week });
    setSavedWeek({ ...week });
  }, [week]);

  const isDirty = useMemo(
    () => !areCoopTeachingScheduleWeeksEqual(draftWeek, savedWeek),
    [draftWeek, savedWeek],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateDraft = (patch: Partial<CoopTeachingScheduleWeek>) => {
    setDraftWeek((current) => ({ ...current, ...patch }));
  };

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
      await onSave(draftWeek);
      setSavedWeek({ ...draftWeek });
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
                  <BuilderQuestionCard
                    C={C}
                    tone="clay"
                    question="Parent instructor"
                    helper="Who is leading this week?"
                  >
                    <input
                      type="text"
                      value={draftWeek.parentInstructor}
                      onChange={(event) =>
                        updateDraft({ parentInstructor: event.target.value })
                      }
                      placeholder="e.g. Jessica and Jared"
                      style={controlStyle(C)}
                    />
                  </BuilderQuestionCard>
                </div>
                <div className="min-w-0">
                  <BuilderQuestionCard
                    C={C}
                    tone="clay"
                    question="Parent assistant"
                    helper="Optional."
                  >
                    <input
                      type="text"
                      value={draftWeek.parentAssistant ?? ""}
                      onChange={(event) =>
                        updateDraft({
                          parentAssistant: event.target.value.trim() ? event.target.value : null,
                        })
                      }
                      placeholder="e.g. Bailey"
                      style={controlStyle(C)}
                    />
                  </BuilderQuestionCard>
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
              onClick={() => void handleSave()}
              disabled={!isDirty || saving}
            >
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
