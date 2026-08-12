"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";

export default function EventChip({
  event,
  C,
  selected,
  onClick,
  compact = false,
}: {
  event: OrganizationEvent;
  C: AdminThemeTokens;
  selected?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const colors = getEventDisplayStyle(event);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full cursor-pointer truncate rounded-md text-left font-medium transition-all hover:brightness-95 ${
        compact ? "px-1.5 py-0.5 text-[10px] sm:text-[11px]" : "px-2 py-1 text-[11px]"
      }`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.text}`,
        outline: selected ? `1px solid ${C.accent}` : undefined,
      }}
    >
      {event.title}
    </button>
  );
}
