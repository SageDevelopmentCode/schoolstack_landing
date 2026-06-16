"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { DemoScheduler } from "@/components/scheduler/DemoScheduler";

export function PublicSchedulerPreviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/availability")
      .then(async (res) => {
        const data = (await res.json()) as {
          slots?: Record<string, string[]>;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load availability");
        if (!cancelled) setSlots(data.slots ?? {});
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load availability"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheduler-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[760px] max-h-[90vh] overflow-y-auto bg-bg rounded-xl shadow-lg border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 md:p-6 border-b border-border bg-bg">
          <div>
            <h2
              id="scheduler-preview-title"
              className="text-lg font-medium text-text"
            >
              Public calendar preview
            </h2>
            <p className="text-sm text-text-muted font-secondary mt-1">
              This is what visitors see after filling out the form on /get-started.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-sm text-text-faint font-secondary">
              Loading available times…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24 text-sm text-clay font-secondary">
              {error}
            </div>
          ) : Object.keys(slots).length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm text-text-muted font-secondary">
              No demo times are available right now.
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <DemoScheduler availabilitySlots={slots} preview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
