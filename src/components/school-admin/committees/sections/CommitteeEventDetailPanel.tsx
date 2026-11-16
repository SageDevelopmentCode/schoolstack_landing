"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Pencil, Trash2, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { CommitteeEvent, CommitteeEventType, CommitteeMember } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import { CommitteeAttributionLabel } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import { useIsGardenCommittee } from "@/components/school-admin/committees/committee-surface";
import { gardenButtonClass } from "@/components/school-admin/committees/committee-ui";
import CommitteeFormSidePanel from "@/components/school-admin/committees/sections/CommitteeFormSidePanel";
import { GChip, type GChipTone } from "@/components/school-parent/garden/ui";

const GARDEN_TYPE_TONE: Record<CommitteeEventType, GChipTone> = {
  meeting: "neutral",
  deadline: "warning",
  service: "success",
  event: "info",
};

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
  canManage = false,
  onClose,
  onEdit,
  onDelete,
  members = [],
}: {
  event: CommitteeEvent | null;
  theme: ParentThemeTokens;
  readOnly?: boolean;
  canManage?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: (eventId: string) => void;
  members?: CommitteeMember[];
}) {
  const garden = useIsGardenCommittee();
  // Garden drawer keeps showing the last event while it slides out.
  const [lastEvent, setLastEvent] = useState<CommitteeEvent | null>(event);
  if (event && event !== lastEvent) setLastEvent(event);

  useEffect(() => {
    if (garden) return; // the Garden drawer handles Escape itself
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && event) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [event, garden, onClose]);

  if (garden) {
    const shown = event ?? lastEvent;
    const canAct = !readOnly && canManage && (onEdit || onDelete);
    return (
      <CommitteeFormSidePanel
        open={event != null}
        theme={theme}
        kicker="Event"
        title={shown?.title ?? ""}
        icon={<CalendarDays className="h-[18px] w-[18px]" />}
        onRequestClose={onClose}
        footer={
          canAct && shown ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {onDelete ? (
                <button type="button" className={gardenButtonClass("danger")} onClick={() => onDelete(shown.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              ) : (
                <span />
              )}
              {onEdit ? (
                <button type="button" className={gardenButtonClass("primary")} onClick={onEdit}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit event
                </button>
              ) : null}
            </div>
          ) : undefined
        }
      >
        {shown ? (
          <div className="space-y-4">
            <GChip tone={GARDEN_TYPE_TONE[shown.type]} className="capitalize">
              {shown.type}
            </GChip>
            <dl className="m-0 space-y-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Date</dt>
                  <dd className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{formatEventDate(shown.date)}</dd>
                </div>
              </div>
              {shown.time ? (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Time</dt>
                    <dd className="m-0 text-[15px] font-bold text-[var(--sf-ink)]">{shown.time}</dd>
                  </div>
                </div>
              ) : null}
              {shown.location ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Location</dt>
                    <dd className="m-0 text-[15px] font-bold text-[var(--sf-ink)]">{shown.location}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
            <CommitteeAttributionLabel
              theme={theme}
              createdByMemberId={shown.createdByMemberId}
              createdByName={shown.createdByName}
              createdByRole={shown.createdByRole}
              members={members}
              className="text-[12.5px]"
            />
            {!readOnly && !canManage ? (
              <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                Only the person who added this event or the school can change it.
              </p>
            ) : null}
          </div>
        ) : null}
      </CommitteeFormSidePanel>
    );
  }

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
              <CommitteeAttributionLabel
                theme={theme}
                createdByMemberId={event.createdByMemberId}
                createdByName={event.createdByName}
                createdByRole={event.createdByRole}
                members={members}
                className="text-xs"
              />
            </div>
            {!readOnly && canManage && (onEdit || onDelete) && (
              <div
                className="px-6 py-4 border-t flex flex-col gap-2"
                style={{ borderColor: "#DCE4DC" }}
              >
                {onEdit ? (
                  <AdminButton theme={theme} variant="soft" onClick={onEdit}>
                    <Pencil className="w-4 h-4" />
                    Edit event
                  </AdminButton>
                ) : null}
                {onDelete ? (
                  <AdminButton
                    theme={theme}
                    variant="danger"
                    onClick={() => onDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete event
                  </AdminButton>
                ) : null}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
