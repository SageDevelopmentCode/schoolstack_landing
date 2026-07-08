"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CHECKLIST_ITEM_TEMPLATES,
  createItemFromTemplate,
  type ChecklistItemTemplateId,
} from "@/lib/admissions/enrollment-checklist-item-templates";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  createBlankChecklistItem,
  type ChecklistItemType,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentChecklistTemplatePickerProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: ChecklistItemTemplateId) => void;
  onSelectBlank: (type: ChecklistItemType) => void;
};

const BLANK_TYPES: ChecklistItemType[] = [
  "document_sign",
  "form",
  "file_upload",
  "payment",
  "acknowledgment",
];

export default function EnrollmentChecklistTemplatePicker({
  C,
  open,
  onClose,
  onSelectTemplate,
  onSelectBlank,
}: EnrollmentChecklistTemplatePickerProps) {
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
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div>
                <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                  Add checklist item
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Start from a suggested template or add a blank item.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5"
                style={{ color: C.textTertiary }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  Suggested templates
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CHECKLIST_ITEM_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        onSelectTemplate(template.id);
                        onClose();
                      }}
                      className="rounded-md border p-3 text-left transition-colors"
                      style={{ borderColor: C.border, backgroundColor: C.surface }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.backgroundColor = C.accentLight;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.backgroundColor = C.surface;
                      }}
                    >
                      <p
                        className="text-[11px] font-semibold leading-snug"
                        style={{ color: C.textPrimary }}
                      >
                        {template.label}
                      </p>
                      <p
                        className="mt-0.5 text-[10px] leading-relaxed"
                        style={{ color: C.textTertiary }}
                      >
                        {template.description}
                      </p>
                      <span
                        className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: C.bg, color: C.textTertiary }}
                      >
                        {CHECKLIST_ITEM_TYPE_LABELS[template.type]}
                        {!template.required ? " · Optional" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  Blank item
                </p>
                <div className="flex flex-wrap gap-2">
                  {BLANK_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onSelectBlank(type);
                        onClose();
                      }}
                      className="rounded-md px-3 py-1.5 text-[11px] font-medium"
                      style={{
                        border: `1px solid ${C.border}`,
                        color: C.textSecondary,
                        backgroundColor: C.surface,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.color = C.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.color = C.textSecondary;
                      }}
                    >
                      + {CHECKLIST_ITEM_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Used by builder to preview template before adding — keeps picker decoupled
export function previewTemplateItem(templateId: ChecklistItemTemplateId) {
  return createItemFromTemplate(templateId);
}

export function previewBlankItem(type: ChecklistItemType) {
  return createBlankChecklistItem(type);
}
