"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Pencil, Trash2, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import {
  getEventDisplayStyle,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent } from "@/lib/school-events/types";

function formatEventDate(date: string) {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SchoolEventDetailPanel({
  event,
  C,
  onClose,
  onDelete,
  onEdit,
  actionsDisabled = false,
}: {
  event: OrganizationEvent | null;
  C: AdminThemeTokens;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: OrganizationEvent) => void;
  actionsDisabled?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && event) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [event, onClose]);

  if (!event) return null;

  const typeStyle = getEventDisplayStyle(event);

  return (
    <AnimatePresence>
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
          className="fixed top-0 right-0 bottom-0 z-50 flex w-[480px] flex-col overflow-hidden border-l shadow-xl"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-5"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <h2
              className="pr-4 text-base font-semibold leading-tight"
              style={{ color: C.textPrimary }}
            >
              {event.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 cursor-pointer rounded-md p-1.5 transition-colors"
              style={{ color: C.textTertiary }}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            <span
              className="inline-block w-fit rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {SCHOOL_EVENT_TYPE_LABELS[event.type]}
            </span>

            <div>
              <p className="mb-0.5 text-xs" style={{ color: C.textTertiary }}>
                Date
              </p>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {formatEventDate(event.date)}
              </p>
            </div>

            <div>
              <p className="mb-0.5 text-xs" style={{ color: C.textTertiary }}>
                Time
              </p>
              <p className="text-sm" style={{ color: C.textPrimary }}>
                {formatEventTimeRange(event)}
              </p>
            </div>

            {event.location ? (
              <div>
                <p className="mb-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Location
                </p>
                <p
                  className="flex items-start gap-1.5 text-sm"
                  style={{ color: C.textPrimary }}
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.textTertiary }} />
                  {event.location}
                </p>
              </div>
            ) : null}

            {event.description ? (
              <div>
                <p className="mb-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                  {event.description}
                </p>
              </div>
            ) : null}
          </div>

          {(onEdit || onDelete) && (
            <div
              className="flex gap-2 border-t px-6 py-4"
              style={{ borderColor: C.border }}
            >
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(event)}
                  disabled={actionsDisabled}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  disabled={actionsDisabled}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              ) : null}
            </div>
          )}
        </motion.div>
      </>
    </AnimatePresence>
  );
}
