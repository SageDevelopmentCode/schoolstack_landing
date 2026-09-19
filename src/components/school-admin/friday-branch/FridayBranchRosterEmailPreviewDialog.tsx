"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SkeletonBlock } from "@/components/school-admin/skeletons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type FridayBranchRosterEmailPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  className: string;
  slotTime: string;
  loading: boolean;
  error: string | null;
  subject: string | null;
  html: string | null;
};

export default function FridayBranchRosterEmailPreviewDialog({
  open,
  onClose,
  C,
  theme,
  className,
  slotTime,
  loading,
  error,
  subject,
  html,
}: FridayBranchRosterEmailPreviewDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const subtitle = [className, slotTime].filter(Boolean).join(" · ");

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roster-email-preview-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 px-6 pt-6 pb-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h2
                  id="roster-email-preview-title"
                  className="text-lg font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Email preview
                </h2>
                {subtitle ? (
                  <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md p-1.5"
                style={getAdminButtonStyle(C, "neutral")}
                aria-label="Close email preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div
                  className="space-y-3"
                  aria-busy="true"
                  aria-label="Loading email preview"
                >
                  <SkeletonBlock C={C} className="h-3 w-16" />
                  <SkeletonBlock C={C} className="h-4 w-full max-w-md" />
                  <SkeletonBlock C={C} className="min-h-[420px] w-full rounded-md" />
                </div>
              ) : error ? (
                <p className="text-sm" style={{ color: theme.alert }}>
                  {error}
                </p>
              ) : subject && html ? (
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
                      style={{ color: theme.muted }}
                    >
                      Subject
                    </p>
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: theme.ink }}
                    >
                      {subject}
                    </p>
                  </div>
                  <iframe
                    title="Roster email preview"
                    srcDoc={html}
                    sandbox=""
                    className="min-h-[420px] w-full rounded-md border bg-white"
                    style={{ borderColor: "#E0E7E0", colorScheme: "light" }}
                  />
                </div>
              ) : null}
            </div>

            <div
              className="flex justify-end px-6 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm font-medium"
                style={getAdminButtonStyle(C, "neutral")}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
