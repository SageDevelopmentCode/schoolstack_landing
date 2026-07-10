"use client";

import { useEffect } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { GripVertical, Lock, X } from "lucide-react";
import type { ApplicationSection } from "@/lib/admissions/application-form-schema";
import { isSystemSection } from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { outlineItemCardStyle } from "./outline-item-styles";

type ApplicationFormStepsReorderDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  sections: ApplicationSection[];
  readOnly: boolean;
  lockSystemStep?: boolean;
  onReorderSteps: (sections: ApplicationSection[]) => void;
};

function ReorderStepRow({
  C,
  step,
  stepIdx,
  readOnly,
  lockSystemStep,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  readOnly: boolean;
  lockSystemStep: boolean;
}) {
  const dragControls = useDragControls();
  const questionCount = step.fields.length;
  const isLocked = lockSystemStep && isSystemSection(step);
  const canDrag = !readOnly && !isLocked;

  return (
    <Reorder.Item
      as="div"
      value={step}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div
        className="flex items-center rounded-sm transition-colors"
        style={outlineItemCardStyle(C, false)}
      >
        {canDrag ? (
          <button
            type="button"
            aria-label="Drag to reorder step"
            className="touch-none cursor-grab px-1.5 py-2 active:cursor-grabbing shrink-0"
            style={{ color: C.textQuaternary }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="w-7 shrink-0" aria-hidden />
        )}
        <div className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
            }}
          >
            {stepIdx + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="flex items-center gap-1.5 truncate text-xs font-medium"
              style={{ color: C.textPrimary }}
            >
              {step.title || `Step ${stepIdx + 1}`}
              {isLocked ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: C.elevated, color: C.textTertiary }}
                >
                  <Lock className="h-2.5 w-2.5" />
                  System
                </span>
              ) : null}
            </span>
            <span className="text-[10px]" style={{ color: C.textTertiary }}>
              {questionCount} question{questionCount === 1 ? "" : "s"}
            </span>
          </span>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function ApplicationFormStepsReorderDialog({
  C,
  open,
  onClose,
  sections,
  readOnly,
  lockSystemStep = false,
  onReorderSteps,
}: ApplicationFormStepsReorderDialogProps) {
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
            aria-labelledby="steps-reorder-dialog-title"
            className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg shadow-xl"
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
                  id="steps-reorder-dialog-title"
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Reorder steps
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Drag steps to change the order families see on the application form.
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

            <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[60vh]">
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={(next) => !readOnly && onReorderSteps(next)}
                as="div"
                className="flex flex-col gap-1.5"
              >
                {sections.map((step, stepIdx) => (
                  <ReorderStepRow
                    key={step.id}
                    C={C}
                    step={step}
                    stepIdx={stepIdx}
                    readOnly={readOnly}
                    lockSystemStep={lockSystemStep}
                  />
                ))}
              </Reorder.Group>
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
