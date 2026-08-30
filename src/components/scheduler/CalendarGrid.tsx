import type { CSSProperties } from "react";
import { DAY_NAMES, dateKey, isPastDate } from "@/lib/demo-scheduler";

export interface CalendarGridColors {
  accent: string;
  accentLight: string;
  text: string;
  textFaint: string;
  textSecondary?: string;
  border?: string;
  bg?: string;
  warning?: string;
  warningBg?: string;
}

type EditableDayState =
  | "selected"
  | "disabled"
  | "openBooked"
  | "open"
  | "bookedOnly"
  | "closed"
  | "selectable";

function getEditableDayState({
  isSelected,
  isSelectable,
  hasSlots,
  isBooked,
  datePickerMode,
}: {
  isSelected: boolean;
  isSelectable: boolean;
  hasSlots: boolean;
  isBooked: boolean;
  datePickerMode: boolean;
}): EditableDayState {
  if (isSelected) return "selected";
  if (!isSelectable) return "disabled";
  if (hasSlots && isBooked) return "openBooked";
  if (hasSlots) return "open";
  if (isBooked) return "bookedOnly";
  if (datePickerMode) return "selectable";
  return "closed";
}

function getEditableDayStyle(
  state: EditableDayState,
  colors: CalendarGridColors,
): CSSProperties {
  switch (state) {
    case "selected":
      return { backgroundColor: colors.accent, color: "#FFFFFF" };
    case "open":
      return {
        backgroundColor: colors.accentLight,
        color: colors.accent,
        border: `2px solid ${colors.accent}`,
        fontWeight: 600,
        cursor: "pointer",
      };
    case "openBooked":
      return {
        backgroundColor: colors.accentLight,
        color: colors.accent,
        border: `2px solid ${colors.accent}`,
        fontWeight: 600,
        cursor: "pointer",
      };
    case "bookedOnly":
      return {
        backgroundColor: colors.warningBg ?? colors.accentLight,
        color: colors.warning ?? colors.accent,
        border: `2px solid ${colors.warning ?? colors.accent}`,
        fontWeight: 600,
        cursor: "pointer",
      };
    case "closed":
      return {
        backgroundColor: colors.bg ?? "transparent",
        color: colors.textSecondary ?? colors.text,
        border: `1.5px dashed ${colors.border ?? colors.textFaint}`,
        cursor: "pointer",
      };
    case "selectable":
      return { color: colors.text, cursor: "pointer" };
    case "disabled":
    default:
      return { color: colors.textFaint, cursor: "default" };
  }
}

export function CalendarGrid({
  year,
  month,
  selected,
  selectedDates,
  onSelect,
  availableDates,
  bookedDates,
  minDate,
  maxDate,
  editable = false,
  datePickerMode = false,
  colors,
  largeCells = false,
}: {
  year: number;
  month: number;
  selected: string | null;
  selectedDates?: Set<string>;
  onSelect: (date: string) => void;
  availableDates: Set<string>;
  /** Dates with at least one booking — shown with a subtle indicator */
  bookedDates?: Set<string>;
  minDate?: string;
  maxDate?: string;
  /** Admin mode: any non-past date is selectable; availableDates only highlights configured days */
  editable?: boolean;
  /** Plain date picker: selectable days without availability slots use neutral styling */
  datePickerMode?: boolean;
  colors?: CalendarGridColors;
  /** Larger day cells for touch-friendly apply-form date picking */
  largeCells?: boolean;
}) {
  const cellSizeClass = largeCells
    ? "h-11 w-11 sm:h-10 sm:w-10"
    : "h-10 w-10";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className={
              colors
                ? "text-center text-[11px] font-medium font-secondary py-1"
                : "text-center text-[11px] font-medium font-secondary text-text-faint py-1"
            }
            style={colors ? { color: colors.textFaint } : undefined}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const key = dateKey(year, month, day);
          const isBeforeMin = minDate ? key < minDate : !maxDate && isPastDate(key);
          const isAfterMax = maxDate ? key > maxDate : false;
          const hasSlots = availableDates.has(key);
          const isBooked = bookedDates?.has(key) ?? false;
          const isSelectable = editable
            ? !isBeforeMin && !isAfterMax
            : hasSlots && !isBeforeMin && !isAfterMax;
          const isSelected = selectedDates?.has(key) ?? selected === key;

          if (colors) {
            const editableState = editable
              ? getEditableDayState({
                  isSelected,
                  isSelectable,
                  hasSlots,
                  isBooked,
                  datePickerMode,
                })
              : null;
            const showBookedStripe =
              editable &&
              editableState === "openBooked" &&
              !isSelected;
            const showBookedDot =
              !editable && isBooked && !isSelected;

            return (
              <button
                key={key}
                type="button"
                disabled={!isSelectable}
                onClick={() => isSelectable && onSelect(key)}
                className={`relative mx-auto flex ${cellSizeClass} flex-col items-center justify-center rounded-admin-sm text-[14px] font-medium font-secondary transition-all duration-150 ${
                  editable && isSelectable && editableState === "closed"
                    ? "enabled:hover:brightness-[0.97]"
                    : editable &&
                        isSelectable &&
                        editableState !== "disabled" &&
                        editableState !== "selectable"
                      ? "enabled:hover:brightness-95"
                      : editable && isSelectable && editableState === "selectable"
                        ? "enabled:hover:bg-black/[0.04]"
                        : ""
                }`}
                style={
                  editable && editableState
                    ? getEditableDayStyle(editableState, colors)
                    : isSelected
                      ? { backgroundColor: colors.accent, color: "#FFFFFF" }
                      : isSelectable
                        ? hasSlots
                          ? {
                              backgroundColor: colors.accentLight,
                              color: colors.accent,
                              cursor: "pointer",
                            }
                          : isBooked
                            ? {
                                backgroundColor: colors.warningBg ?? colors.accentLight,
                                color: colors.warning ?? colors.accent,
                                cursor: "pointer",
                              }
                            : { color: colors.text, cursor: "pointer" }
                        : { color: colors.textFaint, cursor: "default" }
                }
              >
                <span>{day}</span>
                {showBookedStripe ? (
                  <span
                    className="absolute inset-x-1.5 bottom-1 h-[3px] rounded-full"
                    style={{ backgroundColor: colors.warning ?? colors.accent }}
                    aria-hidden="true"
                  />
                ) : null}
                {showBookedDot ? (
                  <span
                    className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.warning ?? colors.accent }}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              disabled={!isSelectable}
              onClick={() => isSelectable && onSelect(key)}
              className={`mx-auto ${cellSizeClass} rounded-full text-[14px] font-medium font-secondary flex items-center justify-center transition-all duration-150 ${
                isSelected
                  ? "bg-accent text-white"
                  : isSelectable
                    ? hasSlots
                      ? "text-accent bg-accent/10 hover:bg-accent/20 cursor-pointer"
                      : "text-text hover:bg-accent/10 hover:text-accent cursor-pointer"
                    : "text-text-faint cursor-default"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
