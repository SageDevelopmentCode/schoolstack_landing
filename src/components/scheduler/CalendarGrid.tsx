import { DAY_NAMES, dateKey, isPastDate } from "@/lib/demo-scheduler";

export function CalendarGrid({
  year,
  month,
  selected,
  onSelect,
  availableDates,
  minDate,
  editable = false,
}: {
  year: number;
  month: number;
  selected: string | null;
  onSelect: (date: string) => void;
  availableDates: Set<string>;
  minDate?: string;
  /** Admin mode: any non-past date is selectable; availableDates only highlights configured days */
  editable?: boolean;
}) {
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
            className="text-center text-[11px] font-medium font-secondary text-text-faint py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const key = dateKey(year, month, day);
          const isBeforeMin = minDate ? key < minDate : isPastDate(key);
          const hasSlots = availableDates.has(key);
          const isSelectable = editable ? !isBeforeMin : hasSlots && !isBeforeMin;
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!isSelectable}
              onClick={() => isSelectable && onSelect(key)}
              className={`mx-auto w-10 h-10 rounded-full text-[14px] font-medium font-secondary flex items-center justify-center transition-all duration-150 ${
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
