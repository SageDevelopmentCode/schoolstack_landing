"use client";

import { useState } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { ChevronDown, Eye, GripVertical, Layers, Plus, X } from "lucide-react";
import type {
  ApplicationField,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFormFieldEditor, {
  ApplicationFormFieldPresetPicker,
  createBlankField,
} from "./ApplicationFormFieldEditor";

type ApplicationFormSectionEditorProps = {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  totalSteps: number;
  isExpanded: boolean;
  readOnly: boolean;
  onToggleExpand: () => void;
  onPreview: () => void;
  updateStepTitle: (stepId: string, title: string) => void;
  updateStepDescription: (stepId: string, description: string) => void;
  deleteStep: (stepId: string) => void;
  addField: (stepId: string, field: ApplicationField) => void;
  updateField: (
    stepId: string,
    fieldId: string,
    patch: Partial<ApplicationField>,
  ) => void;
  deleteField: (stepId: string, fieldId: string) => void;
  setStepFieldsOrder: (stepId: string, fields: ApplicationField[]) => void;
};

export default function ApplicationFormSectionEditor({
  C,
  step,
  stepIdx,
  totalSteps,
  isExpanded,
  readOnly,
  onToggleExpand,
  onPreview,
  updateStepTitle,
  updateStepDescription,
  deleteStep,
  addField,
  updateField,
  deleteField,
  setStepFieldsOrder,
}: ApplicationFormSectionEditorProps) {
  const [hovered, setHovered] = useState(false);
  const dragControls = useDragControls();
  const isLast = stepIdx === totalSteps - 1;

  const fieldInputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "6px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const summary =
    step.fields.length === 0
      ? "No questions yet"
      : `${step.fields.length} question${step.fields.length === 1 ? "" : "s"}`;

  return (
    <Reorder.Item
      as="div"
      value={step}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex gap-3"
      style={{ listStyle: "none" }}
      layout="position"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex w-6 flex-shrink-0 flex-col items-center">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `2px solid ${C.accent}`,
          }}
        >
          {stepIdx + 1}
        </div>
        {!isLast && (
          <div
            className="mt-1 w-px flex-1 min-h-[12px]"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>

      <div className="mb-3 min-w-0 flex-1">
        <div
          className="overflow-hidden rounded-sm"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${isExpanded ? C.accent : C.border}`,
            boxShadow: isExpanded ? `0 0 0 2px ${C.accentLight}` : C.shadowCard,
          }}
        >
          <div className="flex w-full items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                style={{ backgroundColor: C.accentLight, color: C.accent }}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                  {step.title || "Untitled step"}
                </div>
                {!isExpanded && (
                  <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textTertiary }}>
                    {summary}
                  </div>
                )}
              </div>
            </button>

            <div className="flex flex-shrink-0 items-center gap-0.5">
              {!readOnly && (
                <button
                  type="button"
                  aria-label="Drag to reorder step"
                  className="touch-none cursor-grab rounded p-1 active:cursor-grabbing"
                  style={{ color: C.textQuaternary }}
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                aria-label="Preview step"
                onClick={onPreview}
                className="rounded p-1"
                style={{ color: C.textTertiary }}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              {!readOnly && hovered && (
                <button
                  type="button"
                  aria-label="Remove step"
                  onClick={() => deleteStep(step.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.errorBg, color: C.error }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleExpand}
                className="rounded p-1"
                style={{ color: C.textTertiary }}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-150"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="space-y-4 px-3 pb-3 pt-2"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div>
                    <label
                      className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: C.textTertiary }}
                    >
                      Page title families see
                    </label>
                    <input
                      value={step.title}
                      onChange={(e) => updateStepTitle(step.id, e.target.value)}
                      disabled={readOnly}
                      placeholder="e.g. Parent Information"
                      style={fieldInputStyle}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: C.textTertiary }}
                    >
                      Section intro (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={step.description ?? ""}
                      onChange={(e) =>
                        updateStepDescription(step.id, e.target.value)
                      }
                      disabled={readOnly}
                      placeholder="Instructions shown at the top of this step"
                      style={{ ...fieldInputStyle, resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <p
                      className="mb-2 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: C.textTertiary }}
                    >
                      Questions
                    </p>
                    {step.fields.length === 0 ? (
                      <p className="mb-2 text-[11px]" style={{ color: C.textTertiary }}>
                        No questions on this step yet.
                      </p>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={step.fields}
                        onReorder={(fields) =>
                          !readOnly && setStepFieldsOrder(step.id, fields)
                        }
                        className="flex flex-col gap-2"
                        as="div"
                      >
                        {step.fields.map((field) => (
                          <ApplicationFormFieldEditor
                            key={field.id}
                            C={C}
                            stepId={step.id}
                            field={field}
                            updateField={readOnly ? () => {} : updateField}
                            deleteField={readOnly ? () => {} : deleteField}
                          />
                        ))}
                      </Reorder.Group>
                    )}

                    {!readOnly && (
                      <div className="mt-3">
                        <ApplicationFormFieldPresetPicker
                          C={C}
                          stepId={step.id}
                          onAddPreset={(sid, field) => addField(sid, field)}
                          onAddBlank={(sid) => addField(sid, createBlankField())}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function AddSectionButton({
  C,
  onClick,
}: {
  C: AdminThemeTokens;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm px-3 py-2.5 text-[11px] font-medium"
      style={{
        border: `2px dashed ${C.borderStrong}`,
        color: C.textTertiary,
        backgroundColor: "transparent",
      }}
    >
      <Plus className="h-3.5 w-3.5" />
      Add step
    </button>
  );
}
