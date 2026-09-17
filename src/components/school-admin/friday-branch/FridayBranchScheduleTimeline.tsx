"use client";

import { Plus } from "lucide-react";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  createEmptyClass,
  createEmptySlot,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type {
  FridayBranchBlock,
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchClassRow, {
  FRIDAY_BRANCH_ROW_GRID,
} from "./FridayBranchClassRow";

type FridayBranchScheduleTimelineProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
};

export default function FridayBranchScheduleTimeline({
  C,
  theme,
  block,
  onChange,
}: FridayBranchScheduleTimelineProps) {
  const updateBlock = (patch: Partial<FridayBranchBlock>) => {
    onChange({ ...block, ...patch });
  };

  const updateSlot = (slotId: string, nextSlot: FridayBranchTimeSlot) => {
    updateBlock({
      slots: block.slots.map((slot) => (slot.id === slotId ? nextSlot : slot)),
    });
  };

  const updateClass = (
    slotId: string,
    classId: string,
    nextClass: FridayBranchClass,
  ) => {
    const slot = block.slots.find((entry) => entry.id === slotId);
    if (!slot) return;
    updateSlot(slotId, {
      ...slot,
      classes: slot.classes.map((entry) => (entry.id === classId ? nextClass : entry)),
    });
  };

  const addClassToSlot = (slotId: string) => {
    const slot = block.slots.find((entry) => entry.id === slotId);
    if (!slot) return;
    updateSlot(slotId, {
      ...slot,
      classes: [...slot.classes, createEmptyClass()],
    });
  };

  const removeClassFromSlot = (slotId: string, classId: string) => {
    const slot = block.slots.find((entry) => entry.id === slotId);
    if (!slot || slot.classes.length <= 1) return;
    updateSlot(slotId, {
      ...slot,
      classes: slot.classes.filter((entry) => entry.id !== classId),
    });
  };

  const addTimeSlot = () => {
    updateBlock({
      slots: [...block.slots, createEmptySlot()],
    });
  };

  const removeTimeSlot = (slotId: string) => {
    if (block.slots.length <= 1) return;
    updateBlock({
      slots: block.slots.filter((slot) => slot.id !== slotId),
    });
  };

  if (block.slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold" style={{ color: theme.ink, fontFamily: theme.fontDisplay }}>
          No time slots yet
        </p>
        <p className="mt-2 max-w-sm text-sm" style={{ color: theme.muted }}>
          Add a time slot to start building this Friday&apos;s schedule.
        </p>
        <button
          type="button"
          onClick={addTimeSlot}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          style={{ backgroundColor: theme.sage, color: theme.primary }}
        >
          <Plus className="h-4 w-4" />
          Add first time slot
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className={`${FRIDAY_BRANCH_ROW_GRID} sticky top-0 z-10 border-b bg-white/95 px-2 py-2.5 backdrop-blur`}
            style={{ borderColor: "#EEF2EE" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8B9699" }}>
              Time
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8B9699" }}>
              Class
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8B9699" }}>
              Location
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8B9699" }}>
              Age
            </span>
            <span className="sr-only">Actions</span>
          </div>

          <div className="divide-y divide-[#EEF2EE]">
            {block.slots.map((slot) => (
              <div key={slot.id} className="px-1 py-2">
                {slot.classes.map((classEntry, classIndex) => (
                  <FridayBranchClassRow
                    key={classEntry.id}
                    C={C}
                    theme={theme}
                    classEntry={classEntry}
                    time={slot.time}
                    showTime={classIndex === 0}
                    onTimeChange={(time) => updateSlot(slot.id, { ...slot, time })}
                    onChange={(next) => updateClass(slot.id, classEntry.id, next)}
                    onRemove={() => removeClassFromSlot(slot.id, classEntry.id)}
                    canRemove={slot.classes.length > 1}
                    onRemoveSlot={() => removeTimeSlot(slot.id)}
                    canRemoveSlot={block.slots.length > 1 && classIndex === 0}
                  />
                ))}

                <div className="px-2 pt-1">
                  <AdminTextLink
                    theme={theme}
                    className="!text-[11px]"
                    style={{ color: theme.muted }}
                    onClick={() => addClassToSlot(slot.id)}
                  >
                    + Add class at {slot.time || "this time"}
                  </AdminTextLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <AdminTextLink theme={theme} onClick={addTimeSlot}>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            Add time slot
          </span>
        </AdminTextLink>
      </div>
    </div>
  );
}
