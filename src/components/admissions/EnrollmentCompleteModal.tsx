"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, X } from "lucide-react";
import { fireCelebrationConfetti } from "@/lib/celebration-confetti";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentCompleteModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  schoolName: string;
  schoolSlug: string;
  onClose: () => void;
};

export default function EnrollmentCompleteModal({
  C,
  open,
  schoolName,
  schoolSlug,
  onClose,
}: EnrollmentCompleteModalProps) {
  useEffect(() => {
    if (!open) return;
    fireCelebrationConfetti(C.accent);
  }, [C.accent, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-md rounded-xl border p-6 shadow-xl"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
              color: C.textPrimary,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enrollment-complete-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: C.accentLight, color: C.accent }}
              >
                <PartyPopper className="h-5 w-5" />
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

            <h2
              id="enrollment-complete-title"
              className="text-xl font-semibold"
              style={{ color: C.accentDark }}
            >
              You&apos;re enrolled!
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Congratulations! You&apos;ve completed all enrollment steps for{" "}
              <span className="font-medium" style={{ color: C.textPrimary }}>
                {schoolName}
              </span>
              . Welcome to the community.
            </p>

            <div className="mt-6 space-y-2">
              <Link
                href={`/school/${schoolSlug}/parent`}
                className="block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                style={getAdminButtonStyle(C, "primary")}
              >
                Go to parent dashboard
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md border px-4 py-2.5 text-sm font-medium"
                style={{ borderColor: C.border, color: C.textPrimary }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
