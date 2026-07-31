"use client";

import {
  formatActivityEventNarrative,
  getActivityEventVisual,
  resolveActorDisplayLabel,
  type EnrichedActivityEvent,
} from "@/lib/activity-event-display";
import { formatActivityActionLabel } from "@/lib/activity-log";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

type ActivityLogFeedProps = {
  events: EnrichedActivityEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function ActivityNarrativeText({
  event,
  actorLabel,
}: {
  event: EnrichedActivityEvent;
  actorLabel: string;
}) {
  const narrative = formatActivityEventNarrative(event, event);
  if (!narrative.startsWith(actorLabel)) {
    return (
      <p className="text-sm font-normal text-admin-text leading-snug line-clamp-3">
        {narrative}
      </p>
    );
  }

  const remainder = narrative.slice(actorLabel.length);
  return (
    <p className="text-sm font-normal text-admin-text leading-snug line-clamp-3">
      <span className="font-semibold">{actorLabel}</span>
      {remainder}
    </p>
  );
}

function ActivityLogRow({
  event,
  selected,
  onSelect,
}: {
  event: EnrichedActivityEvent;
  selected: boolean;
  onSelect: () => void;
}) {
  const { Icon, className } = getActivityEventVisual(event);
  const actorLabel = resolveActorDisplayLabel(event, event);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 transition-colors ${
        selected ? "bg-admin-accent-soft" : "hover:bg-admin-bg"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${className}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <ActivityNarrativeText event={event} actorLabel={actorLabel} />
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] text-admin-faint">
              {formatRelativeTime(event.created_at)}
            </span>
            <span className="text-[11px] text-admin-faint">·</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-admin-md border bg-admin-bg text-admin-muted border-admin-border">
              {formatActivityActionLabel(event.action)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ActivityLogFeed({
  events,
  selectedId,
  onSelect,
}: ActivityLogFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-admin-faint text-center py-8">
        No activity for this filter
      </p>
    );
  }

  return (
    <div className="divide-y divide-admin-border">
      {events.map((event) => (
        <ActivityLogRow
          key={event.id}
          event={event}
          selected={selectedId === event.id}
          onSelect={() => onSelect(event.id)}
        />
      ))}
    </div>
  );
}
