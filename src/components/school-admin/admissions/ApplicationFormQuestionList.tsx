"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import { fieldTypeLabel } from "@/lib/admissions/field-presets";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  ApplicationFormFieldPresetPicker,
  createBlankField,
} from "./ApplicationFormFieldEditor";

type ApplicationFormQuestionListProps = {
  C: AdminThemeTokens;
  stepId: string;
  fields: ApplicationField[];
  selectedFieldId: string | null;
  readOnly: boolean;
  onSelectField: (fieldId: string) => void;
  onAddField: (field: ApplicationField) => void;
  onReorderFields: (fields: ApplicationField[]) => void;
};

function QuestionRow({
  C,
  field,
  active,
  readOnly,
  onSelect,
}: {
  C: AdminThemeTokens;
  field: ApplicationField;
  active: boolean;
  readOnly: boolean;
  onSelect: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={field}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div
        className="flex items-center rounded-md border transition-colors"
        style={{
          borderColor: active ? C.accent : C.border,
          backgroundColor: active ? C.accentLight : C.surface,
          boxShadow: active ? `0 0 0 1px ${C.accent}20` : "none",
        }}
      >
        {!readOnly && (
          <button
            type="button"
            aria-label="Drag to reorder"
            className="touch-none cursor-grab px-2 py-3 active:cursor-grabbing shrink-0"
            style={{ color: C.textQuaternary }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 py-3 pr-3 text-left"
          style={{ paddingLeft: readOnly ? 12 : 0 }}
        >
          <span
            className="min-w-0 flex-1 truncate text-sm font-medium"
            style={{ color: C.textPrimary }}
          >
            {field.label || "Untitled question"}
          </span>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: C.bg, color: C.textTertiary }}
          >
            {fieldTypeLabel(field.type)}
          </span>
          {field.required && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: C.error }}
              title="Required"
            />
          )}
          <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textQuaternary }} />
        </button>
      </div>
    </Reorder.Item>
  );
}

export default function ApplicationFormQuestionList({
  C,
  stepId,
  fields,
  selectedFieldId,
  readOnly,
  onSelectField,
  onAddField,
  onReorderFields,
}: ApplicationFormQuestionListProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleAddPreset = (id: string, field: ApplicationField) => {
    void id;
    onAddField(field);
    setShowPicker(false);
  };

  const handleAddBlank = () => {
    const field = createBlankField();
    onAddField(field);
    setShowPicker(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Questions
        </p>
        <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
          Click a question to edit it. Families answer these on this step.
        </p>
      </div>

      {fields.length === 0 ? (
        <div
          className="rounded-md border border-dashed px-4 py-8 text-center"
          style={{ borderColor: C.border, color: C.textTertiary }}
        >
          <p className="text-sm">No questions on this step yet.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={fields}
          onReorder={(next) => !readOnly && onReorderFields(next)}
          className="flex flex-col gap-2"
          as="div"
        >
          {fields.map((field) => (
            <QuestionRow
              key={field.id}
              C={C}
              field={field}
              active={selectedFieldId === field.id}
              readOnly={readOnly}
              onSelect={() => onSelectField(field.id)}
            />
          ))}
        </Reorder.Group>
      )}

      {!readOnly && (
        <div>
          {!showPicker ? (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: C.accent }}
            >
              <Plus className="h-4 w-4" />
              Add question
            </button>
          ) : (
            <div
              className="rounded-md border p-3 space-y-2"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
            >
              <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
                Quick add
              </p>
              <ApplicationFormFieldPresetPicker
                C={C}
                stepId={stepId}
                onAddPreset={(sid, field) => {
                  handleAddPreset(sid, field);
                }}
                onAddBlank={() => handleAddBlank()}
              />
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="text-xs"
                style={{ color: C.textTertiary }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
