"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type {
  ChecklistVariantConfig,
  ChecklistVariantDraft,
  EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AgreementOptionsDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  item: EnrollmentChecklistItem;
  readOnly?: boolean;
  optionsSummary: string;
  variantEnabled: boolean;
  variantDraft: ChecklistVariantDraft | null;
  groupLabelValue: string;
  showGroupLabelHint: boolean;
  showOptionLabelHint: boolean;
  onPatch: (updates: Partial<EnrollmentChecklistItem>) => void;
  onPatchVariant: (updates: Partial<ChecklistVariantConfig> | null) => void;
  onSetDefaultVariant?: () => void;
  onAddVariant?: () => void;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };
}

function LabeledField({
  C,
  label,
  children,
}: {
  C: AdminThemeTokens;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1 block text-[10px] font-medium"
        style={{ color: C.textTertiary }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function HelperText({ C, children }: { C: AdminThemeTokens; children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: C.textTertiary }}>
      {children}
    </p>
  );
}

export default function AgreementOptionsDialog({
  C,
  open,
  onClose,
  item,
  readOnly = false,
  optionsSummary,
  variantEnabled,
  variantDraft,
  groupLabelValue,
  showGroupLabelHint,
  showOptionLabelHint,
  onPatch,
  onPatchVariant,
  onSetDefaultVariant,
  onAddVariant,
}: AgreementOptionsDialogProps) {
  const style = inputStyle(C);

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
            aria-labelledby="agreement-options-dialog-title"
            className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg shadow-xl"
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
                  id="agreement-options-dialog-title"
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Agreement options
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  {optionsSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded p-1.5 shrink-0"
                style={{ color: C.textTertiary }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[70vh]">
              <HelperText C={C}>
                Choose whether every family signs the same agreement, or staff pick the
                right version when starting enrollment.
              </HelperText>

              <div className="space-y-2">
                <label
                  className="flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 text-[11px]"
                  style={{
                    borderColor: !variantEnabled ? C.accent : C.border,
                    backgroundColor: !variantEnabled ? C.accentLight : C.surface,
                    color: C.textSecondary,
                  }}
                >
                  <input
                    type="radio"
                    name={`agreement-mode-${item.id}`}
                    checked={!variantEnabled}
                    onChange={() => onPatchVariant(null)}
                    disabled={readOnly}
                    className="mt-0.5"
                    style={{ accentColor: C.accent }}
                  />
                  <span>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      Same agreement for everyone
                    </span>
                    <span className="mt-0.5 block text-[10px]" style={{ color: C.textTertiary }}>
                      One agreement step for all families.
                    </span>
                  </span>
                </label>

                <label
                  className="flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 text-[11px]"
                  style={{
                    borderColor: variantEnabled ? C.accent : C.border,
                    backgroundColor: variantEnabled ? C.accentLight : C.surface,
                    color: C.textSecondary,
                  }}
                >
                  <input
                    type="radio"
                    name={`agreement-mode-${item.id}`}
                    checked={variantEnabled}
                    onChange={() => onPatchVariant({})}
                    disabled={readOnly}
                    className="mt-0.5"
                    style={{ accentColor: C.accent }}
                  />
                  <span>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      Different agreements for different students
                    </span>
                    <span className="mt-0.5 block text-[10px]" style={{ color: C.textTertiary }}>
                      Staff pick the correct agreement when starting enrollment.
                    </span>
                  </span>
                </label>
              </div>

              {variantEnabled ? (
                <div
                  className="space-y-3 rounded-md border p-3"
                  style={{ borderColor: C.border, backgroundColor: C.elevated }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                  >
                    Checklist step
                  </p>

                  <LabeledField C={C} label="Step name families see">
                    <input
                      type="text"
                      value={groupLabelValue}
                      onChange={(e) => onPatchVariant({ groupLabel: e.target.value })}
                      disabled={readOnly}
                      placeholder="Enrollment Agreement"
                      style={style}
                    />
                    <HelperText C={C}>
                      Appears once in the family checklist. Give each option a distinct label
                      in the section below.
                    </HelperText>
                    {showGroupLabelHint ? (
                      <p className="mt-1 text-[10px]" style={{ color: C.warning }}>
                        Step name is required before publishing.
                      </p>
                    ) : null}
                  </LabeledField>

                  {!readOnly && onAddVariant ? (
                    <button
                      type="button"
                      onClick={onAddVariant}
                      className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: C.accentLight,
                        color: C.accent,
                        border: `1px solid ${C.secondaryBtnBorder}`,
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add another agreement option
                    </button>
                  ) : null}
                </div>
              ) : null}

              {variantEnabled ? (
                <div
                  className="space-y-3 rounded-md border p-3"
                  style={{ borderColor: C.border, backgroundColor: C.elevated }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                  >
                    This agreement option
                  </p>

                  <LabeledField C={C} label="Option label (staff sees)">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => onPatch({ label: e.target.value })}
                      disabled={readOnly}
                      placeholder="Standard agreement"
                      style={style}
                    />
                    <HelperText C={C}>
                      Shown to staff when starting enrollment, e.g. Standard agreement or
                      Disability support
                    </HelperText>
                    {showOptionLabelHint ? (
                      <p className="mt-1 text-[10px]" style={{ color: C.warning }}>
                        Option label is required before publishing.
                      </p>
                    ) : null}
                  </LabeledField>

                  <label
                    className="flex items-center gap-2 text-[11px] font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    <input
                      type="radio"
                      name={`default-variant-${variantDraft?.groupId ?? item.id}`}
                      checked={variantDraft?.isDefault ?? false}
                      onChange={() => onSetDefaultVariant?.()}
                      disabled={readOnly}
                      className="h-4 w-4"
                      style={{ accentColor: C.accent }}
                    />
                    Default option
                  </label>
                  <HelperText C={C}>
                    Pre-selected when an admin starts enrollment.
                  </HelperText>
                </div>
              ) : null}
            </div>

            <div
              className="flex justify-end border-t px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: C.accent, color: "#FFFFFF" }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
