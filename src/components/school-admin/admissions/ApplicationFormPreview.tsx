"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import type {
  ApplicationFormSchema,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFormPreviewProps = {
  C: AdminThemeTokens;
  title: string;
  intro: string | null;
  schema: ApplicationFormSchema;
  open: boolean;
  initialStepId?: string | null;
  onClose: () => void;
};

export default function ApplicationFormPreview({
  C,
  title,
  intro,
  schema,
  open,
  initialStepId,
  onClose,
}: ApplicationFormPreviewProps) {
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => {
    const list: ApplicationSection[] = [...schema.sections];
    if (schema.acknowledgments.length > 0) {
      list.push({
        id: "__acknowledgments__",
        title: "Parent acknowledgments",
        description: "Please confirm the following before submitting.",
        fields: [],
      });
    }
    return list;
  }, [schema]);

  const activeStep = steps[stepIndex] ?? null;
  const isAckStep = activeStep?.id === "__acknowledgments__";

  useEffect(() => {
    if (!open) return;
    if (!initialStepId) {
      setStepIndex(0);
      return;
    }
    const idx = steps.findIndex((s) => s.id === initialStepId);
    setStepIndex(idx >= 0 ? idx : 0);
  }, [initialStepId, open, steps]);

  return (
    <AnimatePresence>
      {open && activeStep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9999 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="rounded-md overflow-hidden flex flex-col"
            style={{
              width: "min(860px, 90vw)",
              maxHeight: "85vh",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FC605B" }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FDBC40" }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#34C749" }} />
              </div>
              <div
                className="flex-1 mx-3 px-3 py-1 rounded text-xs text-center"
                style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}
              >
                yourschool.schoolstack.io/apply
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-0.5"
                style={{ color: "#9CA3AF" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-8">
              <div className="w-full mx-auto" style={{ maxWidth: 520 }}>
                {stepIndex === 0 && intro ? (
                  <div className="mb-6">
                    <h1
                      className="text-2xl font-semibold mb-2"
                      style={{ color: C.accentDark }}
                    >
                      {title}
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                      {intro}
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 mb-6">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor:
                            i === stepIndex
                              ? C.accent
                              : i < stepIndex
                                ? C.accentLight
                                : "#F3F4F6",
                          color:
                            i === stepIndex
                              ? "#fff"
                              : i < stepIndex
                                ? C.accent
                                : "#9CA3AF",
                        }}
                      >
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className="w-6 h-0.5 rounded"
                          style={{
                            backgroundColor: i < stepIndex ? C.accent : "#E5E7EB",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-bold mb-1" style={{ color: "#111827" }}>
                  {activeStep.title}
                </h2>
                {activeStep.description ? (
                  <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
                    {activeStep.description}
                  </p>
                ) : (
                  <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
                    Please fill out the fields below to continue.
                  </p>
                )}

                {isAckStep ? (
                  <div className="space-y-3">
                    {schema.acknowledgments.map((ack) => (
                      <label
                        key={ack.id}
                        className="flex items-start gap-3 rounded-md border px-4 py-3"
                        style={{ borderColor: C.border }}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4"
                          style={{ accentColor: C.accent }}
                          readOnly
                        />
                        <span className="text-sm" style={{ color: C.textPrimary }}>
                          {ack.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {activeStep.fields.map((field) => (
                      <label
                        key={field.id}
                        className={
                          field.width === "half"
                            ? "block min-w-0"
                            : "block min-w-0 sm:col-span-2"
                        }
                      >
                        {field.type !== "checkbox" && (
                          <span
                            className="mb-1.5 block text-sm font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {field.label}
                            {field.required ? (
                              <span style={{ color: C.error }}> *</span>
                            ) : null}
                          </span>
                        )}
                        <ApplicationFieldInput
                          field={field}
                          value={previewValues[field.id] ?? ""}
                          onChange={(value) =>
                            setPreviewValues((prev) => ({ ...prev, [field.id]: value }))
                          }
                          C={C}
                          disabled
                        />
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="mt-8 w-full py-3 rounded-sm text-sm font-semibold text-white"
                  style={{ backgroundColor: C.accent, opacity: 0.85 }}
                  disabled
                >
                  {stepIndex === steps.length - 1 ? "Submit application" : "Next step"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
