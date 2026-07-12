"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CreditCard,
  FileSignature,
  HeartPulse,
  Pill,
  ShieldAlert,
  Stethoscope,
  Syringe,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
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
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type EnrollmentChecklistTemplatePickerProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: ChecklistItemTemplateId) => void;
  onSelectBlank: (type: ChecklistItemType) => void;
};

const BLANK_TYPES: ChecklistItemType[] = [
  "document_sign",
  "document_sign_pdf",
  "form",
  "file_upload",
  "payment",
  "acknowledgment",
];

const BLANK_TYPE_DESCRIPTIONS: Record<ChecklistItemType, string> = {
  document_sign: "Write agreement sections in the builder for families to read and sign",
  document_sign_pdf:
    "Upload a PDF for families to read; optionally require a signature below it",
  form: "Custom questions for families to complete",
  file_upload: "Request documents from families",
  payment: "Collect a fee during enrollment",
  acknowledgment: "Simple sign-off or consent",
};

type TemplateBadgeStyle = {
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
};

const TEMPLATE_BADGE_STYLES: Record<ChecklistItemTemplateId, TemplateBadgeStyle> = {
  standard_enrollment_agreement: {
    icon: FileSignature,
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  photo_release: {
    icon: Camera,
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
  assumption_of_risk: {
    icon: ShieldAlert,
    color: "#D97706",
    backgroundColor: "#FFFBEB",
  },
  health_emergency_form: {
    icon: HeartPulse,
    color: "#E11D48",
    backgroundColor: "#FFF1F2",
  },
  medication_plan: {
    icon: Pill,
    color: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  immunization_records: {
    icon: Syringe,
    color: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  health_information: {
    icon: Stethoscope,
    color: "#DB2777",
    backgroundColor: "#FDF2F8",
  },
  authorized_pickup: {
    icon: UserCheck,
    color: "#0284C7",
    backgroundColor: "#F0F9FF",
  },
  registration_fee: {
    icon: CreditCard,
    color: "#059669",
    backgroundColor: "#ECFDF5",
  },
};

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
                  Add a blank item or start from a suggested template.
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
                  Blank item
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BLANK_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onSelectBlank(type);
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
                        {CHECKLIST_ITEM_TYPE_LABELS[type]}
                      </p>
                      <p
                        className="mt-0.5 text-[10px] leading-relaxed"
                        style={{ color: C.textTertiary }}
                      >
                        {BLANK_TYPE_DESCRIPTIONS[type]}
                      </p>
                      <span
                        className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: C.bg, color: C.textTertiary }}
                      >
                        {CHECKLIST_ITEM_TYPE_LABELS[type]}
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
                  Suggested templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {CHECKLIST_ITEM_TEMPLATES.map((template) => {
                    const badgeStyle = TEMPLATE_BADGE_STYLES[template.id];
                    const Icon = badgeStyle.icon;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          onSelectTemplate(template.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium"
                        style={getAdminButtonStyle(C, "secondary")}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                          style={{
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                          }}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                        <span>{template.label}</span>
                      </button>
                    );
                  })}
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
