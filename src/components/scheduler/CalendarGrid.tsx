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

/** Day cells for variant="demoGarden" (literal classes; needs `.sf-garden`). */
const DEMO_GARDEN_DAY = {
  available:
    "cursor-pointer bg-[var(--sf-mint)]/70 font-extrabold text-[var(--sf-forest)] hover:-translate-y-0.5 hover:ring-2 hover:ring-[var(--sf-forest)]/40",
  selected:
    "cursor-pointer border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]",
  unavailable: "cursor-default font-semibold text-[var(--sf-ink)]/25",
} as const;

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
  variant = "default",
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
  /**
   * "garden": admin Garden pages (rounded tiles, bolder type).
   * "demoGarden": the MudKitchen book-a-demo scheduler; needs a `.sf-garden` ancestor.
   */
  variant?: "default" | "demoStory" | "garden" | "demoGarden";
}) {
  const garden = variant === "garden";
  const demoGarden = variant === "demoGarden";
  const cellSizeClass =
    variant === "demoStory" || demoGarden
      ? "h-[43px] w-full min-w-0"
      : garden
        ? "h-10 w-full min-w-0 max-w-[52px] sm:h-11"
      : largeCells
        ? "h-11 w-11 sm:h-10 sm:w-10"
        : "h-10 w-10";
  const gridGapClass =
    variant === "demoStory" || garden || demoGarden ? "gap-1.5" : "gap-y-1";
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
              demoGarden
                ? "py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]"
                : garden
                ? "py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em]"
                : colors
                  ? "text-center text-[11px] font-medium font-secondary py-1"
                  : "text-center text-[11px] font-medium font-secondary text-text-faint py-1"
            }
            style={colors && !demoGarden ? { color: colors.textFaint } : undefined}
          >
            {d}
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-7 ${gridGapClass}`}>
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

          if (demoGarden && !editable) {
            const state = isSelected
              ? "selected"
              : isSelectable && hasSlots
                ? "available"
                : "unavailable";
            return (
              <button
                key={key}
                type="button"
                disabled={!isSelectable}
                onClick={() => isSelectable && onSelect(key)}
                aria-pressed={isSelectable ? isSelected : undefined}
                className={`relative flex ${cellSizeClass} items-center justify-center rounded-[12px] text-[13px] tabular-nums transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 ${DEMO_GARDEN_DAY[state]}`}
              >
                {day}
                {state === "available" ? (
                  <span
                    className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[var(--sf-forest)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          }

          if (colors) {
            if (variant === "demoStory" && !editable) {
              const showAvailDot = hasSlots && isSelectable && !isSelected;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => isSelectable && onSelect(key)}
                  className={`relative flex ${cellSizeClass} items-center justify-center rounded-[11px] text-[12px] font-medium transition-all duration-150`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: colors.accent,
                          color: "#FFFFFF",
                          fontWeight: 800,
                        }
                      : isSelectable && hasSlots
                        ? {
                            backgroundColor: "#F2F6F0",
                            color: "#456351",
                            fontWeight: 500,
                            cursor: "pointer",
                          }
                        : {
                            color: "#B7BFB7",
                            backgroundColor: "transparent",
                            cursor: "default",
                          }
                  }
                >
                  {day}
                  {showAvailDot ? (
                    <span
                      className="absolute bottom-1.5 h-[3px] w-[3px] rounded-full bg-[#8AAF91]"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            }

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
                aria-pressed={garden ? isSelected : undefined}
                className={`relative mx-auto flex ${cellSizeClass} flex-col items-center justify-center ${
                  garden
                    ? "rounded-[12px] text-[14px] font-extrabold tabular-nums focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35"
                    : "rounded-admin-sm text-[14px] font-medium font-secondary"
                } transition-all duration-150 ${
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
                    ? {
                        ...getEditableDayStyle(editableState, colors),
                        ...(garden && editableState === "selected"
                          ? { border: "2px solid var(--sf-ink)", boxShadow: "0 2px 0 0 var(--sf-ink)" }
                          : {}),
                      }
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
