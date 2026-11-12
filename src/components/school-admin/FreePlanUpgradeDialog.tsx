"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import {
  DemoScheduler,
  type DemoSchedulerBooking,
} from "@/components/scheduler/DemoScheduler";
import { DemoSchedulerSkeleton } from "@/components/scheduler/DemoSchedulerSkeleton";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import {
  ACCENT_HIGHLIGHT,
  BOLD_HEADING,
  GROUP_TINTS,
} from "@/components/home/bright-styles";
import { detectBrowserTimezone } from "@/lib/marketing/demo-timezone-options";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";
import { SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";

type FreePlanUpgradeDialogProps = {
  open: boolean;
  featureLabel: string;
  schoolName: string;
  slug: string;
  userName: string;
  userEmail: string;
  previewMode?: boolean;
  onClose: () => void;
};

export default function FreePlanUpgradeDialog({
  open,
  featureLabel,
  schoolName,
  slug,
  userName,
  userEmail,
  previewMode = false,
  onClose,
}: FreePlanUpgradeDialogProps) {
  const reduceMotion = useReducedMotion();
  const [booking, setBooking] = useState<DemoSchedulerBooking | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    Record<string, string[]>
  >({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [displayTimezone, setDisplayTimezone] = useState(() =>
    detectBrowserTimezone(SCHEDULER_TIMEZONE),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const requestKey = open ? featureLabel : "";

  if (requestKey !== loadedKey) {
    setLoadedKey(requestKey);
    setAvailabilityLoading(Boolean(requestKey));
    setAvailabilityError(null);
    setAvailabilitySlots({});
    setBooking(null);
    setSubmitError(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    fetch("/api/availability")
      .then(async (res) => {
        const data = (await res.json()) as {
          slots?: Record<string, string[]>;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load availability");
        if (!cancelled) setAvailabilitySlots(data.slots ?? {});
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailabilityError(
            err instanceof Error ? err.message : "Failed to load availability",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, featureLabel]);

  const handleScheduled = async (selected: DemoSchedulerBooking) => {
    if (isSubmitting || previewMode || !userEmail.trim() || !userName.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          email: userEmail.trim(),
          schoolName,
          role: "running",
          priorities: ["full"],
          prepNotes: `Upgrade request for ${featureLabel} from free school ${slug}.`,
          scheduledDate: selected.date,
          scheduledTime: selected.time,
          timezone: selected.displayTimezone,
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }
      setBooking(selected);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  const fade = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#1d1a16]/45"
            aria-label="Close upgrade dialog"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="free-plan-upgrade-title"
            className="relative z-[1] flex max-h-[min(860px,calc(100dvh-24px))] w-full max-w-[720px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(30,60,30,0.16)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={fade}
          >
            <div className="relative shrink-0 px-6 pb-4 pt-6 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1d1a16]/60 hover:bg-[#F4F1EC]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <p
                className="inline-flex rounded-pill px-3 py-1 font-secondary text-[13px] font-semibold text-[#1d1a16]"
                style={{ backgroundColor: GROUP_TINTS.admin }}
              >
                {featureLabel}
              </p>
              <h2
                id="free-plan-upgrade-title"
                className={`mt-3 max-w-[16ch] text-[clamp(1.7rem,3vw,2.25rem)] ${BOLD_HEADING}`}
              >
                Unlock <span className={ACCENT_HIGHLIGHT}>{featureLabel}</span>
              </h2>
              <p className="font-secondary mt-3 max-w-md text-[15px] leading-relaxed text-[#1d1a16]/70">
                Book a call and we&rsquo;ll open the rest of MudKitchen for {schoolName}.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
              <PublicFormHoneypotField
                value={companyWebsite}
                onChange={setCompanyWebsite}
              />
              {booking ? (
                <div className="rounded-[28px] bg-white px-6 py-10 text-center ring-1 ring-black/10">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1a16] text-white">
                    <Check className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className={`text-lg ${BOLD_HEADING}`}>You&rsquo;re booked</h3>
                  <p className="font-secondary mt-2 text-sm text-[#1d1a16]/70">
                    We&rsquo;ll talk through {featureLabel} and what to open next.
                  </p>
                </div>
              ) : availabilityLoading ? (
                <DemoSchedulerSkeleton storyTheme={MUDKITCHEN_MARKETING_BRIGHT_THEME} />
              ) : availabilityError ? (
                <p className="font-secondary py-16 text-center text-sm text-clay">
                  {availabilityError}
                </p>
              ) : Object.keys(availabilitySlots).length === 0 ? (
                <p className="font-secondary py-16 text-center text-sm text-[#1d1a16]/70">
                  No times are available right now. Email us and we&rsquo;ll find one.
                </p>
              ) : (
                <div className="overflow-hidden rounded-[28px] ring-1 ring-black/10">
                  <DemoScheduler
                    availabilitySlots={availabilitySlots}
                    onConfirm={handleScheduled}
                    isSubmitting={isSubmitting}
                    confirmDisabled={previewMode || !userEmail.trim() || !userName.trim()}
                    storyTheme={MUDKITCHEN_MARKETING_BRIGHT_THEME}
                    displayTimezone={displayTimezone}
                    onDisplayTimezoneChange={setDisplayTimezone}
                  />
                </div>
              )}
              {submitError ? (
                <p className="font-secondary mt-3 text-sm text-clay">{submitError}</p>
              ) : null}
              {previewMode ? (
                <p className="font-secondary mt-3 text-center text-xs text-[#1d1a16]/55">
                  Preview only. This does not book a call.
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
