"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { CLASSROOM_SIGNUP_TEMPLATES } from "@/lib/classroom-signups/templates";
import type { ClassroomSignupTemplateId } from "@/lib/classroom-signups/types";
import { TemplateCard } from "./SignupTemplatePicker";

type SignupTemplateSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: ClassroomSignupTemplateId) => void;
};

export default function SignupTemplateSidebar({
  theme,
  open,
  onClose,
  onSelect,
}: SignupTemplateSidebarProps) {
  const templates = CLASSROOM_SIGNUP_TEMPLATES.filter((t) => t.id !== "blank");

  return (
    <AnimatePresence>
      {open ? (
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
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-template-sidebar-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4"
              style={{
                backgroundColor: theme.infoBg,
                borderColor: theme.line,
              }}
            >
              <div className="min-w-0">
                <p
                  className="m-0 text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: theme.muted }}
                >
                  Create signup
                </p>
                <h2
                  id="signup-template-sidebar-title"
                  className="truncate text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  Choose a template
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 transition-colors hover:bg-black/[0.05]"
                aria-label="Close templates"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-4 text-sm leading-relaxed" style={{ color: "#76828A" }}>
                Start from a common classroom request. Your audience settings will
                stay the same.
              </p>
              <div className="space-y-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    theme={theme}
                    template={template}
                    onSelect={() => onSelect(template.id)}
                  />
                ))}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
