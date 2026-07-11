"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PostSubmitBookingModalProps = {
  C: AdminThemeTokens;
  applicationId: string;
  task: ApplicationPostSubmitTask;
  timezone: string;
  open: boolean;
  onClose: () => void;
  onBooked: () => void;
};

export default function PostSubmitBookingModal({
  C,
  applicationId,
  task,
  timezone,
  open,
  onClose,
  onBooked,
}: PostSubmitBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setSelectedDate(null);
        setSelectedTime(null);
        setSubmitting(false);
        setError(null);
      });
    }
  }, [open]);

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionId: task.actionId,
            scheduledDate: selectedDate,
            startTimeSlot: selectedTime,
          }),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule visit.");
      }

      onBooked();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule visit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border p-5 shadow-xl sm:p-6"
            style={{
              borderColor: C.border,
              backgroundColor: "#FFFFFF",
              color: C.textPrimary,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-submit-booking-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="post-submit-booking-title"
                  className="text-lg font-semibold"
                  style={{ color: C.accentDark }}
                >
                  {task.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                  {task.instructions}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AdmissionsDateTimePicker
              C={C}
              applicationId={applicationId}
              actionId={task.actionId}
              timezone={timezone}
              timezoneLabel={timezoneLabel}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            {error ? (
              <p
                className="mt-4 rounded-sm px-3 py-2 text-xs"
                style={{ backgroundColor: C.errorBg, color: C.error }}
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2.5 text-sm font-medium"
                style={{ borderColor: C.border, color: C.textSecondary }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDate || !selectedTime || submitting}
                onClick={() => void handleConfirm()}
                className="rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
              >
                {submitting ? "Scheduling…" : "Confirm time"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
