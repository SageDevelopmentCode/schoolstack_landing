"use client";

import PopupTimePicker from "@/components/school-events/PopupTimePicker";
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
}: SchoolAdminDateTimePickerProps) {
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
