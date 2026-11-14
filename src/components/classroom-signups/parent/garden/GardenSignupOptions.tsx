"use client";

import { Clock } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { DateStamp, GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ClassroomSignupRole, ClassroomSignupTimeSlot } from "@/lib/classroom-signups/types";
import { formatTimeRange, slotDateLabel } from "./signups-garden-ui";

/*
 * Garden choice tiles for the parent signup drawer. Parent-only: the teacher
 * portal keeps shared/SlotCard and shared/RoleCard.
 * Selection rules are unchanged: a full slot/role can't be picked unless it's
 * already yours; read-only disables every tile.
 */

const TILE = `group flex w-full items-start gap-3 rounded-[18px] border-2 p-3.5 text-left transition-all duration-200 ${G_FOCUS}`;
const TILE_ON = "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] shadow-[0_3px_0_0_var(--sf-clay)]";
const TILE_OFF = "border-[var(--sf-ink)]/12 bg-white";
const TILE_HOVER = "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35";

function Marker({ selected, shape }: { selected: boolean; shape: "radio" | "checkbox" }) {
  if (selected) return <Tick className="h-7 w-7" color="#fff" fill="var(--sf-clay)" />;
  return (
    <span
      aria-hidden="true"
      className={`block h-7 w-7 shrink-0 border-2 border-[var(--sf-ink)]/40 bg-white ${shape === "radio" ? "rounded-full" : "rounded-[9px]"}`}
    />
  );
}

export function GardenSlotOption({
  slot,
  fillCount,
  selected,
  disabled,
  multiple,
  onSelect,
}: {
  slot: ClassroomSignupTimeSlot;
  fillCount: number;
  selected: boolean;
  disabled: boolean;
  multiple: boolean;
  onSelect: () => void;
}) {
  const isFull = fillCount >= slot.capacity;
  const isTaken = isFull && !selected;
  const interactive = !disabled && !isTaken;
  const left = Math.max(slot.capacity - fillCount, 0);
  const dateLabel = slotDateLabel(slot);

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={!interactive}
      onClick={interactive ? onSelect : undefined}
      data-testid={`parent-signup-slot-${slot.id}`}
      className={`${TILE} ${selected ? TILE_ON : TILE_OFF} ${interactive ? TILE_HOVER : "cursor-default"} ${isTaken ? "opacity-60" : ""}`}
    >
      {dateLabel ? <DateStamp date={slot.date} size="sm" className="bg-white" /> : null}
      <span className="min-w-0 flex-1 self-center">
        <span className="block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{slot.label}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatTimeRange(slot.startTime, slot.endTime)}
        </span>
        {dateLabel ? <span className="sr-only">{dateLabel}</span> : null}
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {selected ? (
            <GChip tone="success">Selected</GChip>
          ) : isTaken ? (
            <GChip tone="neutral">Full</GChip>
          ) : (
            <GChip tone={left === 1 ? "warning" : "info"}>
              {left} of {slot.capacity} spot{slot.capacity === 1 ? "" : "s"} left
            </GChip>
          )}
        </span>
      </span>
      <span className="self-center">
        <Marker selected={selected} shape={multiple ? "checkbox" : "radio"} />
      </span>
    </button>
  );
}

export function GardenRoleOption({
  role,
  fillCount,
  selected,
  disabled,
  onToggle,
}: {
  role: ClassroomSignupRole;
  fillCount: number;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const isFull = fillCount >= role.quantityNeeded;
  const interactive = !disabled && (!isFull || selected);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={!interactive}
      onClick={interactive ? onToggle : undefined}
      data-testid={`parent-signup-role-${role.id}`}
      className={`${TILE} ${selected ? TILE_ON : TILE_OFF} ${interactive ? TILE_HOVER : "cursor-default"} ${isFull && !selected ? "opacity-60" : ""}`}
    >
      <Marker selected={selected} shape="checkbox" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{role.name}</span>
          {isFull && !selected ? (
            <GChip tone="neutral">Full</GChip>
          ) : (
            <GChip tone={selected ? "success" : "info"}>
              {fillCount}/{role.quantityNeeded} filled
            </GChip>
          )}
        </span>
        {role.description ? (
          <span className="mt-1 block text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {role.description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
