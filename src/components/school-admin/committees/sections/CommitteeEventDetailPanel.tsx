"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Trash2, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeEvent, CommitteeEventType } from "@/lib/committees/types";
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
  C,
  readOnly = false,
  onClose,
  onDelete,
}: {
  event: CommitteeEvent | null;
  C: AdminThemeTokens;
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
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div
              className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between border-b"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <h2
                className="text-base font-semibold pr-4 leading-tight"
                style={{ color: C.textPrimary }}
              >
                {event.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors cursor-pointer shrink-0"
                style={{ color: C.textTertiary }}
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
                <p className="text-xs mb-0.5" style={{ color: C.textTertiary }}>
                  Date
                </p>
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {formatEventDate(event.date)}
                </p>
              </div>
              {event.time && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: C.textTertiary }}>
                    Time
                  </p>
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    {event.time}
                  </p>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.textTertiary }} />
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: C.textTertiary }}>
                      Location
                    </p>
                    <p className="text-sm" style={{ color: C.textSecondary }}>
                      {event.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {!readOnly && onDelete && (
              <div
                className="px-6 py-4 border-t"
                style={{ borderColor: C.border }}
              >
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                  style={{ color: C.error }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete event
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
