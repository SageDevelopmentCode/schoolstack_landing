"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { applicationStatusLabel } from "@/lib/admissions/application-status-ui";
import type { FunnelStageDetails } from "@/lib/activity-funnel";

type ActivityFunnelStageDrawerProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  details: FunnelStageDetails | null;
  filterSummary: string | null;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ActivityFunnelStageDrawer({
  open,
  loading,
  error,
  details,
  filterSummary,
  onClose,
}: ActivityFunnelStageDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-12 z-40 flex justify-end">
          <motion.button
            type="button"
            aria-label="Close funnel stage details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            aria-busy={loading}
            className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Funnel stage
                </p>
                <h2 className="text-lg font-medium text-text mt-1">
                  {details?.stageLabel ?? "Stage details"}
                </h2>
                {filterSummary ? (
                  <p className="text-xs text-text-muted mt-1">{filterSummary}</p>
                ) : null}
                {details ? (
                  <p className="text-xs text-text-faint mt-1 tabular-nums">
                    {details.rows.length} application
                    {details.rows.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg border border-border p-1.5 text-text-muted hover:bg-surface-soft"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-text-faint">
                  Loading stage details…
                </div>
              ) : error ? (
                <p className="rounded-lg border border-clay/30 bg-clay/5 px-3 py-2 text-sm text-clay">
                  {error}
                </p>
              ) : details && details.rows.length === 0 ? (
                <p className="text-sm text-text-faint text-center py-12">
                  No applications found for this stage.
                </p>
              ) : details ? (
                <div className="space-y-3">
                  {details.rows.map((row) => (
                    <article
                      key={row.applicationId}
                      className="rounded-xl border border-border bg-bg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text">
                            {row.studentLabel ?? "Unnamed student"}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 break-all">
                            {row.actorEmail ?? "No parent email"}
                          </p>
                        </div>
                        {row.previewHref ? (
                          <Link
                            href={row.previewHref}
                            className="inline-flex shrink-0 items-center gap-1 text-xs text-clay hover:underline"
                          >
                            View
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                      </div>

                      <dl className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-text-faint">School</dt>
                          <dd className="text-text text-right">
                            {row.organizationName ?? "—"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-text-faint">Status</dt>
                          <dd className="text-text text-right">
                            {row.applicationStatus
                              ? applicationStatusLabel(row.applicationStatus)
                              : "—"}
                          </dd>
                        </div>
                        {row.formTitle ? (
                          <div className="flex items-start justify-between gap-3">
                            <dt className="text-text-faint">Form</dt>
                            <dd className="text-text text-right">
                              {row.formTitle}
                            </dd>
                          </div>
                        ) : null}
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-text-faint">Reached at</dt>
                          <dd className="text-text text-right">
                            {formatDateTime(row.reachedAt)}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-text-faint">Application ID</dt>
                          <dd className="text-text font-mono text-[11px] text-right break-all">
                            {row.applicationId}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
