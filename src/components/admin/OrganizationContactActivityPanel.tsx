"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ScrollText, X } from "lucide-react";
import ActivityLogDetail from "@/components/admin/ActivityLogDetail";
import ActivityLogFeed from "@/components/admin/ActivityLogFeed";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import {
  enrichActivityEventsForDisplay,
  type EnrichedActivityEvent,
} from "@/lib/activity-event-display";
import {
  buildAdminActivityLogHref,
  fetchActivityEvents,
  type ActivityEventRow,
} from "@/lib/activity-log";
import { createClient } from "@/utils/supabase/client";

type OrganizationContactActivityPanelProps = {
  organizationId: string;
  contactEmail: string;
  contactLabel: string;
  actorUserId?: string | null;
  open: boolean;
  onClose: () => void;
};

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-2 py-2" aria-busy="true" aria-label="Loading activity">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-admin-md border border-admin-border bg-admin-bg/40 px-3 py-3"
        >
          <div className="h-4 w-4/5 animate-pulse rounded-admin-sm bg-admin-neutral-bg" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded-admin-sm bg-admin-neutral-bg" />
        </div>
      ))}
    </div>
  );
}

export default function OrganizationContactActivityPanel({
  organizationId,
  contactEmail,
  contactLabel,
  actorUserId,
  open,
  onClose,
}: OrganizationContactActivityPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<EnrichedActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: ActivityEventRow[] = await fetchActivityEvents(supabase, {
        organizationId,
        actorEmail: contactEmail,
        actorUserId: actorUserId ?? undefined,
        datePreset: "30d",
        limit: 200,
      });
      const enriched = await enrichActivityEventsForDisplay(supabase, data);
      setEvents(enriched);
      setSelectedId((current) =>
        current && enriched.some((event) => event.id === current) ? current : null,
      );
    } catch (err) {
      setEvents([]);
      setError(err instanceof Error ? err.message : "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  }, [supabase, organizationId, contactEmail, actorUserId]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      void loadEvents();
    });
  }, [open, loadEvents]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    onClose();
  }, [onClose]);

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  );

  const fullActivityLogHref = buildAdminActivityLogHref({
    organizationId,
    actorEmail: contactEmail,
  });

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/45"
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-activity-title"
              className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,32rem)] max-w-full flex-col overflow-hidden border-l border-admin-border bg-admin-surface shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-admin-border px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <h2
                    id="contact-activity-title"
                    className="flex items-center gap-2 text-sm font-semibold text-admin-text"
                  >
                    <ScrollText
                      className="h-4 w-4 shrink-0 text-admin-accent"
                      aria-hidden
                    />
                    Activity
                  </h2>
                  <p className="mt-0.5 text-xs text-admin-muted">{contactLabel}</p>
                  <p className="mt-0.5 truncate text-[11px] text-admin-faint">
                    {contactEmail}
                  </p>
                  <p className="mt-1 text-[11px] text-admin-faint">
                    Last 30 days for this school. Read-only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-admin-muted transition-colors hover:bg-admin-bg"
                  aria-label="Close activity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
                {loading && events.length === 0 ? (
                  <ActivityFeedSkeleton />
                ) : error ? (
                  <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
                    <p className="text-sm text-admin-accent">{error}</p>
                    <button
                      type="button"
                      onClick={() => void loadEvents()}
                      className="mt-3 text-xs font-medium text-admin-accent hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : events.length === 0 ? (
                  <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
                    <p className="text-sm text-admin-muted">No activity found.</p>
                  </div>
                ) : (
                  <div className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden">
                    <ActivityLogFeed
                      events={events}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 border-t border-admin-border px-4 py-3">
                <Link
                  href={fullActivityLogHref}
                  className="text-xs font-medium text-admin-accent hover:underline"
                >
                  Open in Activity log
                </Link>
                {loading && events.length > 0 ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-admin-faint">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Refreshing…
                  </span>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AdminDrawer
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title="Activity details"
        width="lg"
        overlayClassName="z-[10001]"
      >
        {selected ? <ActivityLogDetail event={selected} /> : null}
      </AdminDrawer>
    </>
  );
}
