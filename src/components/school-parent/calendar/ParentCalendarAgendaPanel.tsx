"use client";

import { AnimatePresence, motion } from "framer-motion";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import {
  eventTypeChipTone,
  formatAgendaEventMeta,
  listUpcomingCalendarEvents,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import {
  parentCalendarFadeUp,
  parentCalendarViewTransition,
} from "@/components/school-parent/calendar/parent-calendar-view-transition";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentCalendarAgendaPanelProps = {
  theme: ParentThemeTokens;
  events: OrganizationEvent[];
  periodKey: string;
  selectedEventId?: string | null;
  onEventClick: (event: OrganizationEvent) => void;
};

export default function ParentCalendarAgendaPanel({
  theme,
  events,
  periodKey,
  selectedEventId = null,
  onEventClick,
}: ParentCalendarAgendaPanelProps) {
  const upcomingEvents = listUpcomingCalendarEvents(events);

  return (
    <ParentCard theme={theme} className="!p-3 sm:!p-4">
      <AnimatePresence mode="wait">
        <motion.div key={periodKey} {...parentCalendarViewTransition}>
          <ParentSectionKicker theme={theme}>Next up</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-lg">
            Family agenda
          </ParentDisplayHeading>

          {upcomingEvents.length === 0 ? (
            <p className="mt-4 text-[13px] leading-relaxed" style={{ color: theme.muted }}>
              No upcoming events — your school calendar will appear here when events are added.
            </p>
          ) : (
            <ul className="mt-4 space-y-0">
              {upcomingEvents.map((event, index) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <motion.li
                    key={event.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={parentCalendarFadeUp}
                  >
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className="w-full cursor-pointer border-t py-3 text-left transition-colors first:border-t-0 hover:opacity-90"
                      style={{
                        borderColor: theme.line,
                        backgroundColor: isSelected ? theme.primarySoft : undefined,
                        borderRadius: isSelected ? theme.radiusButton : undefined,
                        paddingLeft: isSelected ? 8 : 0,
                        paddingRight: isSelected ? 8 : 0,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-[13px] font-bold leading-snug"
                            style={{ color: theme.ink }}
                          >
                            {event.title}
                          </p>
                          <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                            {formatAgendaEventMeta(event, formatEventTimeRange(event))}
                          </p>
                        </div>
                        <ParentChip
                          theme={theme}
                          tone={eventTypeChipTone(event.type)}
                          className="shrink-0 !text-[9px]"
                        >
                          {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                        </ParentChip>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </ParentCard>
  );
}
