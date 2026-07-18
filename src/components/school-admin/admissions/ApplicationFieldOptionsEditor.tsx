"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  newAdmissionsId,
  type ApplicationFieldOption,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFieldOptionsEditorProps = {
  C: AdminThemeTokens;
  options: ApplicationFieldOption[];
  readOnly?: boolean;
  onChange: (options: ApplicationFieldOption[]) => void;
};

function controlStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

function OptionRow({
  C,
  option,
  index,
  readOnly,
  canDelete,
  onLabelChange,
  onDelete,
}: {
  C: AdminThemeTokens;
  option: ApplicationFieldOption;
  index: number;
  readOnly: boolean;
  canDelete: boolean;
  onLabelChange: (label: string) => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  const style = controlStyle(C);

  return (
    <Reorder.Item
      as="div"
      value={option}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div className="flex items-center gap-2">
        {!readOnly ? (
          <button
            type="button"
            aria-label="Drag to reorder"
            className="touch-none cursor-grab shrink-0 rounded p-1 active:cursor-grabbing"
            style={{ color: C.textQuaternary }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
        <span
          className="w-5 shrink-0 text-xs font-bold text-right"
          style={{ color: C.textTertiary }}
        >
          {index + 1}.
        </span>
        <input
          type="text"
          value={option.label}
          disabled={readOnly}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Choice label"
          style={style}
        />
        {!readOnly ? (
          <button
            type="button"
            aria-label="Remove option"
            disabled={!canDelete}
            onClick={onDelete}
            className="shrink-0 rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </Reorder.Item>
  );
}

export default function ApplicationFieldOptionsEditor({
  C,
  options,
  readOnly = false,
  onChange,
}: ApplicationFieldOptionsEditorProps) {
  const canDelete = options.length > 1;

  const updateOption = (index: number, label: string) => {
    const next = [...options];
    next[index] = { ...next[index], label };
    onChange(next);
  };

  const removeOption = (index: number) => {
    if (!canDelete) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        value: newAdmissionsId().slice(0, 6),
        label: "New option",
      },
    ]);
  };

  if (options.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No options yet. Add your first choice below.
        </p>
        {!readOnly ? (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add option
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Reorder.Group
        axis="y"
        values={options}
        onReorder={(next) => !readOnly && onChange(next)}
        className="flex flex-col gap-2"
        as="div"
      >
        {options.map((option, index) => (
          <OptionRow
            key={option.value}
            C={C}
            option={option}
            index={index}
            readOnly={readOnly}
            canDelete={canDelete}
            onLabelChange={(label) => updateOption(index, label)}
            onDelete={() => removeOption(index)}
          />
        ))}
      </Reorder.Group>

      {!readOnly ? (
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-medium"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `1px solid ${C.secondaryBtnBorder}`,
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </button>
      ) : null}
    </div>
  );
}

export function createDefaultFieldOptions(): ApplicationFieldOption[] {
  return [
    { value: newAdmissionsId().slice(0, 6), label: "Option 1" },
    { value: newAdmissionsId().slice(0, 6), label: "Option 2" },
  ];
}
