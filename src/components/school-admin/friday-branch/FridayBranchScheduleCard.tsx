"use client";

import { Fragment, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  createEmptyClass,
  createSlotWithTime,
  formatGapReviewLabel,
  getScheduleGaps,
  removeClassFromBlock,
  removeSlotFromBlock,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
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
import FridayBranchStatusTag from "./FridayBranchStatusTag";

type FridayBranchScheduleCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  organizationId: string;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
  highlightClassId?: string | null;
  requestedClassId?: string | null;
  onRequestedClassHandled?: () => void;
  onReviewGaps?: () => void;
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
  highlightClassId,
  requestedClassId,
  onRequestedClassHandled,
  onReviewGaps,
}: FridayBranchScheduleCardProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [localHighlightClassId, setLocalHighlightClassId] = useState<string | null>(null);

  const effectiveHighlightClassId = highlightClassId ?? localHighlightClassId;
  const gaps = getScheduleGaps(block);

  useEffect(() => {
    if (!requestedClassId) return;

    for (const slot of block.slots) {
      const classEntry = slot.classes.find((entry) => entry.id === requestedClassId);
      if (!classEntry) continue;

      setDetailTarget({
        classId: classEntry.id,
        slotId: slot.id,
        classEntry,
        slotTime: slot.time,
      });
      onRequestedClassHandled?.();
      return;
    }
  }, [block, onRequestedClassHandled, requestedClassId]);

  const updateBlock = (nextBlock: FridayBranchBlock) => onChange(nextBlock);

  const openAddSlot = () => {
    setEditTarget(null);
    setDetailTarget(null);
    setAddSlotOpen(true);
  };

  const handleSaveTimeSlot = ({ time, firstClass }: FridayBranchAddTimeSlotPayload) => {
    const newSlot = createSlotWithTime(time, firstClass);
    updateBlock({ ...block, slots: [...block.slots, newSlot] });

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
    setEditTarget({ slotId, classEntry, isNew });
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
    updateBlock(removeClassFromBlock(block, slotId, classId));
  };

  const handleDeleteSlot = (slotId: string) => {
    updateBlock(removeSlotFromBlock(block, slotId));
  };

  const handleSaveClass = (
    targetSlotId: string,
    classEntry: FridayBranchClass,
    previousSlotId?: string,
  ) => {
    let slots = block.slots.map((slot) => ({
      ...slot,
      classes: slot.classes.map((entry) => ({ ...entry })),
    }));

    if (previousSlotId && previousSlotId !== targetSlotId) {
      const sourceSlot = slots.find((slot) => slot.id === previousSlotId);
      if (sourceSlot) {
        sourceSlot.classes = sourceSlot.classes.filter((entry) => entry.id !== classEntry.id);
      }
      const targetSlot = slots.find((slot) => slot.id === targetSlotId);
      if (targetSlot) {
        const exists = targetSlot.classes.some((entry) => entry.id === classEntry.id);
        if (exists) {
          targetSlot.classes = targetSlot.classes.map((entry) =>
            entry.id === classEntry.id ? classEntry : entry,
          );
        } else {
          targetSlot.classes.push(classEntry);
        }
      }
    } else {
      slots = slots.map((slot) => {
        if (slot.id !== targetSlotId) return slot;
        const exists = slot.classes.some((entry) => entry.id === classEntry.id);
        return {
          ...slot,
          classes: exists
            ? slot.classes.map((entry) => (entry.id === classEntry.id ? classEntry : entry))
            : [...slot.classes, classEntry],
        };
      });
    }

    updateBlock({ ...block, slots });
  };

  const addSlotSheet = (
    <FridayBranchAddTimeSlotSheet
      open={addSlotOpen}
      onClose={() => setAddSlotOpen(false)}
      onSave={handleSaveTimeSlot}
      slots={block.slots}
      theme={theme}
      C={C}
    />
  );

  const editSheet = (
    <FridayBranchClassEditSheet
      open={editTarget !== null}
      theme={theme}
      C={C}
      slots={block.slots}
      classEntry={editTarget?.classEntry ?? null}
      slotId={editTarget?.slotId ?? null}
      isNew={editTarget?.isNew ?? false}
      onClose={() => setEditTarget(null)}
      onSave={handleSaveClass}
    />
  );

  const detailSheet = (
    <FridayBranchClassDetailSheet
      open={detailTarget !== null}
      organizationId={organizationId}
      classId={detailTarget?.classId ?? null}
      fallbackClass={detailTarget?.classEntry ?? null}
      fallbackSlotTime={detailTarget?.slotTime}
      theme={theme}
      C={C}
      onClose={() => setDetailTarget(null)}
      onEditClass={handleEditFromDetail}
    />
  );

  if (block.slots.length === 0) {
    return (
      <>
        <AdminCard theme={theme} padding="none" className="mt-4 overflow-hidden">
          <div className="px-[18px] py-8 text-center">
            <p className="text-xs" style={{ color: theme.muted }}>
              No time slots yet. Add the first slot to begin building this block&apos;s schedule.
            </p>
            <button
              type="button"
              onClick={openAddSlot}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-2 text-[11px] font-bold"
              style={{ borderColor: "#A9C4AF", backgroundColor: "#F8FCF8", color: theme.primary }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add first time slot
            </button>
          </div>
        </AdminCard>
        {addSlotSheet}
        {editSheet}
        {detailSheet}
      </>
    );
  }

  return (
    <>
      <AdminCard theme={theme} padding="none" className="mt-4 overflow-hidden">
        <header
          className="flex flex-col gap-3 border-b px-[18px] py-[17px] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "#EDF1ED" }}
        >
          <div>
            <h2
              className="font-heading text-xl font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              Schedule
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: "#7B898D" }}>
              Click a class to view details and roster.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {gaps.length > 0 && onReviewGaps ? (
              <AdminButton
                theme={theme}
                variant="soft"
                type="button"
                size="compact"
                onClick={onReviewGaps}
              >
                {formatGapReviewLabel(gaps.length)}
              </AdminButton>
            ) : null}
            <AdminButton theme={theme} variant="soft" type="button" onClick={openAddSlot}>
              + Add time slot
            </AdminButton>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#FBFCFB" }}>
                {["Time", "Class", "Location", "Age group", ""].map((label) => (
                  <th
                    key={label || "actions"}
                    className="px-[17px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                    style={{ color: "#8B9699" }}
                  >
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
                    return (
                      <tr
                        key={classEntry.id}
                        data-slot-id={slot.id}
                        data-class-id={classEntry.id}
                        className={`cursor-pointer transition-colors hover:bg-[#F8FCF8] ${highlighted ? "bg-[#FFF9E9]" : ""}`}
                        onClick={() => openDetail(slot.id, classEntry, slot.time)}
                      >
                        {classIndex === 0 ? (
                          <td
                            rowSpan={slot.classes.length}
                            className="border-t px-[17px] py-[13px] align-top text-xs"
                            style={{ borderColor: "#EDF1ED" }}
                          >
                            <span
                              className="inline-block rounded-[9px] px-2 py-1.5 text-[11px] font-extrabold"
                              style={{ backgroundColor: "#EDF4EE", color: "#315E4F" }}
                            >
                              {slot.time || "—"}
                            </span>
                          </td>
                        ) : null}
                        <td
                          className="border-t px-[17px] py-[13px] align-top text-xs"
                          style={{ borderColor: "#EDF1ED" }}
                        >
                          <b className="block text-xs" style={{ color: theme.ink }}>
                            {classEntry.name || "Untitled class"}
                          </b>
                          <span className="text-[10px]" style={{ color: "#79878C" }}>
                            {classEntry.teacher?.trim()
                              ? `with ${classEntry.teacher}`
                              : "Teacher not assigned"}
                          </span>
                        </td>
                        <td
                          className="border-t px-[17px] py-[13px] align-top text-xs"
                          style={{ borderColor: "#EDF1ED" }}
                        >
                          {renderLocationValue(classEntry.location)}
                        </td>
                        <td
                          className="border-t px-[17px] py-[13px] align-top text-xs"
                          style={{ borderColor: "#EDF1ED" }}
                        >
                          {renderAgeValue(classEntry.ageGroup)}
                        </td>
                        <td
                          className="border-t px-[17px] py-[13px] align-top text-xs"
                          style={{ borderColor: "#EDF1ED" }}
                        >
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(slot.id, classEntry);
                              }}
                              className="rounded-[7px] px-2 py-1.5 text-[10px] font-bold"
                              style={{ backgroundColor: "#E8F2E9", color: "#356C50" }}
                            >
                              Edit
                            </button>
                            <div onClick={(event) => event.stopPropagation()}>
                              <FridayBranchRowActionsMenu
                                C={C}
                                slotTime={slot.time || "this time"}
                                showDeleteSlot={classIndex === 0}
                                slotClassCount={slot.classes.length}
                                onDeleteClass={() => handleDeleteClass(slot.id, classEntry.id)}
                                onDeleteSlot={() => handleDeleteSlot(slot.id)}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ backgroundColor: "#FBFDFB" }}>
                    <td className="border-t px-[17px] py-2.5" style={{ borderColor: "#EDF1ED" }} />
                    <td colSpan={4} className="border-t px-[17px] py-2.5" style={{ borderColor: "#EDF1ED" }}>
                      <button
                        type="button"
                        onClick={() => openAddClass(slot.id)}
                        className="border-0 bg-transparent p-0 text-[11px] font-bold"
                        style={{ color: theme.primary }}
                      >
                        + Add class at {slot.time || "this time"}
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center px-[17px] py-[17px]">
          <button
            type="button"
            onClick={openAddSlot}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-2 text-[11px] font-bold"
            style={{ borderColor: "#A9C4AF", backgroundColor: "#F8FCF8", color: theme.primary }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add time slot
          </button>
        </div>
      </AdminCard>

      {addSlotSheet}
      {editSheet}
      {detailSheet}
    </>
  );
}
