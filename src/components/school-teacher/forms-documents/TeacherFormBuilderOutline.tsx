"use client";

import { useMemo } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical, Lock, Plus, Trash2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { outlineActiveRowStyle } from "@/components/school-admin/admissions/outline-item-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FIELD_TYPE_LABELS,
  type TeacherFormField,
  type TeacherFormFieldType,
} from "@/lib/school-teacher/forms-documents/types";
import { moveFormField, splitFormBuilderFields } from "@/lib/school-teacher/forms-documents/utils";

type TeacherFormBuilderOutlineProps = {
  theme: ParentThemeTokens;
  fields: TeacherFormField[];
  activeFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onAddField: (type: TeacherFormFieldType) => void;
  onRemoveField: (fieldId: string) => void;
  onReorderFields: (fields: TeacherFormField[]) => void;
};

const ADDABLE_FIELD_TYPES: TeacherFormFieldType[] = [
  "short_text",
  "long_text",
  "checkbox",
  "multiple_choice",
  "date",
];

function OutlineFieldRow({
  theme,
  field,
  index,
  active,
  draggable,
  canMoveUp,
  canMoveDown,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  theme: ParentThemeTokens;
  field: TeacherFormField;
  index: number;
  active: boolean;
  draggable: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const dragControls = useDragControls();

  const row = (
    <div
      className="flex items-center rounded-[11px] border transition-colors"
      style={outlineActiveRowStyle(active, theme)}
    >
      {draggable ? (
        <button
          type="button"
          aria-label="Drag to reorder"
          className="hidden shrink-0 cursor-grab touch-none px-2 py-3 active:cursor-grabbing md:block"
          style={{ color: theme.muted }}
          onPointerDown={(event) => dragControls.start(event)}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        className={`flex min-w-0 flex-1 items-start gap-2 py-3 text-left ${
          draggable ? "pr-1 md:pr-2" : "px-3"
        }`}
      >
        <span
          className="mt-0.5 inline-grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: active ? theme.primary : theme.primarySoft,
            color: active ? theme.white : theme.primary,
          }}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: active ? theme.primary : theme.ink }}
          >
            {field.label}
            {field.locked ? (
              <Lock className="h-3 w-3 shrink-0" style={{ color: theme.muted }} />
            ) : null}
          </span>
          <span className="mt-0.5 block text-[10px]" style={{ color: theme.muted }}>
            {FIELD_TYPE_LABELS[field.type]}
          </span>
        </span>
      </button>
      {draggable && (onMoveUp || onMoveDown) ? (
        <div className="flex shrink-0 flex-col gap-0.5 pr-1 md:hidden">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Move ${field.label} up`}
            className="cursor-pointer rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: theme.muted }}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Move ${field.label} down`}
            className="cursor-pointer rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: theme.muted }}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 cursor-pointer rounded p-2 transition-colors hover:bg-white/60"
          style={{ color: theme.muted }}
          aria-label={`Remove ${field.label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );

  if (!draggable) {
    return <div className="mb-1">{row}</div>;
  }

  return (
    <Reorder.Item
      as="div"
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className="mb-1"
      style={{ listStyle: "none" }}
      layout="position"
    >
      {row}
    </Reorder.Item>
  );
}

export default function TeacherFormBuilderOutline({
  theme,
  fields,
  activeFieldId,
  onSelectField,
  onAddField,
  onRemoveField,
  onReorderFields,
}: TeacherFormBuilderOutlineProps) {
  const { reorderableFields, signatureField } = useMemo(
    () => splitFormBuilderFields(fields),
    [fields],
  );

  const handleReorder = (next: TeacherFormField[]) => {
    onReorderFields(signatureField ? [...next, signatureField] : next);
  };

  const handleMove = (fieldId: string, direction: "up" | "down") => {
    onReorderFields(moveFormField(fields, fieldId, direction));
  };

  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
        Fields
      </p>
      <div className="max-h-[220px] flex-1 overflow-y-auto lg:max-h-none">
        <Reorder.Group
          axis="y"
          values={reorderableFields}
          onReorder={handleReorder}
          className="m-0 list-none p-0"
        >
          {reorderableFields.map((field, index) => (
            <OutlineFieldRow
              key={field.id}
              theme={theme}
              field={field}
              index={index}
              active={field.id === activeFieldId}
              draggable
              canMoveUp={index > 0}
              canMoveDown={index < reorderableFields.length - 1}
              onSelect={() => onSelectField(field.id)}
              onRemove={() => onRemoveField(field.id)}
              onMoveUp={() => handleMove(field.id, "up")}
              onMoveDown={() => handleMove(field.id, "down")}
            />
          ))}
        </Reorder.Group>

        {signatureField ? (
          <OutlineFieldRow
            theme={theme}
            field={signatureField}
            index={reorderableFields.length}
            active={signatureField.id === activeFieldId}
            draggable={false}
            onSelect={() => onSelectField(signatureField.id)}
          />
        ) : null}
      </div>

      <div className="mt-4 border-t pt-4" style={{ borderColor: theme.line }}>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          Add field
        </p>
        <div className="flex flex-col gap-1.5">
          {ADDABLE_FIELD_TYPES.map((type) => (
            <AdminButton
              key={type}
              theme={theme}
              variant="soft"
              size="compact"
              className="w-full justify-start"
              onClick={() => onAddField(type)}
            >
              <Plus className="h-3 w-3" />
              {FIELD_TYPE_LABELS[type]}
            </AdminButton>
          ))}
        </div>
      </div>
    </div>
  );
}
