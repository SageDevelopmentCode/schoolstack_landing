"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  newAdmissionsId,
  type ApplicationAcknowledgment,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { BuilderQuestionCard } from "./builder-question-card";

type ApplicationFormAcknowledgmentsEditorProps = {
  C: AdminThemeTokens;
  acknowledgments: ApplicationAcknowledgment[];
  readOnly: boolean;
  onChange: (acknowledgments: ApplicationAcknowledgment[]) => void;
  hideHeader?: boolean;
};

export default function ApplicationFormAcknowledgmentsEditor({
  C,
  acknowledgments,
  readOnly,
  onChange,
  hideHeader = false,
}: ApplicationFormAcknowledgmentsEditorProps) {
  const inputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const updateAck = (id: string, label: string) => {
    onChange(
      acknowledgments.map((ack) => (ack.id === id ? { ...ack, label } : ack)),
    );
  };

  const removeAck = (id: string) => {
    onChange(acknowledgments.filter((ack) => ack.id !== id));
  };

  const addAck = () => {
    onChange([
      ...acknowledgments,
      {
        id: newAdmissionsId(),
        label: "I understand and agree to the admissions policies.",
      },
    ]);
  };

  const editorBody = (
    <>
      {acknowledgments.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No acknowledgments yet.
        </p>
      ) : (
        <div className="space-y-2">
          {acknowledgments.map((ack, index) => (
            <div key={ack.id} className="flex gap-2 items-start">
              <span
                className="mt-2 text-[10px] font-bold shrink-0"
                style={{ color: C.textTertiary }}
              >
                {index + 1}.
              </span>
              <textarea
                rows={2}
                value={ack.label}
                disabled={readOnly}
                onChange={(e) => updateAck(ack.id, e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => removeAck(ack.id)}
                  className="mt-1 rounded p-1.5 shrink-0"
                  style={{ color: C.error, backgroundColor: C.errorBg }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {!readOnly ? (
        <button
          type="button"
          onClick={addAck}
          className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `1px solid ${C.secondaryBtnBorder}`,
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add acknowledgment
        </button>
      ) : null}
    </>
  );

  if (hideHeader) {
    return (
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="What must families agree to before they submit?"
        helper="Each item appears as a checkbox on the final review screen."
      >
        <div className="space-y-4">{editorBody}</div>
      </BuilderQuestionCard>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Parent acknowledgments
        </p>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          Checkbox statements families must confirm before submitting.
        </p>
      </div>
      {editorBody}
    </div>
  );
}
