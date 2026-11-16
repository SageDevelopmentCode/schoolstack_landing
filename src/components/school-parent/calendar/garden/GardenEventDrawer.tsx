"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlignLeft, CalendarDays, CalendarPlus, Check, Clock, Copy, ExternalLink, MapPin } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GIcon, GKicker, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { isToday, parseEventDate } from "@/lib/committees/calendar-utils";
import { buildGoogleMapsSearchUrl } from "@/lib/maps/navigation-links";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  buildEventDetailsText,
  buildEventIcs,
  downloadIcsFile,
  eventIcsFilename,
  formatEventLongDate,
} from "@/lib/school-events/calendar-event-export";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { formatParentActionError, parentToast } from "@/lib/school-parent/parent-toast";
import { EventTypeChip } from "./calendar-garden-shared";

const PREVIEW_HINT = "Available to families in the live portal";

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <GIcon size="sm">{icon}</GIcon>
      <div className="min-w-0 flex-1 pt-0.5">
        <GKicker>{label}</GKicker>
        <div className="mt-1 text-[15px] font-semibold text-[var(--sf-ink)]">{children}</div>
      </div>
    </div>
  );
}

/**
 * Event details drawer (Garden). Mounted outside the page frame; GSidePanel
 * carries its own. Helpers: Add to my calendar (.ics), Copy details and
 * Open in Maps. In preview they stay visible but disabled.
 */
export default function GardenEventDrawer({
  theme,
  event,
  onClose,
  previewMode,
}: {
  theme: ParentThemeTokens;
  event: OrganizationEvent | null;
  onClose: () => void;
  previewMode: boolean;
}) {
  // Keep the last event while the panel animates out.
  const [shown, setShown] = useState<OrganizationEvent | null>(event);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!event) return;
    queueMicrotask(() => {
      setShown(event);
      setCopied(false);
    });
  }, [event]);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const current = event ?? shown;

  const addToCalendar = () => {
    if (!current || previewMode) return;
    try {
      const filename = eventIcsFilename(current);
      downloadIcsFile(filename, buildEventIcs(current));
      parentToast.success("Calendar file downloaded", {
        id: "parent-calendar-ics",
        description: `Open ${filename} to add “${current.title}” to Apple, Google or Outlook Calendar.`,
      });
    } catch (err) {
      parentToast.error("Couldn't create the calendar file", {
        id: "parent-calendar-ics",
        description: formatParentActionError(err, "Please try again, or copy the details instead."),
      });
    }
  };

  const copyDetails = async () => {
    if (!current || previewMode) return;
    try {
      await navigator.clipboard.writeText(buildEventDetailsText(current));
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2200);
      parentToast.success("Event details copied", {
        id: "parent-calendar-copy",
        description: "Paste them into a message, note or your own calendar.",
      });
    } catch {
      parentToast.error("Couldn't copy the details", {
        id: "parent-calendar-copy",
        description: "Your browser blocked clipboard access. You can select the text in this panel instead.",
      });
    }
  };

  const today = current ? isToday(parseEventDate(current.date)) : false;

  return (
    <GSidePanel
      theme={theme}
      open={Boolean(event)}
      onClose={onClose}
      kicker="School event"
      title={current?.title ?? ""}
      subtitle={
        current ? (
          <span className="flex flex-wrap items-center gap-2">
            <EventTypeChip event={current} />
            {today ? <GChip tone="warning">Today</GChip> : null}
          </span>
        ) : null
      }
      testId="parent-calendar-event-panel"
      panelId="parent-calendar-event-panel"
      footer={
        current ? (
          <>
            <button
              type="button"
              onClick={() => void copyDetails()}
              disabled={previewMode}
              title={previewMode ? PREVIEW_HINT : undefined}
              className={gBtnOutlineSm}
              data-testid="parent-calendar-copy-details"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy details"}
            </button>
            <button
              type="button"
              onClick={addToCalendar}
              disabled={previewMode}
              title={previewMode ? PREVIEW_HINT : undefined}
              className={`${gBtnPopSm} ml-auto`}
              data-testid="parent-calendar-add-to-calendar"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Add to my calendar
            </button>
          </>
        ) : null
      }
    >
      {current ? (
        <div className="flex flex-col gap-5">
          <DetailRow icon={<CalendarDays />} label="Date">
            {formatEventLongDate(current.date)}
          </DetailRow>
          <DetailRow icon={<Clock />} label="Time">
            {formatEventTimeRange(current)}
          </DetailRow>
          {current.location ? (
            <DetailRow icon={<MapPin />} label="Location">
              <span className="block">{current.location}</span>
              {previewMode ? (
                <span className={`${gLinkSm} mt-1.5 cursor-not-allowed opacity-50`} title={PREVIEW_HINT} aria-disabled="true">
                  Open in Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              ) : (
                <a
                  href={buildGoogleMapsSearchUrl(current.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${gLinkSm} mt-1.5`}
                  data-testid="parent-calendar-open-maps"
                >
                  Open in Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </DetailRow>
          ) : null}
          {current.description ? (
            <DetailRow icon={<AlignLeft />} label="Details">
              <p className="m-0 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-[var(--sf-ink)]/80">
                {current.description}
              </p>
            </DetailRow>
          ) : null}
          <p className="m-0 rounded-2xl bg-[var(--sf-accent-wash)] px-4 py-3 text-[13px] font-semibold text-[var(--sf-clay-deep)]">
            <span className="font-extrabold">Tip:</span> “Add to my calendar” saves a file your phone or computer
            calendar can open, so this event shows up alongside your own plans.
          </p>
        </div>
      ) : null}
    </GSidePanel>
  );
}
