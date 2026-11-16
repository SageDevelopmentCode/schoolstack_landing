"use client";

import { useMemo } from "react";
import { DetailButton } from "@/components/school-admin/admissions/detail-garden";
import { Loader2, Trash2 } from "lucide-react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GChip } from "@/components/school-parent/garden/ui";
import { gIconBtn, gInputClass } from "@/components/school-admin/garden/kit";
import { gardenToggleChip } from "@/components/school-admin/schedule/garden/availability-garden";
import {
  ALL_DAY_TIME_SLOT,
  formatGradeValuesLabel,
  formatObservationSlotLabel,
  formatObservationSlotTimeLabel,
  getShadowDayTimeWindowPresets,
  type ObservationSlot,
} from "@/lib/admissions/admissions-observation-slots";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type ObservationSlotDraft = {
  gradeValues: string[];
  startTime: string;
  endTime: string | null;
  label: string;
  presetId?: string;
};

type ObservationSlotRowProps = {
  C: AdminThemeTokens;
  slot: ObservationSlot;
  booked: boolean;
  readOnly?: boolean;
  onDelete?: () => void;
  /** Garden: this row's removal is in flight. */
  removing?: boolean;
};

export function ObservationSlotRow({
  C,
  slot,
  booked,
  readOnly = false,
  onDelete,
  removing = false,
}: ObservationSlotRowProps) {
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <div
        className={`flex items-start justify-between gap-2 rounded-[14px] border-[1.5px] px-3 py-2.5 transition-opacity ${
          booked ? "border-[#b7791f]/50 bg-[#fdf3dc]" : "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]"
        } ${removing ? "opacity-60" : ""}`}
      >
        <div className="min-w-0">
          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">{formatObservationSlotLabel(slot)}</p>
          <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
            {formatObservationSlotTimeLabel(slot)}
            {slot.gradeValues.length > 0 ? ` · ${formatGradeValuesLabel(slot.gradeValues)}` : " · All grades"}
          </p>
          {booked ? <GChip tone="warning" className="mt-1.5">Booked</GChip> : null}
        </div>
        {!readOnly && !booked && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={removing}
            aria-busy={removing || undefined}
            className={gIconBtn}
            aria-label={`Remove ${formatObservationSlotLabel(slot)}`}
          >
            {removing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <div
      className="rounded-sm border px-3 py-2"
      style={{
        borderColor: booked ? C.warning : C.border,
        backgroundColor: booked ? C.warningBg : C.surface,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
            {formatObservationSlotLabel(slot)}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
            {formatObservationSlotTimeLabel(slot)}
            {slot.gradeValues.length > 0
              ? ` · ${formatGradeValuesLabel(slot.gradeValues)}`
              : " · All grades"}
          </p>
          {booked ? (
            <p className="mt-1 text-[11px] font-medium" style={{ color: C.warning }}>
              Booked
            </p>
          ) : null}
        </div>
        {!readOnly && !booked && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-sm p-1"
            style={{ color: C.textTertiary }}
            aria-label="Remove slot"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

type ObservationSlotFormProps = {
  C: AdminThemeTokens;
  includeTime: boolean;
  draft: ObservationSlotDraft;
  onDraftChange: (draft: ObservationSlotDraft) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
};

export function ObservationSlotForm({
  C,
  includeTime,
  draft,
  onDraftChange,
  onSubmit,
  submitting = false,
  submitLabel = "Add slot",
}: ObservationSlotFormProps) {
  const presets = useMemo(() => getShadowDayTimeWindowPresets(), []);

  function toggleGrade(value: string) {
    const next = draft.gradeValues.includes(value)
      ? draft.gradeValues.filter((entry) => entry !== value)
      : [...draft.gradeValues, value];
    onDraftChange({ ...draft, gradeValues: next });
  }

  function applyPreset(presetId: string) {
    const preset = presets.find((entry) => entry.id === presetId);
    if (!preset) return;
    onDraftChange({
      ...draft,
      presetId,
      startTime: preset.startTime,
      endTime: preset.endTime,
    });
  }

  const canSubmit =
    draft.gradeValues.length > 0 &&
    (!includeTime || (draft.startTime.trim() && draft.endTime?.trim()));
  const skin = useAdminGardenSkin();

  if (skin) {
    const missing =
      draft.gradeValues.length === 0
        ? "Pick at least one grade to add this slot."
        : includeTime && !(draft.startTime.trim() && draft.endTime?.trim())
          ? "Set a start and end time."
          : null;
    return (
      <div className="flex flex-col gap-3.5 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Add a slot</p>
        <div>
          <p className="m-0 mb-2 text-[13px] font-extrabold text-[var(--sf-ink)]">Which grades can shadow on this day?</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Grades">
            {STUDENT_GRADE_OPTIONS.map((option) => {
              const selected = draft.gradeValues.includes(option.value);
              return (
                <button key={option.value} type="button" aria-pressed={selected} onClick={() => toggleGrade(option.value)} className={gardenToggleChip(selected)}>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        {includeTime ? (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[13px] font-extrabold text-[var(--sf-ink)]">What time window?</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Time window">
              {presets.map((preset) => {
                const selected = draft.presetId === preset.id;
                return (
                  <button key={preset.id} type="button" aria-pressed={selected} onClick={() => applyPreset(preset.id)} className={gardenToggleChip(selected)}>
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-[var(--sf-soft)]">Start</span>
                <input
                  type="text"
                  value={draft.startTime}
                  onChange={(event) => onDraftChange({ ...draft, presetId: undefined, startTime: event.target.value })}
                  placeholder="9:00 AM"
                  className={gInputClass(null)}
                  data-garden-skip
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-[var(--sf-soft)]">End</span>
                <input
                  type="text"
                  value={draft.endTime ?? ""}
                  onChange={(event) => onDraftChange({ ...draft, presetId: undefined, endTime: event.target.value })}
                  placeholder="12:00 PM"
                  className={gInputClass(null)}
                  data-garden-skip
                />
              </label>
            </div>
          </div>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-extrabold text-[var(--sf-ink)]">
            Label <span className="text-[12px] font-bold text-[var(--sf-soft)]">Optional</span>
          </span>
          <input
            type="text"
            value={draft.label}
            onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
            placeholder="e.g. 9th grade shadow morning"
            className={gInputClass(null)}
            data-garden-skip
          />
        </label>
        {missing ? <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">{missing}</p> : null}
        <DetailButton kind="primary" C={C} type="button" disabled={!canSubmit || submitting} onClick={onSubmit} storyClassName="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </DetailButton>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-sm border p-3" style={{ borderColor: C.border }}>
      <div>
        <p className="mb-2 text-[11px] font-medium" style={{ color: C.textSecondary }}>
          Which grades can shadow on this day?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STUDENT_GRADE_OPTIONS.map((option) => {
            const selected = draft.gradeValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleGrade(option.value)}
                className="rounded-sm border px-2 py-1 text-[11px] font-medium transition"
                style={{
                  borderColor: selected ? C.accent : C.border,
                  backgroundColor: selected ? C.accentLight : C.surface,
                  color: selected ? C.accentDark : C.textSecondary,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {includeTime ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium" style={{ color: C.textSecondary }}>
            What time window?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const selected = draft.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="rounded-sm border px-2 py-1 text-[11px] font-medium"
                  style={{
                    borderColor: selected ? C.accent : C.border,
                    backgroundColor: selected ? C.accentLight : C.surface,
                    color: selected ? C.accentDark : C.textSecondary,
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px]" style={{ color: C.textTertiary }}>
                Start
              </span>
              <input
                type="text"
                value={draft.startTime}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    presetId: undefined,
                    startTime: event.target.value,
                  })
                }
                placeholder="9:00 AM"
                className="w-full rounded-sm border px-2 py-1.5 text-xs"
                style={{ borderColor: C.border, color: C.textPrimary }}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px]" style={{ color: C.textTertiary }}>
                End
              </span>
              <input
                type="text"
                value={draft.endTime ?? ""}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    presetId: undefined,
                    endTime: event.target.value,
                  })
                }
                placeholder="12:00 PM"
                className="w-full rounded-sm border px-2 py-1.5 text-xs"
                style={{ borderColor: C.border, color: C.textPrimary }}
              />
            </label>
          </div>
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-[11px] font-medium" style={{ color: C.textSecondary }}>
          Label (optional)
        </span>
        <input
          type="text"
          value={draft.label}
          onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
          placeholder="e.g. 9th grade shadow morning"
          className="w-full rounded-sm border px-2 py-1.5 text-xs"
          style={{ borderColor: C.border, color: C.textPrimary }}
        />
      </label>

      <DetailButton
 kind="primary"
 C={C}
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
        storyClassName="w-full rounded-sm px-3 py-2 text-xs font-medium transition enabled:hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </DetailButton>
    </div>
  );
}

export function createDefaultObservationSlotDraft(includeTime: boolean): ObservationSlotDraft {
  const presets = getShadowDayTimeWindowPresets();
  const morning = presets[0];

  return {
    gradeValues: [],
    startTime: includeTime ? (morning?.startTime ?? "6:00 AM") : ALL_DAY_TIME_SLOT,
    endTime: includeTime ? (morning?.endTime ?? "11:30 AM") : null,
    label: "",
    presetId: includeTime ? morning?.id : undefined,
  };
}
