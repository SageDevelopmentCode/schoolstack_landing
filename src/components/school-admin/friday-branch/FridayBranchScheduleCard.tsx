"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, FileText, Pencil, Plus, Send } from "lucide-react";
import { GardenEmptyState, gBtnOutlineXs } from "@/components/school-admin/garden/kit";
import { G_TABLE, G_TD, G_TH } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, G_FOCUS, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  createEmptyClass,
  createSlotWithTime,
  formatGapReviewLabel,
  getScheduleGaps,
  removeClassFromBlock,
  removeSlotFromBlock,
  sortFridayBranchTimeSlots,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import {
  EMPTY_FRIDAY_BRANCH_ENROLLMENT_SUMMARY,
  type FridayBranchClassEnrollmentSummary,
} from "@/lib/school-admin/friday-branch/friday-branch-enrollment-counts";
import { mergeFridayBranchClassIntoBlock } from "@/lib/school-admin/friday-branch/friday-branch-class-save";
import type {
  FridayBranchBlock,
  FridayBranchClass,
} from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchAddTimeSlotSheet, {
  type FridayBranchAddTimeSlotPayload,
} from "./FridayBranchAddTimeSlotSheet";
import FridayBranchClassDetailSheet from "./FridayBranchClassDetailSheet";
import FridayBranchClassEditSheet from "./FridayBranchClassEditSheet";
import FridayBranchRowActionsMenu from "./FridayBranchRowActionsMenu";
import FridayBranchSendRosterSheet from "./FridayBranchSendRosterSheet";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import FridayBranchStatusTag from "./FridayBranchStatusTag";

type FridayBranchScheduleCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  organizationId: string;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
  onClassSaved?: (nextBlock: FridayBranchBlock) => Promise<void>;
  saving?: boolean;
  highlightClassId?: string | null;
  requestedClassId?: string | null;
  onRequestedClassHandled?: () => void;
  onReviewGaps?: () => void;
  /** Local delete with Undo (saved with "Save schedule"). */
  onLocalChange?: (nextBlock: FridayBranchBlock, title: string) => void;
  /** Extra actions in the card header (block tools). */
  headerActions?: React.ReactNode;
};

type EditTarget = {
  slotId: string;
  classEntry: FridayBranchClass;
  isNew: boolean;
};

type DetailTarget = {
  classId: string;
  slotId: string;
  classEntry: FridayBranchClass;
  slotTime: string;
};

type SendRosterTarget = {
  classId: string;
  className: string;
  slotTime: string;
};

function collectBlockClassIds(block: FridayBranchBlock): string[] {
  const classIds: string[] = [];
  for (const slot of block.slots) {
    for (const classEntry of slot.classes) {
      classIds.push(classEntry.id);
    }
  }
  return classIds;
}

function findDetailTarget(
  block: FridayBranchBlock,
  classId: string,
): DetailTarget | null {
  for (const slot of block.slots) {
    const classEntry = slot.classes.find((entry) => entry.id === classId);
    if (!classEntry) continue;

    return {
      classId: classEntry.id,
      slotId: slot.id,
      classEntry,
      slotTime: slot.time,
    };
  }

  return null;
}

function renderSignedUpValue(
  summary: FridayBranchClassEnrollmentSummary | null,
  capacity: number | null | undefined,
) {
  if (!summary) return <span className="text-[13px] font-bold text-[var(--sf-soft)]">—</span>;
  const full = capacity && capacity > 0 && summary.confirmed >= capacity;
  const confirmedLabel = capacity && capacity > 0 ? `${summary.confirmed} / ${capacity}` : String(summary.confirmed);
  return (
    <div>
      <span className="text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">{confirmedLabel}</span>
      {full ? <GChip tone="warning" className="ml-1.5">Full</GChip> : null}
      {summary.waitlisted > 0 ? (
        <span className="mt-0.5 block text-[12px] font-semibold text-[var(--sf-soft)]">+{summary.waitlisted} waitlisted</span>
      ) : null}
    </div>
  );
}

function renderLocationValue(location: string) {
  if (!location.trim()) {
    return <FridayBranchStatusTag label="Needs location" variant="amber" />;
  }
  return location;
}

function renderAgeValue(ageGroup: string) {
  if (!ageGroup.trim()) {
    return <FridayBranchStatusTag label="Needs age group" variant="amber" />;
  }
  if (ageGroup.toLowerCase() === "all ages") {
    return <FridayBranchStatusTag label="All ages" variant="blue" />;
  }
  return ageGroup;
}

