"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  formatSelectedDate,
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
} from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationDatePickerProps = {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  C: AdminThemeTokens;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string | null;
};

function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
}

function buildYearOptions(minDate?: string, maxDate?: string): number[] {
  const today = new Date();
  const defaultMin = today.getFullYear() - 120;
  const defaultMax = today.getFullYear();

  const minYear = minDate ? Number(minDate.slice(0, 4)) : defaultMin;
  const maxYear = maxDate ? Number(maxDate.slice(0, 4)) : defaultMax;

  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
}

function isDateInRange(iso: string, minDate?: string, maxDate?: string): boolean {
  if (minDate && iso < minDate) return false;
  if (maxDate && iso > maxDate) return false;
  return true;
}

export default function ApplicationDatePicker({
  id,
  value,
  onChange,
  C,
  disabled = false,
  minDate,
  maxDate,
  placeholder = "Select date…",
  error = null,
}: ApplicationDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);

  const parsed = parseIsoDate(value);
  const initialView = parsed ?? todayMonthYear();
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const calendarColors = useMemo(
    () => ({
      accent: C.accent,
      accentLight: C.accentLight,
      text: C.textPrimary,
      textFaint: C.textTertiary,
    }),
    [C.accent, C.accentLight, C.textPrimary, C.textTertiary],
  );

  const yearOptions = useMemo(
    () => buildYearOptions(minDate, maxDate),
    [minDate, maxDate],
  );

  const today = todayKey();
  const todaySelectable = isDateInRange(today, minDate, maxDate);

  const inputStyle = {
    borderColor: error ? C.errorBorder : C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openPicker = () => {
    if (disabled) return;
    const nextView = parsed ?? todayMonthYear();
    setViewYear(nextView.year);
    setViewMonth(nextView.month);
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 340;
      setOpensUpward(spaceBelow < calendarHeight && spaceAbove > spaceBelow);
    }
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const selectStyle = {
    borderColor: C.border,
    color: C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm outline-none transition focus:ring-2"
        style={{ ...inputStyle, ...focusRing }}
      >
        <span style={{ color: value ? C.textPrimary : C.textTertiary }}>
          {value ? formatSelectedDate(value) : placeholder}
        </span>
        <CalendarDays
          className="h-4 w-4 shrink-0"
          style={{ color: open ? C.accent : C.textTertiary }}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a date"
          className={`absolute left-0 right-0 z-50 rounded-md border p-3 shadow-lg ${
            opensUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
              style={{ color: C.textSecondary }}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 gap-2">
              <select
                aria-label="Month"
                value={viewMonth}
                onChange={(event) => setViewMonth(Number(event.target.value))}
                className="min-w-0 flex-1 rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2"
                style={{ ...selectStyle, ...focusRing }}
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={viewYear}
                onChange={(event) => setViewYear(Number(event.target.value))}
                className="w-24 shrink-0 rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2"
                style={{ ...selectStyle, ...focusRing }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
              style={{ color: C.textSecondary }}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={value || null}
            onSelect={handleSelect}
            availableDates={new Set()}
            minDate={minDate}
            maxDate={maxDate}
            editable
            colors={calendarColors}
            largeCells
          />

          <div
            className="mt-3 flex items-center justify-between border-t pt-3"
            style={{ borderColor: C.border }}
          >
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-sm font-medium transition-colors"
              style={{ color: C.textSecondary }}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={!todaySelectable}
              onClick={() => handleSelect(today)}
              className="text-sm font-medium transition-colors disabled:cursor-not-allowed"
              style={{
                color: todaySelectable ? C.accent : C.textTertiary,
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
