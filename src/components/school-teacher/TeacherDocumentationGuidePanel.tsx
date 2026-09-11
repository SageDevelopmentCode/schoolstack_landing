"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { TeacherDocGuide } from "@/lib/school-teacher/teacher-documentation";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherDocumentationGuidePanelProps = {
  theme: ParentThemeTokens;
  guide: TeacherDocGuide | null;
  open: boolean;
  onClose: () => void;
};

export default function TeacherDocumentationGuidePanel({
  theme,
  guide,
  open,
  onClose,
}: TeacherDocumentationGuidePanelProps) {
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
              backgroundColor: theme.white,
              borderLeft: `1px solid ${theme.line}`,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${theme.line}` }}
            >
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: theme.ink }}
                >
                  {guide.title}
                </h3>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: theme.muted }}
                >
                  {guide.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded p-1"
                style={{ color: theme.muted }}
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
                        backgroundColor: theme.primarySoft,
                        color: theme.primary,
                        border: `1px solid ${theme.line}`,
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.ink }}
                      >
                        {step.title}
                      </p>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: theme.muted }}
                      >
                        {step.description}
                      </p>
                      {step.action ? (
                        <a
                          href={step.action.href}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
                          style={{
                            backgroundColor: theme.primarySoft,
                            color: theme.primary,
                            border: `1px solid ${theme.line}`,
                          }}
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
