"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import FridayBranchClassFlyerUpload from "@/components/school-admin/friday-branch/FridayBranchClassFlyerUpload";
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
import { buildFridayBranchClassSavePayload } from "@/lib/school-admin/friday-branch/friday-branch-class-save";
import {
  formatFridayBranchPriceInput,
} from "@/lib/school-admin/friday-branch/friday-branch-price-utils";
import type {
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchClassEditSheetProps = {
  open: boolean;
  organizationId: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  slots: FridayBranchTimeSlot[];
  classEntry: FridayBranchClass | null;
  slotId: string | null;
  isNew: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (
    slotId: string,
    classEntry: FridayBranchClass,
    previousSlotId?: string,
  ) => Promise<void>;
};

export default function FridayBranchClassEditSheet({
  open,
  organizationId,
  theme,
  C,
  slots,
  classEntry,
  slotId,
  isNew,
  saving = false,
  onClose,
  onSave,
}: FridayBranchClassEditSheetProps) {
  const [draft, setDraft] = useState<FridayBranchClass | null>(classEntry);
  const [draftSlotId, setDraftSlotId] = useState(slotId ?? slots[0]?.id ?? "");
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const previousSlotId = slotId;
  const initializedClassIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      initializedClassIdRef.current = null;
      return;
    }

    const classId = classEntry?.id ?? null;
    if (initializedClassIdRef.current === classId) return;

    initializedClassIdRef.current = classId;
    queueMicrotask(() => {
      setDraft(classEntry ? { ...classEntry } : null);
      setDraftSlotId(slotId ?? slots[0]?.id ?? "");
      setPriceInput(formatFridayBranchPriceInput(classEntry?.priceCents));
      setPriceError(null);
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
  const isBusy = saving || isSaving;

  const handleSave = async () => {
    if (!draftSlotId || !draft || isBusy) return;

    const payload = buildFridayBranchClassSavePayload(draft, priceInput);
    if ("error" in payload) {
      setPriceError(payload.error);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(draftSlotId, payload, previousSlotId ?? undefined);
      onClose();
    } catch {
      // Parent surfaces the error toast; keep the sheet open for retry.
    } finally {
      setIsSaving(false);
    }
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
            disabled={isBusy}
            className="rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            disabled={isBusy}
            onClick={() => void handleSave()}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save class"
            )}
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
            disabled={isBusy}
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
            disabled={isBusy}
          />
        </label>

        <FridayBranchClassFlyerUpload
          C={C}
          theme={theme}
          supabase={supabase}
          organizationId={organizationId}
          classEntry={draft}
          onChange={setDraft}
        />

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
