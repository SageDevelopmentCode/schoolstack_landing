"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "@/lib/school-admin/friday-branch/friday-branch-types";

const MOCK_LOCATIONS = [
  "The Meadow",
  "La Casita",
  "Garden Room",
  "Various off-site locations",
];

const MOCK_AGE_GROUPS = [
  "K – 3",
  "4 – 8",
  "6 – 8",
  "9 yr – 12 yr",
  "All ages",
];

const MOCK_TEACHERS = [
  "Jazmin Caballero",
  "Jordin Ross",
  "Rachael Sparhawk",
  "Celeste Velazquez",
];

type FridayBranchClassEditModalProps = {
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

const inputClass =
  "w-full rounded-[9px] border px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#315E4F]/20";

export default function FridayBranchClassEditModal({
  open,
  theme,
  C,
  slots,
  classEntry,
  slotId,
  isNew,
  onClose,
  onSave,
}: FridayBranchClassEditModalProps) {
  const [draft, setDraft] = useState<FridayBranchClass | null>(classEntry);
  const [draftSlotId, setDraftSlotId] = useState(slotId ?? slots[0]?.id ?? "");
  const previousSlotId = slotId;

  useEffect(() => {
    if (!open) return;
    setDraft(classEntry);
    setDraftSlotId(slotId ?? slots[0]?.id ?? "");
  }, [open, classEntry, slotId, slots]);

  if (!draft) return null;

  const title = isNew ? "Add a class" : `Edit ${classEntry?.name || "class"}`;

  const handleSave = () => {
    if (!draftSlotId) return;
    onSave(draftSlotId, draft, previousSlotId ?? undefined);
    onClose();
  };

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="lg"
      ariaLabelledBy="fb-class-modal-title"
      panelClassName="!rounded-[19px]"
    >
      <header
        className="flex items-start justify-between gap-3 border-b px-[21px] py-[19px]"
        style={{ borderColor: "#E4EBE4" }}
      >
        <div>
          <AdminSectionKicker theme={theme}>Friday Branch schedule</AdminSectionKicker>
          <h2
            id="fb-class-modal-title"
            className="mt-1 font-heading text-[21px] font-semibold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
            Update the class details families and staff need.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1.5 text-[11px] font-bold"
          style={{ backgroundColor: "#EDF4EE", color: theme.primary }}
        >
          Close ×
        </button>
      </header>

      <main className="px-[21px] py-5">
        <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#7D8B8E" }}>
          Class name
        </label>
        <input
          className={inputClass}
          style={{ borderColor: "#DCE6DD", color: C.textPrimary }}
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#7D8B8E" }}>
              Time slot
            </label>
            <select
              className={inputClass}
              style={{ borderColor: "#DCE6DD", color: C.textPrimary }}
              value={draftSlotId}
              onChange={(event) => setDraftSlotId(event.target.value)}
            >
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.time || "Untitled time"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#7D8B8E" }}>
              Age group
            </label>
            <select
              className={inputClass}
              style={{ borderColor: "#DCE6DD", color: C.textPrimary }}
              value={draft.ageGroup}
              onChange={(event) => setDraft({ ...draft, ageGroup: event.target.value })}
            >
              <option value="">Choose age group</option>
              {MOCK_AGE_GROUPS.map((age) => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="mb-1 mt-3 block text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#7D8B8E" }}>
          Location
        </label>
        <select
          className={inputClass}
          style={{ borderColor: "#DCE6DD", color: C.textPrimary }}
          value={draft.location}
          onChange={(event) => setDraft({ ...draft, location: event.target.value })}
        >
          <option value="">Choose location</option>
          {MOCK_LOCATIONS.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>

        <label className="mb-1 mt-3 block text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#7D8B8E" }}>
          Teaching guide
        </label>
        <select
          className={inputClass}
          style={{ borderColor: "#DCE6DD", color: C.textPrimary }}
          value={draft.teacher ?? ""}
          onChange={(event) => setDraft({ ...draft, teacher: event.target.value })}
        >
          <option value="">Choose a guide</option>
          {MOCK_TEACHERS.map((teacher) => (
            <option key={teacher} value={teacher}>{teacher}</option>
          ))}
        </select>

        <label className="mt-4 flex items-center gap-2 border-t pt-3 text-xs" style={{ borderColor: "#E9EFEA", color: C.textPrimary }}>
          <input
            type="checkbox"
            checked={draft.familyVisible ?? true}
            onChange={(event) => setDraft({ ...draft, familyVisible: event.target.checked })}
            className="accent-[#315E4F]"
          />
          Visible to families when this block is published
        </label>
      </main>

      <footer
        className="flex justify-end gap-2 border-t px-[21px] py-3"
        style={{ borderColor: "#E4EBE4", backgroundColor: "#FBFCFB" }}
      >
        <AdminButton theme={theme} variant="outline" type="button" onClick={onClose}>
          Cancel
        </AdminButton>
        <AdminButton theme={theme} variant="primary" type="button" onClick={handleSave}>
          Save class
        </AdminButton>
      </footer>
    </SchoolAdminModalShell>
  );
}
