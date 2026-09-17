"use client";

import { Fragment, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  createEmptyClass,
  createEmptySlot,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type {
  FridayBranchBlock,
  FridayBranchClass,
} from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchClassEditModal from "./FridayBranchClassEditModal";
import FridayBranchStatusTag from "./FridayBranchStatusTag";

type FridayBranchScheduleCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
  highlightClassId?: string | null;
};

type EditTarget = {
  slotId: string;
  classEntry: FridayBranchClass;
  isNew: boolean;
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
  block,
  onChange,
  highlightClassId,
}: FridayBranchScheduleCardProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const updateBlock = (nextBlock: FridayBranchBlock) => onChange(nextBlock);

  const addTimeSlot = () => {
    updateBlock({ ...block, slots: [...block.slots, createEmptySlot()] });
  };

  const openEdit = (slotId: string, classEntry: FridayBranchClass, isNew = false) => {
    setEditTarget({ slotId, classEntry, isNew });
  };

  const openAddClass = (slotId: string) => {
    const empty = createEmptyClass();
    setEditTarget({ slotId, classEntry: empty, isNew: true });
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

  if (block.slots.length === 0) {
    return (
      <AdminCard theme={theme} padding="none" className="mt-4 overflow-hidden">
        <div className="px-[18px] py-8 text-center">
          <p className="text-xs" style={{ color: theme.muted }}>
            No time slots yet. Add the first slot to begin building this block&apos;s schedule.
          </p>
          <button
            type="button"
            onClick={addTimeSlot}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-2 text-[11px] font-bold"
            style={{ borderColor: "#A9C4AF", backgroundColor: "#F8FCF8", color: theme.primary }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add first time slot
          </button>
        </div>
      </AdminCard>
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
              {block.label} schedule
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: "#7B898D" }}>
              Click a class to edit its details. Add a class beneath any time slot.
            </p>
          </div>
          <AdminButton theme={theme} variant="soft" type="button" onClick={addTimeSlot}>
            + Add time slot
          </AdminButton>
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
                  <tr
                    data-slot-id={slot.id}
                    className={slot.classes.some((entry) => entry.id === highlightClassId) ? "bg-[#FFF9E9]" : undefined}
                  >
                    <td className="border-t px-[17px] py-[13px] align-top text-xs" style={{ borderColor: "#EDF1ED" }}>
                      <span
                        className="inline-block rounded-[9px] px-2 py-1.5 text-[11px] font-extrabold"
                        style={{ backgroundColor: "#EDF4EE", color: "#315E4F" }}
                      >
                        {slot.time || "—"}
                      </span>
                    </td>
                    <td className="border-t px-[17px] py-[13px] align-top text-xs" style={{ borderColor: "#EDF1ED" }}>
                      <div className="space-y-2">
                        {slot.classes.map((classEntry, index) => (
                          <div key={classEntry.id} className={index > 0 ? "pt-2" : ""}>
                            <b className="block text-xs" style={{ color: theme.ink }}>
                              {classEntry.name || "Untitled class"}
                            </b>
                            <span className="text-[10px]" style={{ color: "#79878C" }}>
                              {classEntry.teacher?.trim()
                                ? `with ${classEntry.teacher}`
                                : "Teacher not assigned"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border-t px-[17px] py-[13px] align-top text-xs" style={{ borderColor: "#EDF1ED" }}>
                      <div className="space-y-2">
                        {slot.classes.map((classEntry, index) => (
                          <div key={classEntry.id} className={index > 0 ? "pt-2" : ""}>
                            {renderLocationValue(classEntry.location)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border-t px-[17px] py-[13px] align-top text-xs" style={{ borderColor: "#EDF1ED" }}>
                      <div className="space-y-2">
                        {slot.classes.map((classEntry, index) => (
                          <div key={classEntry.id} className={index > 0 ? "pt-2" : ""}>
                            {renderAgeValue(classEntry.ageGroup)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border-t px-[17px] py-[13px] align-top text-xs" style={{ borderColor: "#EDF1ED" }}>
                      <div className="flex flex-col gap-2">
                        {slot.classes.map((classEntry) => (
                          <div key={classEntry.id} className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(slot.id, classEntry)}
                              className="rounded-[7px] px-2 py-1.5 text-[10px] font-bold"
                              style={{ backgroundColor: "#E8F2E9", color: "#356C50" }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-[7px] px-2 py-1.5"
                              style={{ backgroundColor: "#F3F5F3", color: "#718087" }}
                              aria-label="More actions"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
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
            onClick={addTimeSlot}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-2 text-[11px] font-bold"
            style={{ borderColor: "#A9C4AF", backgroundColor: "#F8FCF8", color: theme.primary }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add time slot
          </button>
        </div>
      </AdminCard>

      <FridayBranchClassEditModal
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
    </>
  );
}
