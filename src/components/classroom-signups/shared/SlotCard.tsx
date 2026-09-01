"use client";

import { Check, Clock } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ClassroomSignupTimeSlot } from "@/lib/classroom-signups/types";

type SlotCardProps = {
  theme: ParentThemeTokens;
  slot: ClassroomSignupTimeSlot;
  fillCount: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  readOnly?: boolean;
};

function formatTimeRange(start: string, end: string): string {
  const format = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };
  return `${format(start)} – ${format(end)}`;
}

export default function SlotCard({
  theme,
  slot,
  fillCount,
  selected = false,
  disabled = false,
  onSelect,
  readOnly = false,
}: SlotCardProps) {
  const isFull = fillCount >= slot.capacity;
  const isTaken = isFull && !selected;
  const interactive = !readOnly && onSelect && !isTaken;

  return (
    <button
      type="button"
      disabled={!interactive || disabled}
      onClick={interactive ? onSelect : undefined}
      className="w-full rounded-[14px] border p-4 text-left transition-colors"
      style={{
        borderColor: selected ? theme.primary : "#DCE4DC",
        backgroundColor: selected ? "#E9F2EA" : theme.white,
        opacity: isTaken ? 0.65 : 1,
        cursor: interactive ? "pointer" : "default",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            {slot.label}
          </p>
          <div
            className="mt-1 flex items-center gap-1.5 text-xs"
            style={{ color: "#76828A" }}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
          </div>
          {slot.date ? (
            <p className="mt-1 text-xs" style={{ color: "#76828A" }}>
              {new Date(`${slot.date}T12:00:00`).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">
          {selected ? (
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primary, color: theme.white }}
            >
              <Check className="h-4 w-4" />
            </span>
          ) : isTaken ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ backgroundColor: "#F0F0F0", color: "#76828A" }}
            >
              Taken
            </span>
          ) : (
            <span className="text-xs font-medium" style={{ color: theme.primary }}>
              {fillCount}/{slot.capacity}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
