"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  ALL_DAY_TIME_SLOT,
  formatGradeValuesLabel,
  formatObservationSlotLabel,
  formatObservationSlotTimeLabel,
  getShadowDayTimeWindowPresets,
  type ObservationSlot,
} from "@/lib/admissions/admissions-observation-slots";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
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
};

export function ObservationSlotRow({
  C,
  slot,
  booked,
  readOnly = false,
  onDelete,
}: ObservationSlotRowProps) {
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

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
        className="w-full rounded-sm px-3 py-2 text-xs font-medium transition enabled:hover:opacity-90 disabled:opacity-60"
        style={getAdminButtonStyle(C, "primary")}
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
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
