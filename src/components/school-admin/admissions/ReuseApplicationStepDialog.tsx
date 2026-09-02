"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import type {
  ApplicationFormVersion,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import { isSystemSection } from "@/lib/admissions/apply-system-fields";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";

type ReuseApplicationStepDialogProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  open: boolean;
  sourceForms: ApplicationFormVersion[];
  programNameById: Map<string, string>;
  onClose: () => void;
  onConfirm: (sourceSection: ApplicationSection) => void;
};

function reusableSections(form: ApplicationFormVersion): ApplicationSection[] {
  return form.schema.sections.filter((section) => !isSystemSection(section));
}

export default function ReuseApplicationStepDialog({
  C,
  theme,
  open,
  sourceForms,
  programNameById,
  onClose,
  onConfirm,
}: ReuseApplicationStepDialogProps) {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const selectedForm = useMemo(
    () => sourceForms.find((form) => form.id === selectedFormId) ?? null,
    [selectedFormId, sourceForms],
  );

  const steps = selectedForm ? reusableSections(selectedForm) : [];

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setSelectedFormId(null);
        setSelectedStepId(null);
      });
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedForm || !selectedStepId) return;
    const step = selectedForm.schema.sections.find(
      (section) => section.id === selectedStepId,
    );
    if (!step || isSystemSection(step)) return;
    onConfirm(step);
  };

  const formLabel = (form: ApplicationFormVersion) => {
    const programName = form.program_id
      ? programNameById.get(form.program_id)
      : null;
    return programName ? `${form.title} · ${programName}` : form.title;
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="flex max-h-[min(32rem,85vh)] w-full max-w-md flex-col rounded-2xl p-5 shadow-xl"
            style={{
              backgroundColor: theme?.paper ?? C.surface,
              border: `1px solid ${theme?.line ?? C.border}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {theme ? (
              <AdminDisplayHeading theme={theme} as="h2" size="section" className="text-lg">
                Reuse step
              </AdminDisplayHeading>
            ) : (
              <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                Reuse step
              </h2>
            )}
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              {selectedForm
                ? "Choose a step to copy into this one."
                : "Choose an application, then pick a step to copy."}
            </p>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              {!selectedForm ? (
                sourceForms.length === 0 ? (
                  <p className="text-sm" style={{ color: C.textTertiary }}>
                    No other applications to copy from.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sourceForms.map((form) => (
                      <li key={form.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFormId(form.id);
                            setSelectedStepId(null);
                          }}
                          className="flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm"
                          style={{
                            borderColor: theme?.line ?? C.border,
                            backgroundColor: theme?.paper ?? C.bg,
                            color: C.textPrimary,
                          }}
                        >
                          <span className="font-semibold">{formLabel(form)}</span>
                          <span className="text-xs" style={{ color: C.textTertiary }}>
                            {reusableSections(form).length} step
                            {reusableSections(form).length === 1 ? "" : "s"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              ) : steps.length === 0 ? (
                <p className="text-sm" style={{ color: C.textTertiary }}>
                  No reusable steps in this application.
                </p>
              ) : (
                <ul className="space-y-2">
                  {steps.map((step, index) => (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStepId(step.id)}
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm"
                        style={{
                          borderColor:
                            selectedStepId === step.id
                              ? (theme?.primary ?? C.accent)
                              : (theme?.line ?? C.border),
                          backgroundColor:
                            selectedStepId === step.id
                              ? (theme?.primarySoft ?? C.accentLight)
                              : (theme?.paper ?? C.bg),
                          color: C.textPrimary,
                        }}
                      >
                        <span className="font-semibold">
                          {step.title || `Step ${index + 1}`}
                        </span>
                        <span className="text-xs" style={{ color: C.textTertiary }}>
                          {step.fields.length} question
                          {step.fields.length === 1 ? "" : "s"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div>
                {selectedForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormId(null);
                      setSelectedStepId(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                {theme ? (
                  <AdminButton theme={theme} variant="soft" onClick={onClose}>
                    Cancel
                  </AdminButton>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    Cancel
                  </button>
                )}
                {theme ? (
                  <AdminButton
                    theme={theme}
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={!selectedStepId}
                  >
                    Use this step
                  </AdminButton>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedStepId}
                    className="rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
                    style={{
                      backgroundColor: C.accent,
                      color: "#fff",
                    }}
                  >
                    Use this step
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
