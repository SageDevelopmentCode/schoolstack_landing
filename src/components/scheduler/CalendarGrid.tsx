import { DAY_NAMES, dateKey, isPastDate } from "@/lib/demo-scheduler";

export interface CalendarGridColors {
  accent: string;
  accentLight: string;
  text: string;
  textFaint: string;
}

export function CalendarGrid({
  year,
  month,
  selected,
  selectedDates,
  onSelect,
  availableDates,
  minDate,
  maxDate,
  editable = false,
  colors,
  largeCells = false,
}: {
  year: number;
  month: number;
  selected: string | null;
  selectedDates?: Set<string>;
  onSelect: (date: string) => void;
  availableDates: Set<string>;
  minDate?: string;
  maxDate?: string;
  /** Admin mode: any non-past date is selectable; availableDates only highlights configured days */
  editable?: boolean;
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
          const isSelectable = editable
            ? !isBeforeMin && !isAfterMax
            : hasSlots && !isBeforeMin && !isAfterMax;
          const isSelected = selectedDates?.has(key) ?? selected === key;

          if (colors) {
            return (
              <button
                key={key}
                type="button"
                disabled={!isSelectable}
                onClick={() => isSelectable && onSelect(key)}
                className={`mx-auto flex ${cellSizeClass} items-center justify-center rounded-admin-sm text-[14px] font-medium font-secondary transition-all duration-150`}
                style={
                  isSelected
                    ? { backgroundColor: colors.accent, color: "#FFFFFF" }
                    : isSelectable
                      ? hasSlots
                        ? {
                            backgroundColor: colors.accentLight,
                            color: colors.accent,
                            cursor: "pointer",
                          }
                        : { color: colors.text, cursor: "pointer" }
                      : { color: colors.textFaint, cursor: "default" }
                }
              >
                {day}
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
