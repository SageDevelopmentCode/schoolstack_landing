"use client";

import { useEffect, useMemo, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import {
  FridayBranchFamilyVisibilityToggle,
  FridayBranchFieldLabel,
  FridayBranchSelect,
  FridayBranchTextInput,
} from "@/components/school-admin/friday-branch/FridayBranchFormFields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";
import type {
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchClassEditSheetProps = {
  open: boolean;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  slots: FridayBranchTimeSlot[];
  classEntry: FridayBranchClass | null;
  slotId: string | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (slotId: string, classEntry: FridayBranchClass, previousSlotId?: string) => void;
};

export default function FridayBranchClassEditSheet({
  open,
  theme,
  C,
  slots,
  classEntry,
  slotId,
  isNew,
  onClose,
  onSave,
}: FridayBranchClassEditSheetProps) {
  const [draft, setDraft] = useState<FridayBranchClass | null>(classEntry);
  const [draftSlotId, setDraftSlotId] = useState(slotId ?? slots[0]?.id ?? "");
  const previousSlotId = slotId;

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setDraft(classEntry);
      setDraftSlotId(slotId ?? slots[0]?.id ?? "");
    });
  }, [open, classEntry, slotId, slots]);

  const slotOptions = useMemo(
    () =>
      slots.map((slot) => ({
        value: slot.id,
        label: slot.time || "Untitled time",
      })),
    [slots],
  );

  if (!draft) return null;

  const title = isNew ? "Add a class" : `Edit ${classEntry?.name || "class"}`;
  const fieldInputStyle = fridayBranchFieldInputStyle(theme, C);

  const handleSave = () => {
    if (!draftSlotId) return;
    onSave(draftSlotId, draft, previousSlotId ?? undefined);
    onClose();
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Update the class details families and staff need."
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
            Save class
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4" style={{ fontFamily: theme.fontBody }}>
        <label className="block">
          <FridayBranchFieldLabel C={C}>Class name</FridayBranchFieldLabel>
          <input
            className={FRIDAY_BRANCH_FIELD_INPUT_CLASS}
            style={fieldInputStyle}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            aria-label="Class name"
          />
        </label>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className="block">
            <FridayBranchFieldLabel C={C}>Time slot</FridayBranchFieldLabel>
            <FridayBranchSelect
              C={C}
              theme={theme}
              value={draftSlotId}
              onChange={setDraftSlotId}
              options={slotOptions}
              placeholder="Choose time slot"
              ariaLabel="Time slot"
            />
          </label>
          <label className="block">
            <FridayBranchFieldLabel C={C}>Age group</FridayBranchFieldLabel>
            <FridayBranchTextInput
              theme={theme}
              C={C}
              value={draft.ageGroup}
              onChange={(ageGroup) => setDraft({ ...draft, ageGroup })}
              placeholder="e.g. K–3, 9–12 yr"
              ariaLabel="Age group"
            />
          </label>
        </div>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Location</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={draft.location}
            onChange={(location) => setDraft({ ...draft, location })}
            placeholder="e.g. La Casita, off-site"
            ariaLabel="Location"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Class leader</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={draft.teacher ?? ""}
            onChange={(teacher) => setDraft({ ...draft, teacher })}
            placeholder="e.g. staff member, parent volunteer, guest instructor"
            ariaLabel="Class leader"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Capacity (optional)</FridayBranchFieldLabel>
          <input
            type="number"
            min={1}
            className={FRIDAY_BRANCH_FIELD_INPUT_CLASS}
            style={fieldInputStyle}
            value={draft.capacity ?? ""}
            onChange={(event) => {
              const raw = event.target.value.trim();
              if (!raw) {
                setDraft({ ...draft, capacity: null });
                return;
              }
              const parsed = Number.parseInt(raw, 10);
              setDraft({
                ...draft,
                capacity: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
              });
            }}
            placeholder="Leave blank for unlimited"
            aria-label="Capacity"
          />
        </label>

        <FridayBranchFamilyVisibilityToggle
          C={C}
          theme={theme}
          checked={draft.familyVisible ?? true}
          onChange={(familyVisible) => setDraft({ ...draft, familyVisible })}
        />
      </div>
    </SchoolAdminSlideOverShell>
  );
}
