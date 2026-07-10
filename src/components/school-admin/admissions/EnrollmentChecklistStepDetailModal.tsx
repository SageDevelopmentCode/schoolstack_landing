"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EnrollmentChecklistItemReadOnlyPanel from "@/components/admissions/EnrollmentChecklistItemReadOnlyPanel";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import { CHECKLIST_ITEM_TYPE_LABELS } from "@/lib/admissions/enrollment-checklist-schema";
import {
  checklistItemStatusLabel,
  checklistItemStatusStyle,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentChecklistStepDetailModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  item: EnrollmentChecklistItem | null;
  instance: EnrollmentChecklistItemInstance | null;
  onClose: () => void;
};

export default function EnrollmentChecklistStepDetailModal({
  C,
  open,
  item,
  instance,
  onClose,
}: EnrollmentChecklistStepDetailModalProps) {
  const status = instance?.status ?? "not_started";

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                    {item.label}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={checklistItemStatusStyle(status, C)}
                  >
                    {checklistItemStatusLabel(status)}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {CHECKLIST_ITEM_TYPE_LABELS[item.type]}
                  {!item.required ? (
                    <>
                      <span className="mx-1.5 opacity-50">·</span>
                      Optional
                    </>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <EnrollmentChecklistItemReadOnlyPanel
                C={C}
                item={item}
                instance={instance ?? undefined}
              />
            </div>

            <div
              className="border-t px-5 py-3 text-xs"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Read-only — this is what the family sees
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
