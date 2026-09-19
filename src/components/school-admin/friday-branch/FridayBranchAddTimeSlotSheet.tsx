"use client";

import { useEffect, useState } from "react";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import {
  FridayBranchFieldLabel,
  FridayBranchTextInput,
} from "@/components/school-admin/friday-branch/FridayBranchFormFields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";
import type { FridayBranchFirstClassSeed } from "@/lib/school-admin/friday-branch/friday-branch-mock";
import {
  fridayBranchTimeToPickerValue,
  getAvailableQuickPickTimes,
  pickerValueToFridayBranchTime,
  slotTimeExists,
  suggestNextSlotTime,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchTimeSlot } from "@/lib/school-admin/friday-branch/friday-branch-types";

export type FridayBranchAddTimeSlotPayload = {
  time: string;
  firstClass?: FridayBranchFirstClassSeed;
};

type FridayBranchAddTimeSlotSheetProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: FridayBranchAddTimeSlotPayload) => void;
  slots: FridayBranchTimeSlot[];
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

export default function FridayBranchAddTimeSlotSheet({
  open,
  onClose,
  onSave,
  slots,
  theme,
  C,
}: FridayBranchAddTimeSlotSheetProps) {
  const [pickerTime, setPickerTime] = useState("");
  const [firstClassName, setFirstClassName] = useState("");
  const [location, setLocation] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [classLeader, setClassLeader] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      const suggested = suggestNextSlotTime(slots);
      setPickerTime(fridayBranchTimeToPickerValue(suggested));
      setFirstClassName("");
      setLocation("");
      setAgeGroup("");
      setClassLeader("");
      setError(null);
    });
  }, [open, slots]);

  const quickPicks = getAvailableQuickPickTimes(slots);
  const branchTime = pickerTime ? pickerValueToFridayBranchTime(pickerTime) : "";
  const existingTimes =
    slots.length > 0
      ? slots.map((slot) => slot.time).filter(Boolean).join(", ")
      : "None yet";

  const handleSave = () => {
    if (!pickerTime.trim()) {
      setError("Choose a time for this slot.");
      return;
    }
    setError(null);
    onSave({
      time: branchTime,
      firstClass: {
        name: firstClassName.trim() || undefined,
        location: location.trim() || undefined,
        ageGroup: ageGroup.trim() || undefined,
        teacher: classLeader.trim() || undefined,
      },
    });
    onClose();
  };

  const duplicateWarning =
    branchTime && slotTimeExists(slots, branchTime)
      ? "This time already exists in the schedule. You can still add it if you need another group at the same time."
      : null;

  const fieldInputStyle = fridayBranchFieldInputStyle(theme, C);

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Add time slot"
      subtitle="Choose when this group of classes starts on Friday."
      C={C}
      widthClassName="w-[min(100%,28rem)]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <AdminButton theme={theme} variant="primary" type="button" onClick={handleSave}>
            Add time slot
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4" style={{ fontFamily: theme.fontBody }}>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Current times: {existingTimes}
        </p>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Time</FridayBranchFieldLabel>
          <PopupTimePicker
            theme={theme}
            value={pickerTime}
            onChange={(value) => {
              setPickerTime(value);
              setError(null);
            }}
            ariaLabel="Choose time slot"
            scrollToTime={pickerTime}
            className="rounded-[9px] py-2.5"
          />
        </label>

        {quickPicks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {quickPicks.map((pick) => {
              const pickValue = fridayBranchTimeToPickerValue(pick);
              const isActive = pickerTime === pickValue;
              return (
                <button
                  key={pick}
                  type="button"
                  onClick={() => {
                    setPickerTime(pickValue);
                    setError(null);
                  }}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={{
                    borderColor: isActive ? theme.primary : C.border,
                    backgroundColor: isActive ? "#EDF6EE" : C.surface,
                    color: isActive ? theme.primary : C.textSecondary,
                  }}
                >
                  {pick}
                </button>
              );
            })}
          </div>
        ) : null}

        {error ? (
          <p className="text-xs" style={{ color: "#AD574C" }}>{error}</p>
        ) : null}
        {duplicateWarning ? (
          <p className="text-xs" style={{ color: "#A26B22" }}>{duplicateWarning}</p>
        ) : null}

        <label className="block">
          <FridayBranchFieldLabel C={C}>First class name (optional)</FridayBranchFieldLabel>
          <input
            value={firstClassName}
            onChange={(event) => setFirstClassName(event.target.value)}
            placeholder="e.g. Intro to Dance K–3"
            className={FRIDAY_BRANCH_FIELD_INPUT_CLASS}
            style={fieldInputStyle}
            aria-label="First class name"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Location (optional)</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={location}
            onChange={setLocation}
            placeholder="e.g. La Casita, The Meadow"
            ariaLabel="Location"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Age group (optional)</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={ageGroup}
            onChange={setAgeGroup}
            placeholder="e.g. K–3, 9–12 yr"
            ariaLabel="Age group"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Class leader (optional)</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={classLeader}
            onChange={setClassLeader}
            placeholder="e.g. staff member, parent volunteer, guest instructor"
            ariaLabel="Class leader"
          />
        </label>

        <p className="text-[11px]" style={{ color: C.textTertiary }}>
          Leave class fields blank to add an empty class you can fill in later.
        </p>
      </div>
    </SchoolAdminSlideOverShell>
  );
}
