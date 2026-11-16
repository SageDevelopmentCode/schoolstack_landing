"use client";

import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { gInputClass } from "@/components/school-admin/garden/kit";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import { formatTimeFromMinutes, parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import {
  DEFAULT_DATETIME_LOCAL_TIME,
  joinDateTimeLocalValue,
  splitDateTimeLocalValue,
} from "@/lib/school-admin/datetime-local";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SchoolAdminDateTimePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  placeholder?: string;
  minDate?: string;
  disabled?: boolean;
  timeAriaLabel?: string;
  /** Garden only: inline error under the field. */
  error?: string | null;
  /** Garden only: accessible name for the native date-time field. */
  ariaLabel?: string;
};

function formatSummary(value: string): string | null {
  const { date, time } = splitDateTimeLocalValue(value);
  if (!date) return null;

  const timeMinutes = parseTimeToMinutes(time);
  if (timeMinutes === null) {
    return formatSelectedDate(date);
  }

  return `${formatSelectedDate(date)} at ${formatTimeFromMinutes(timeMinutes)}`;
}

export default function SchoolAdminDateTimePicker({
  id,
  value,
  onChange,
  C,
  theme,
  placeholder = "Select date…",
  minDate,
  disabled = false,
  timeAriaLabel = "Select time",
  error = null,
  ariaLabel,
}: SchoolAdminDateTimePickerProps) {
  const skin = useAdminGardenSkin();
  const bounds = schoolAdminDateRangeBounds();
  const { date, time } = splitDateTimeLocalValue(value);
  const summary = formatSummary(value);

  const handleDateChange = (nextDate: string) => {
    if (!nextDate) {
      onChange("");
      return;
    }

    onChange(joinDateTimeLocalValue(nextDate, time || DEFAULT_DATETIME_LOCAL_TIME));
  };

  const handleTimeChange = (nextTime: string) => {
    if (!date) return;
    onChange(joinDateTimeLocalValue(date, nextTime));
  };

  if (skin) {
    // Garden admin pages: one native date-time field (same YYYY-MM-DDTHH:mm value).
    return (
      <div className="space-y-1.5">
        <input
          id={id}
          type="datetime-local"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          min={minDate ? `${minDate}T00:00` : undefined}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : summary ? `${id}-summary` : undefined}
          data-garden-skip
          className={gInputClass(error)}
        />
        {error ? (
          <p id={`${id}-error`} role="alert" className="m-0 text-[12px] font-bold text-[#9a3422]">
            {error}
          </p>
        ) : summary ? (
          <div className="flex items-center justify-between gap-3">
            <p id={`${id}-summary`} className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
              {summary}
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className={`cursor-pointer rounded-full text-[12px] font-extrabold text-[var(--sf-clay-deep)] underline-offset-2 hover:underline ${G_FOCUS}`}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="grid gap-2 sm:grid-cols-2">
        <SchoolAdminDatePicker
          id={id}
          value={date}
          onChange={handleDateChange}
          C={C}
          disabled={disabled}
          minDate={minDate ?? bounds.minDate}
          maxDate={bounds.maxDate}
          placeholder={placeholder}
        />
        <PopupTimePicker
          theme={theme}
          value={time}
          onChange={handleTimeChange}
          ariaLabel={timeAriaLabel}
          disabled={disabled || !date}
          className="rounded-md py-2.5"
        />
      </div>
      {summary ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#65747A]" aria-live="polite">
            {summary}
          </p>
          <AdminTextLink theme={theme} onClick={() => onChange("")}>
            Clear
          </AdminTextLink>
        </div>
      ) : null}
    </div>
  );
}
