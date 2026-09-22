"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentCalendarAgendaPanel from "@/components/school-parent/calendar/ParentCalendarAgendaPanel";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export default function CommitteeCalendarAgendaSidebar({
  open,
  theme,
  events,
  periodKey,
  selectedEventId,
  onEventClick,
  onClose,
}: {
  open: boolean;
  theme: ParentThemeTokens;
  events: OrganizationEvent[];
  periodKey: string;
  selectedEventId?: string | null;
  onEventClick: (event: OrganizationEvent) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(100%,24rem)] flex-col overflow-hidden border-l shadow-xl sm:w-[380px]"
            style={{ backgroundColor: theme.white, borderColor: theme.line }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-6 py-5"
              style={{ borderColor: theme.line, backgroundColor: theme.white }}
            >
              <div className="min-w-0 pr-2">
                <AdminSectionKicker theme={theme}>Next up</AdminSectionKicker>
                <AdminDisplayHeading
                  theme={theme}
                  as="h2"
                  size="section"
                  className="mt-1"
                >
                  Upcoming events
                </AdminDisplayHeading>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md p-1.5 transition-colors"
                style={{ color: theme.muted }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ParentCalendarAgendaPanel
                theme={theme}
                events={events}
                periodKey={periodKey}
                selectedEventId={selectedEventId}
                onEventClick={onEventClick}
                agendaTitle="Upcoming events"
                embedded
                showHeader={false}
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
