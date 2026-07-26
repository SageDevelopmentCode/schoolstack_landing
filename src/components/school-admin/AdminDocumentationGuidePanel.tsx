"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { AdminDocGuide } from "@/lib/school-admin/admin-documentation";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdminDocumentationGuidePanelProps = {
  C: AdminThemeTokens;
  guide: AdminDocGuide | null;
  open: boolean;
  onClose: () => void;
};

export default function AdminDocumentationGuidePanel({
  C,
  guide,
  open,
  onClose,
}: AdminDocumentationGuidePanelProps) {
  return (
    <AnimatePresence>
      {open && guide ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {guide.title}
                </h3>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: C.textTertiary }}
                >
                  {guide.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <ol className="space-y-4">
                {guide.steps.map((step, index) => (
                  <li key={`${guide.id}-step-${index}`} className="flex gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: C.accentLight,
                        color: C.accent,
                        border: `1px solid ${C.secondaryBtnBorder}`,
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {step.title}
                      </p>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: C.textSecondary }}
                      >
                        {step.description}
                      </p>
                      {step.action ? (
                        <a
                          href={step.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                          style={getAdminButtonStyle(C, "secondary")}
                        >
                          {step.action.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
