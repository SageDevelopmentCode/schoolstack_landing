"use client";

import { Trash2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { FridayBranchClass } from "@/lib/school-admin/friday-branch/friday-branch-types";
import {
  FRIDAY_BRANCH_FIELD_CLASS,
  FRIDAY_BRANCH_TIME_FIELD_CLASS,
} from "./friday-branch-field-styles";

export const FRIDAY_BRANCH_ROW_GRID =
  "grid grid-cols-[72px_minmax(140px,1fr)_minmax(120px,1fr)_minmax(88px,120px)_32px] gap-2 items-center";

type FridayBranchClassRowProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  classEntry: FridayBranchClass;
  time: string;
  showTime: boolean;
  onTimeChange?: (time: string) => void;
  onChange: (next: FridayBranchClass) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  onRemoveSlot?: () => void;
  canRemoveSlot?: boolean;
};

export default function FridayBranchClassRow({
  C,
  theme,
  classEntry,
  time,
  showTime,
  onTimeChange,
  onChange,
  onRemove,
  canRemove = false,
  onRemoveSlot,
  canRemoveSlot = false,
}: FridayBranchClassRowProps) {
  const fieldId = (field: string) => `fb-class-${classEntry.id}-${field}`;

  return (
    <div
      className={`group ${FRIDAY_BRANCH_ROW_GRID} rounded-md px-1 py-0.5 transition-colors hover:bg-[#F8FAF8] focus-within:bg-[#F8FAF8]`}
    >
      <div className="relative flex items-center">
        {showTime ? (
          <>
            <input
              value={time}
              onChange={(event) => onTimeChange?.(event.target.value)}
              aria-label="Time"
              placeholder="9:00"
              className={FRIDAY_BRANCH_TIME_FIELD_CLASS}
              style={{ color: theme.ink }}
            />
            {canRemoveSlot && onRemoveSlot ? (
              <button
                type="button"
                onClick={onRemoveSlot}
                className="absolute -right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                style={{ color: theme.muted }}
                aria-label="Remove time slot"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            ) : null}
          </>
        ) : (
          <span className="sr-only">Same time as row above</span>
        )}
      </div>

      <input
        id={fieldId("name")}
        className={`${FRIDAY_BRANCH_FIELD_CLASS}${showTime ? "" : " pl-3"}`}
        value={classEntry.name}
        onChange={(event) => onChange({ ...classEntry, name: event.target.value })}
        placeholder="Class name"
        aria-label="Class name"
        style={{ color: theme.ink }}
      />

      <input
        id={fieldId("location")}
        value={classEntry.location}
        onChange={(event) => onChange({ ...classEntry, location: event.target.value })}
        placeholder="Location"
        aria-label="Location"
        className={FRIDAY_BRANCH_FIELD_CLASS}
        style={{ color: theme.ink }}
      />

      <input
        id={fieldId("age")}
        value={classEntry.ageGroup}
        onChange={(event) => onChange({ ...classEntry, ageGroup: event.target.value })}
        placeholder="Age group"
        aria-label="Age group"
        className={FRIDAY_BRANCH_FIELD_CLASS}
        style={{ color: theme.ink }}
      />

      <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {canRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 transition-colors hover:bg-[#F5EBEB]"
            style={{ color: C.textTertiary }}
            aria-label="Remove class"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
