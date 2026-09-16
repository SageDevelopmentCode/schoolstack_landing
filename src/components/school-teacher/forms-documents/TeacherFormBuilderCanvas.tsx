"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { BUILDER_CANVAS_BG } from "@/components/school-admin/admissions/outline-item-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { TeacherFormInlineSwitch } from "./TeacherFormSettingToggle";
import {
  FIELD_TYPE_LABELS,
  type TeacherFormField,
} from "@/lib/school-teacher/forms-documents/types";

type TeacherFormBuilderCanvasProps = {
  theme: ParentThemeTokens;
  fields: TeacherFormField[];
  activeFieldId: string | null;
  formTitle: string;
  onUpdateField: (fieldId: string, updates: Partial<TeacherFormField>) => void;
};

function FieldPreview({
  theme,
  field,
  isActive,
  onUpdate,
}: {
  theme: ParentThemeTokens;
  field: TeacherFormField;
  isActive: boolean;
  onUpdate: (updates: Partial<TeacherFormField>) => void;
}) {
  const borderColor = isActive ? theme.sage : "#E0E7E0";

  return (
    <AdminCard
      theme={theme}
      padding="canvas"
      style={{ borderColor, backgroundColor: theme.white }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          {FIELD_TYPE_LABELS[field.type]}
        </span>
        {field.locked ? (
          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: theme.muted }}>
            <Lock className="h-3 w-3" />
            Locked
          </span>
        ) : null}
      </div>

      {field.locked ? (
        <p className="text-sm font-medium" style={{ color: theme.ink }}>{field.label}</p>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium" style={{ color: theme.muted }}>
            Question label
          </span>
          <input
            type="text"
            value={field.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              borderColor: theme.line,
              color: theme.ink,
              backgroundColor: theme.cream,
            }}
          />
        </label>
      )}

      <TeacherFormInlineSwitch
        theme={theme}
        label="Required"
        checked={field.required}
        disabled={field.locked}
        onChange={(required) => onUpdate({ required })}
      />

      {field.type === "multiple_choice" && !field.locked ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium" style={{ color: theme.muted }}>
            Options (one per line)
          </p>
          <textarea
            value={(field.options ?? ["Option 1", "Option 2"]).join("\n")}
            onChange={(event) =>
              onUpdate({
                options: event.target.value.split("\n").filter(Boolean),
              })
            }
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: theme.line,
              color: theme.ink,
              backgroundColor: theme.cream,
            }}
          />
        </div>
      ) : null}

      {field.type === "signature" ? (
        <div
          className="mt-4 flex h-20 items-center justify-center rounded-lg border border-dashed"
          style={{ borderColor: theme.line, backgroundColor: theme.cream }}
        >
          <p className="text-xs" style={{ color: theme.muted }}>
            Signature pad preview
          </p>
        </div>
      ) : null}
    </AdminCard>
  );
}

function PreviewModal({
  theme,
  formTitle,
  fields,
  onClose,
}: {
  theme: ParentThemeTokens;
  formTitle: string;
  fields: TeacherFormField[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(40, 57, 67, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-xl"
        style={{ backgroundColor: theme.white, borderColor: theme.line }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          Parent preview
        </p>
        <h3
          className="mt-1 font-serif text-xl font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {formTitle || "Untitled form"}
        </h3>
        <div className="mt-5 flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.id}>
              <p className="text-sm font-medium" style={{ color: theme.ink }}>
                {field.label}
                {field.required ? " *" : ""}
              </p>
              {field.type === "signature" ? (
                <div
                  className="mt-2 h-16 rounded-lg border border-dashed"
                  style={{ borderColor: theme.line }}
                />
              ) : field.type === "long_text" ? (
                <div
                  className="mt-2 h-20 rounded-lg border"
                  style={{ borderColor: theme.line, backgroundColor: theme.cream }}
                />
              ) : field.type === "checkbox" ? (
                <label className="mt-2 flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
                  <input type="checkbox" disabled className="h-4 w-4" />
                  Yes
                </label>
              ) : field.type === "multiple_choice" ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {(field.options ?? ["Option 1"]).map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
                      <input type="radio" disabled className="h-4 w-4" />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <div
                  className="mt-2 h-10 rounded-lg border"
                  style={{ borderColor: theme.line, backgroundColor: theme.cream }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Close preview
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export default function TeacherFormBuilderCanvas({
  theme,
  fields,
  activeFieldId,
  formTitle,
  onUpdateField,
}: TeacherFormBuilderCanvasProps) {
  const [showPreview, setShowPreview] = useState(false);
  const activeField = fields.find((field) => field.id === activeFieldId) ?? fields[0];

  return (
    <div
      className="flex h-full flex-col rounded-2xl border p-4 sm:p-5"
      style={{ backgroundColor: BUILDER_CANVAS_BG, borderColor: "#E0E7E0" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          Form builder
        </p>
        <AdminButton theme={theme} variant="outline" size="compact" onClick={() => setShowPreview(true)}>
          <Eye className="h-3.5 w-3.5" />
          Preview
        </AdminButton>
      </div>

      {activeField ? (
        <FieldPreview
          theme={theme}
          field={activeField}
          isActive={true}
          onUpdate={(updates) => onUpdateField(activeField.id, updates)}
        />
      ) : (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-sm" style={{ color: theme.muted }}>
            Add a field from the outline to get started.
          </p>
        </AdminCard>
      )}

      {showPreview ? (
        <PreviewModal
          theme={theme}
          formTitle={formTitle}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      ) : null}
    </div>
  );
}
