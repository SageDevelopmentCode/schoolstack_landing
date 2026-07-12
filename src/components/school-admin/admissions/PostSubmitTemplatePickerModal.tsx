"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PostSubmitTemplatePickerModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  availableTypes: PostSubmitActionType[];
  onSelect: (type: PostSubmitActionType) => void;
};

export default function PostSubmitTemplatePickerModal({
  C,
  open,
  onClose,
  availableTypes,
  onSelect,
}: PostSubmitTemplatePickerModalProps) {
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
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-submit-template-picker-title"
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div>
                <p
                  id="post-submit-template-picker-title"
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Choose a template
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Pick a scheduling step for families after they submit.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 rounded p-1.5"
                style={{ color: C.textTertiary }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 px-5 py-4">
              {availableTypes.map((type) => {
                const template = POST_SUBMIT_ACTION_TEMPLATES[type];
                const Icon = template.Icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onSelect(type)}
                    className="flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors hover:opacity-90"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.elevated,
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
                      style={{ backgroundColor: C.accentLight, color: C.accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-sm font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {template.label}
                      </span>
                      <span
                        className="mt-0.5 block text-[11px] leading-snug"
                        style={{ color: C.textTertiary }}
                      >
                        {template.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="flex justify-end border-t px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: C.surface,
                  color: C.textSecondary,
                  border: `1px solid ${C.border}`,
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