export default function FridayBranchScheduleCard({
  C,
  theme,
  organizationId,
  block,
  onChange,
  onClassSaved,
  saving = false,
  highlightClassId,
  requestedClassId,
  onRequestedClassHandled,
  onReviewGaps,
  onLocalChange,
  headerActions,
}: FridayBranchScheduleCardProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [sendRosterTarget, setSendRosterTarget] = useState<SendRosterTarget | null>(null);
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [localHighlightClassId, setLocalHighlightClassId] = useState<string | null>(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState<
    Record<string, FridayBranchClassEnrollmentSummary>
  >({});

  const effectiveHighlightClassId = highlightClassId ?? localHighlightClassId;
  const gaps = getScheduleGaps(block);
  const classIds = collectBlockClassIds(block);
  const displayEnrollmentCounts = classIds.length === 0 ? {} : enrollmentCounts;

  const requestedDetailTarget = useMemo(
    () => (requestedClassId ? findDetailTarget(block, requestedClassId) : null),
    [block, requestedClassId],
  );
  const activeDetailTarget = detailTarget ?? requestedDetailTarget;

  const [countsState, setCountsState] = useState<"loading" | "ready" | "error">("loading");
  const [countsNonce, setCountsNonce] = useState(0);
  const retryCounts = useCallback(() => setCountsNonce((n) => n + 1), []);

  useEffect(() => {
    const activeClassIds = collectBlockClassIds(block);
    if (activeClassIds.length === 0) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setCountsState("loading");
    });

    void (async () => {
      try {
        const response = await fetch(
          `/api/school-admin/friday-branch/enrollment-counts?organizationId=${encodeURIComponent(organizationId)}&classIds=${encodeURIComponent(activeClassIds.join(","))}`,
        );
        if (cancelled) return;
        if (!response.ok) throw new Error("Failed to load sign-up counts.");
        const payload = (await response.json()) as {
          counts?: Record<string, FridayBranchClassEnrollmentSummary>;
        };
        if (!cancelled) {
          setEnrollmentCounts(payload.counts ?? {});
          setCountsState("ready");
        }
      } catch {
        if (!cancelled) {
          setEnrollmentCounts({});
          setCountsState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [block, organizationId, countsNonce]);

  useEffect(() => {
    if (!requestedDetailTarget) return;
    queueMicrotask(() => onRequestedClassHandled?.());
  }, [onRequestedClassHandled, requestedDetailTarget]);

  const updateBlock = (nextBlock: FridayBranchBlock) => onChange(nextBlock);

  const openAddSlot = () => {
    setEditTarget(null);
    setDetailTarget(null);
    setAddSlotOpen(true);
  };

  const handleSaveTimeSlot = async ({ time, firstClass }: FridayBranchAddTimeSlotPayload) => {
    const newSlot = createSlotWithTime(time, firstClass);
    const nextBlock = {
      ...block,
      slots: sortFridayBranchTimeSlots([...block.slots, newSlot]),
    };

    if (onClassSaved) {
      await onClassSaved(nextBlock);
    } else {
      updateBlock(nextBlock);
    }

    const classId = newSlot.classes[0]?.id;
    if (classId) {
      setLocalHighlightClassId(classId);
      window.setTimeout(() => {
        document
          .querySelector(`[data-class-id="${classId}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      window.setTimeout(() => setLocalHighlightClassId(null), 3000);
    }
  };

  const openEdit = (slotId: string, classEntry: FridayBranchClass, isNew = false) => {
    setAddSlotOpen(false);
    setDetailTarget(null);
    setEditTarget({ slotId, classEntry: { ...classEntry }, isNew });
  };

  const openDetail = (slotId: string, classEntry: FridayBranchClass, slotTime: string) => {
    setDetailTarget({
      classId: classEntry.id,
      slotId,
      classEntry,
      slotTime,
    });
  };

  const openAddClass = (slotId: string) => {
    const empty = createEmptyClass();
    openEdit(slotId, empty, true);
  };

  const handleEditFromDetail = (classEntry: FridayBranchClass) => {
    const slot = block.slots.find((entry) =>
      entry.classes.some((item) => item.id === classEntry.id),
    );
    if (!slot) return;
    openEdit(slot.id, classEntry);
  };

  const handleDeleteClass = (slotId: string, classId: string) => {
    const name = block.slots.find((slot) => slot.id === slotId)?.classes.find((c) => c.id === classId)?.name || "Class";
    const next = removeClassFromBlock(block, slotId, classId);
    if (onLocalChange) onLocalChange(next, `${name} removed.`);
    else updateBlock(next);
  };

  const handleDeleteSlot = (slotId: string) => {
    const time = block.slots.find((slot) => slot.id === slotId)?.time || "Time slot";
    const next = removeSlotFromBlock(block, slotId);
    if (onLocalChange) onLocalChange(next, `${time} time slot removed.`);
    else updateBlock(next);
  };

  const handleSaveClass = async (
    targetSlotId: string,
    classEntry: FridayBranchClass,
    previousSlotId?: string,
  ) => {
    const nextBlock = mergeFridayBranchClassIntoBlock(
      block,
      targetSlotId,
      classEntry,
      previousSlotId,
    );

    if (onClassSaved) {
      await onClassSaved(nextBlock);
      return;
    }

    updateBlock(nextBlock);
  };

  const addSlotSheet = (
    <FridayBranchAddTimeSlotSheet
      open={addSlotOpen}
      onClose={() => setAddSlotOpen(false)}
      onSave={handleSaveTimeSlot}
      slots={block.slots}
      organizationId={organizationId}
      saving={saving}
      theme={theme}
      C={C}
    />
  );

  const editSheet = (
    <FridayBranchClassEditSheet
      open={editTarget !== null}
      organizationId={organizationId}
      theme={theme}
      C={C}
      slots={block.slots}
      classEntry={editTarget?.classEntry ?? null}
      slotId={editTarget?.slotId ?? null}
      isNew={editTarget?.isNew ?? false}
      onClose={() => setEditTarget(null)}
      onSave={handleSaveClass}
      saving={saving}
    />
  );

  const detailSheet = (
    <FridayBranchClassDetailSheet
      open={activeDetailTarget !== null}
      organizationId={organizationId}
      classId={activeDetailTarget?.classId ?? null}
      fallbackClass={activeDetailTarget?.classEntry ?? null}
      fallbackSlotTime={activeDetailTarget?.slotTime}
      theme={theme}
      C={C}
      onClose={() => setDetailTarget(null)}
      onEditClass={handleEditFromDetail}
    />
  );

  const sendRosterSheet = (
    <FridayBranchSendRosterSheet
      open={sendRosterTarget !== null}
      onClose={() => setSendRosterTarget(null)}
      organizationId={organizationId}
      classId={sendRosterTarget?.classId ?? null}
      className={sendRosterTarget?.className ?? ""}
      slotTime={sendRosterTarget?.slotTime ?? ""}
      theme={theme}
      C={C}
    />
  );

  const header = (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
        Click a class to view details and roster. Adding or editing a class saves right away.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {headerActions}
        {gaps.length > 0 && onReviewGaps ? (
          <button type="button" className={`${gBtnOutlineSm} !border-[#d9a400]/50 !bg-[var(--sf-butter)]/50`} onClick={onReviewGaps}>
            <AlertTriangle className="h-4 w-4 text-[#6b4f00]" aria-hidden />
            {formatGapReviewLabel(gaps.length)}
          </button>
        ) : null}
        <button type="button" className={gBtnOutlineSm} onClick={openAddSlot} data-testid="friday-branch-add-slot">
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add time slot
        </button>
      </div>
    </div>
  );

  if (block.slots.length === 0) {
    return (
      <>
        <GCard index={2} kicker="Schedule" title="No time slots yet" data-testid="friday-branch-schedule">
          {header}
          <GardenEmptyState
            icon={CalendarPlus}
            title="Add the first time slot"
            description="No time slots yet. Add the first slot to begin building this block's schedule."
            action={
              <button type="button" onClick={openAddSlot} className={gBtnOutlineSm}>
                <Plus className="h-4 w-4" aria-hidden />
                Add first time slot
              </button>
            }
          />
        </GCard>
        {addSlotSheet}
        {editSheet}
        {detailSheet}
      </>
    );
  }

  return (
    <>
      <GCard index={2} kicker="Schedule" title={`${block.slots.length} time slot${block.slots.length === 1 ? "" : "s"}`} data-testid="friday-branch-schedule">
        {header}
        {countsState === "error" ? (
          <p className="m-0 mb-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--sf-soft)]" role="status">
            <AlertTriangle className="h-4 w-4 text-[#9a3422]" aria-hidden />
            Sign-up counts didn&apos;t load.
            <button type="button" className={gLinkSm} onClick={retryCounts}>
              Try again
            </button>
          </p>
        ) : null}
        <div className="-mx-1 overflow-x-auto">
          <table className={`${G_TABLE} min-w-[820px]`}>
            <thead>
              <tr>
                {["Time", "Class", "Location", "Age group", "Price", "Signed up", ""].map((label) => (
                  <th key={label || "actions"} scope="col" className={G_TH}>
                    {label || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.slots.map((slot) => (
                <Fragment key={slot.id}>
                  {slot.classes.map((classEntry, classIndex) => {
                    const highlighted = classEntry.id === effectiveHighlightClassId;
                    const counts = countsState === "ready" ? displayEnrollmentCounts[classEntry.id] ?? EMPTY_FRIDAY_BRANCH_ENROLLMENT_SUMMARY : null;
                    return (
                      <tr
                        key={classEntry.id}
                        data-slot-id={slot.id}
                        data-class-id={classEntry.id}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.target !== event.currentTarget) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openDetail(slot.id, classEntry, slot.time);
                          }
                        }}
                        aria-label={`${classEntry.name || "Untitled class"} at ${slot.time || "no time"}. Open details`}
                        className={`cursor-pointer transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/45 ${
                          highlighted ? "bg-[var(--sf-butter)]/60" : "hover:bg-[var(--sf-accent-wash)]"
                        }`}
                        onClick={() => openDetail(slot.id, classEntry, slot.time)}
                      >
                        {classIndex === 0 ? (
                          <td rowSpan={slot.classes.length} className={`${G_TD} !align-top`}>
                            <span className="inline-flex rounded-[10px] bg-[var(--sf-accent-wash)] px-2.5 py-1.5 text-[13px] font-extrabold tabular-nums text-[var(--sf-clay-deep)]">
                              {slot.time || "—"}
                            </span>
                          </td>
                        ) : null}
                        <td className={`${G_TD} !align-top`}>
                          <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{classEntry.name || "Untitled class"}</span>
                          <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                            {classEntry.teacher?.trim() ? `with ${classEntry.teacher}` : "Teacher not assigned"}
                          </span>
                          {classEntry.flyerStoragePath ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-extrabold text-[var(--sf-clay-deep)]">
                              <FileText className="h-3.5 w-3.5" aria-hidden />
                              PDF flyer attached
                            </span>
                          ) : null}
                        </td>
                        <td className={`${G_TD} !align-top text-[13px] font-bold text-[var(--sf-ink)]/80`}>{renderLocationValue(classEntry.location)}</td>
                        <td className={`${G_TD} !align-top text-[13px] font-bold text-[var(--sf-ink)]/80`}>{renderAgeValue(classEntry.ageGroup)}</td>
                        <td className={`${G_TD} !align-top text-[13px] font-bold tabular-nums text-[var(--sf-ink)]/80`}>
                          {classEntry.priceCents != null ? formatFeeAmount(classEntry.priceCents) : "—"}
                        </td>
                        <td className={`${G_TD} !align-top`}>{renderSignedUpValue(counts, classEntry.capacity)}</td>
                        <td className={`${G_TD} !align-top`}>
                          <div className="flex flex-wrap items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() =>
                                setSendRosterTarget({
                                  classId: classEntry.id,
                                  className: classEntry.name || "Untitled class",
                                  slotTime: slot.time,
                                })
                              }
                              className={gBtnOutlineXs}
                            >
                              <Send className="h-3.5 w-3.5" aria-hidden />
                              Send roster
                            </button>
                            <button type="button" onClick={() => openEdit(slot.id, classEntry)} className={gBtnOutlineXs}>
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              Edit
                            </button>
                            <FridayBranchRowActionsMenu
                              C={C}
                              slotTime={slot.time || "this time"}
                              showDeleteSlot={classIndex === 0}
                              slotClassCount={slot.classes.length}
                              onDeleteClass={() => handleDeleteClass(slot.id, classEntry.id)}
                              onDeleteSlot={() => handleDeleteSlot(slot.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="border-b border-[var(--sf-ink)]/[0.06] px-3 py-2" />
                    <td colSpan={6} className="border-b border-[var(--sf-ink)]/[0.06] px-3 py-2">
                      <button type="button" onClick={() => openAddClass(slot.id)} className={`inline-flex items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`}>
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                        Add class at {slot.time || "this time"}
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </GCard>

      {sendRosterSheet}
      {addSlotSheet}
      {editSheet}
      {detailSheet}
    </>
  );
}
