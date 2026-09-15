"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Trash2, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { CommitteeEvent, CommitteeEventType } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parseEventDate } from "@/lib/committees/calendar-utils";

const TYPE_COLORS: Record<CommitteeEventType, string> = {
  meeting: "bg-[#827096]/10 text-[#827096]",
  deadline: "bg-amber-100 text-amber-700",
  service: "bg-emerald-100 text-emerald-700",
  event: "bg-[#b3b462]/20 text-[#5C5A30]",
};

function formatEventDate(date: string) {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommitteeEventDetailPanel({
  event,
  theme,
  readOnly = false,
  onClose,
  onDelete,
}: {
  event: CommitteeEvent | null;
  theme: ParentThemeTokens;
  readOnly?: boolean;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && event) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
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
            className="fixed top-0 right-0 bottom-0 w-[380px] z-50 flex flex-col overflow-hidden border-l shadow-xl"
            style={{ backgroundColor: "#F8FAF8", borderColor: "#DCE4DC" }}
          >
            <div
              className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#DCE4DC", backgroundColor: "#F8FAF8" }}
            >
              <div className="min-w-0 pr-4">
                <AdminSectionKicker theme={theme}>Event</AdminSectionKicker>
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
                  {event.title}
                </AdminDisplayHeading>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors cursor-pointer shrink-0"
                style={{ color: theme.muted }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <span
                className={`inline-block text-xs font-semibold uppercase px-2.5 py-1 rounded-full w-fit ${TYPE_COLORS[event.type]}`}
              >
                {event.type}
              </span>
              <div>
                <p className="text-xs mb-0.5" style={{ color: theme.muted }}>
                  Date
                </p>
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                  {formatEventDate(event.date)}
                </p>
              </div>
              {event.time && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: theme.muted }}>
                    Time
                  </p>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    {event.time}
                  </p>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.muted }} />
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: theme.muted }}>
                      Location
                    </p>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {event.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {!readOnly && onDelete && (
              <div
                className="px-6 py-4 border-t"
                style={{ borderColor: "#DCE4DC" }}
              >
                <AdminButton
                  theme={theme}
                  variant="danger"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete event
                </AdminButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
