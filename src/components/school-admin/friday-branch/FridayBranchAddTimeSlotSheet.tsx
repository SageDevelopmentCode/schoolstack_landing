"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import FridayBranchClassFlyerUpload from "@/components/school-admin/friday-branch/FridayBranchClassFlyerUpload";
import {
  FridayBranchFieldLabel,
  FridayBranchTextInput,
} from "@/components/school-admin/friday-branch/FridayBranchFormFields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { buildFridayBranchClassSavePayload } from "@/lib/school-admin/friday-branch/friday-branch-class-save";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";
import type { FridayBranchFirstClassSeed } from "@/lib/school-admin/friday-branch/friday-branch-mock";
import {
  createEmptyClass,
  fridayBranchTimeToPickerValue,
  getAvailableQuickPickTimes,
  pickerValueToFridayBranchTime,
  slotTimeExists,
  suggestNextSlotTime,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type {
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "@/lib/school-admin/friday-branch/friday-branch-types";

export type FridayBranchAddTimeSlotPayload = {
  time: string;
  firstClass?: FridayBranchFirstClassSeed;
};

type FridayBranchAddTimeSlotSheetProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: FridayBranchAddTimeSlotPayload) => void | Promise<void>;
  slots: FridayBranchTimeSlot[];
  organizationId: string;
  saving?: boolean;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

export default function FridayBranchAddTimeSlotSheet({
  open,
  onClose,
  onSave,
  slots,
  organizationId,
  saving = false,
  theme,
  C,
}: FridayBranchAddTimeSlotSheetProps) {
  const [pickerTime, setPickerTime] = useState("");
  const [firstClassName, setFirstClassName] = useState("");
  const [location, setLocation] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [classLeader, setClassLeader] = useState("");
  const [draftClass, setDraftClass] = useState<FridayBranchClass>(() => createEmptyClass());
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      const suggested = suggestNextSlotTime(slots);
      setPickerTime(fridayBranchTimeToPickerValue(suggested));
      setFirstClassName("");
      setLocation("");
      setAgeGroup("");
      setClassLeader("");
      setDraftClass(createEmptyClass());
      setPriceInput("");
      setPriceError(null);
      setError(null);
    });
  }, [open, slots]);

  const quickPicks = getAvailableQuickPickTimes(slots);
  const branchTime = pickerTime ? pickerValueToFridayBranchTime(pickerTime) : "";
  const existingTimes =
    slots.length > 0
      ? slots.map((slot) => slot.time).filter(Boolean).join(", ")
      : "None yet";
  const isBusy = saving || isSaving;

  const handleSave = async () => {
    if (isBusy) return;

    if (!pickerTime.trim()) {
      setError("Choose a time for this slot.");
      return;
    }

    const payload = buildFridayBranchClassSavePayload(draftClass, priceInput);
    if ("error" in payload) {
      setPriceError(payload.error);
      return;
    }

    setError(null);
    setPriceError(null);
    setIsSaving(true);

    try {
      await onSave({
        time: branchTime,
        firstClass: {
          id: payload.id,
          name: firstClassName.trim() || undefined,
          location: location.trim() || undefined,
          ageGroup: ageGroup.trim() || undefined,
          teacher: classLeader.trim() || undefined,
          priceCents: payload.priceCents,
          flyerStoragePath: payload.flyerStoragePath ?? null,
          flyerFileName: payload.flyerFileName ?? null,
          flyerFileSizeBytes: payload.flyerFileSizeBytes ?? null,
        },
      });
      onClose();
    } catch {
      // Parent surfaces the error toast; keep the sheet open for retry.
    } finally {
      setIsSaving(false);
    }
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
            disabled={isBusy}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            onClick={() => void handleSave()}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add time slot"
            )}
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
            disabled={isBusy}
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

        <label className="block">
          <FridayBranchFieldLabel C={C}>Price (optional)</FridayBranchFieldLabel>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: C.textSecondary }}
            >
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              className={FRIDAY_BRANCH_FIELD_INPUT_CLASS}
              style={{ ...fieldInputStyle, paddingLeft: "1.5rem" }}
              value={priceInput}
              onChange={(event) => {
                setPriceInput(event.target.value);
                setPriceError(null);
              }}
              placeholder="0.00"
              aria-label="Price"
              disabled={isBusy}
            />
          </div>
          {priceError ? (
            <p className="mt-1 text-xs" style={{ color: theme.alert }}>
              {priceError}
            </p>
          ) : null}
        </label>

        <FridayBranchClassFlyerUpload
          C={C}
          theme={theme}
          supabase={supabase}
          organizationId={organizationId}
          classEntry={draftClass}
          onChange={setDraftClass}
        />

        <p className="text-[11px]" style={{ color: C.textTertiary }}>
          Leave class fields blank to add an empty class you can fill in later.
        </p>
      </div>
    </SchoolAdminSlideOverShell>
  );
}
