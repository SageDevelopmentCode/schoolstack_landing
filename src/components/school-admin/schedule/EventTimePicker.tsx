"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Clock } from "lucide-react";
import {
  formatTimeFromMinutes,
  parseTimeToMinutes,
} from "@/lib/school-events/calendar-time";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"] as const;

type TimeParts = {
  hour: number;
  minute: number;
  period: (typeof PERIODS)[number];
};

function partsFromValue(value: string): TimeParts | null {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return null;

  const h24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period: (typeof PERIODS)[number] = h24 >= 12 ? "PM" : "AM";
  let hour = h24 % 12;
  if (hour === 0) hour = 12;

  return { hour, minute, period };
}

function valueFromParts(parts: TimeParts): string {
  let h24 = parts.hour % 12;
  if (parts.period === "PM") h24 += 12;
  if (parts.period === "AM" && parts.hour === 12) h24 = 0;
  if (parts.period === "PM" && parts.hour === 12) h24 = 12;

  return `${String(h24).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function nearestMinute(minute: number): number {
  const options = MINUTES.map(Number);
  return options.reduce((best, current) =>
    Math.abs(current - minute) < Math.abs(best - minute) ? current : best,
  );
}

function partsToMinutes(parts: TimeParts): number {
  let h24 = parts.hour % 12;
  if (parts.period === "PM") h24 += 12;
  if (parts.period === "AM" && parts.hour === 12) h24 = 0;
  if (parts.period === "PM" && parts.hour === 12) h24 = 12;
  return h24 * 60 + parts.minute;
}

function formatPartsDisplay(parts: TimeParts): string {
  return formatTimeFromMinutes(partsToMinutes(parts));
}

type EventTimePickerProps = {
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
};

function ColumnButton({
  label,
  selected,
  onClick,
  C,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  C: AdminThemeTokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md px-2 py-1.5 text-center text-sm transition-colors"
      style={{
        backgroundColor: selected ? C.accentLight : "transparent",
        color: selected ? C.accent : C.textPrimary,
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

export default function EventTimePicker({
  C,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: EventTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parts = useMemo(() => {
    const parsed = partsFromValue(value);
    if (parsed) return parsed;
    return { hour: 9, minute: 0, period: "AM" as const };
  }, [value]);

  const display = formatPartsDisplay(parts);

  const updateParts = (next: Partial<TimeParts>) => {
    const merged = { ...parts, ...next };
    if (next.minute === undefined && value) {
      merged.minute = nearestMinute(parts.minute);
    }
    onChange(valueFromParts(merged));
  };

  useEffect(() => {
    if (!open || value) return;
    onChange(valueFromParts(parts));
  }, [open, value, parts, onChange]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: C.inputBorder,
          color: C.textPrimary,
          backgroundColor: C.input,
          ...({ "--tw-ring-color": `${C.accent}40` } as CSSProperties),
        }}
      >
        <span className="min-w-0 truncate">{display}</span>
        <Clock className="h-4 w-4 shrink-0" style={{ color: C.textTertiary }} />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-50 mt-1 rounded-md border p-2 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
          role="dialog"
          aria-label={ariaLabel}
        >
          <div className="grid grid-cols-3 gap-1">
            <div className="max-h-48 overflow-y-auto">
              {HOURS.map((hour) => (
                <ColumnButton
                  key={hour}
                  label={String(hour)}
                  selected={parts.hour === hour}
                  onClick={() => updateParts({ hour })}
                  C={C}
                />
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {MINUTES.map((minute) => (
                <ColumnButton
                  key={minute}
                  label={minute}
                  selected={parts.minute === Number(minute)}
                  onClick={() => updateParts({ minute: Number(minute) })}
                  C={C}
                />
              ))}
            </div>
            <div>
              {PERIODS.map((period) => (
                <ColumnButton
                  key={period}
                  label={period}
                  selected={parts.period === period}
                  onClick={() => updateParts({ period })}
                  C={C}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
