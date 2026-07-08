"use client";

import { Plus, Trash2 } from "lucide-react";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFormFeePanel from "./ApplicationFormFeePanel";
import ApplicationFormQuestionList from "./ApplicationFormQuestionList";
import EnrollmentAgreementEditor from "./EnrollmentAgreementEditor";

type EnrollmentChecklistItemEditorProps = {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  onChange: (item: EnrollmentChecklistItem) => void;
  onSelectField: (fieldId: string) => void;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };
}

function LabeledField({
  C,
  label,
  children,
}: {
  C: AdminThemeTokens;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1 block text-[10px] font-medium"
        style={{ color: C.textTertiary }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EnrollmentChecklistItemEditor({
  C,
  item,
  orgSlug,
  stripePaymentsReady = true,
  readOnly = false,
  onChange,
  onSelectField,
}: EnrollmentChecklistItemEditorProps) {
  const style = inputStyle(C);

  const patch = (updates: Partial<EnrollmentChecklistItem>) => {
    if (readOnly) return;
    onChange({ ...item, ...updates });
  };

  const fields = item.formSchema?.fields ?? [];

  return (
    <div className="space-y-4">
      <LabeledField C={C} label="Checklist item title">
        <input
          type="text"
          value={item.label}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder="e.g. Photo Release Form"
          disabled={readOnly}
          style={style}
        />
      </LabeledField>

      <label className="flex items-center gap-2 text-[11px] font-medium" style={{ color: C.textSecondary }}>
        <input
          type="checkbox"
          checked={item.required}
          onChange={(e) => patch({ required: e.target.checked })}
          disabled={readOnly}
          className="h-4 w-4 rounded"
          style={{ accentColor: C.accent }}
        />
        Required for enrollment completion
      </label>

      {item.type === "document_sign" && item.document ? (
        <EnrollmentAgreementEditor
          C={C}
          document={item.document}
          onChange={(document) => patch({ document })}
        />
      ) : null}

      {item.type === "form" && item.formSchema ? (
        <ApplicationFormQuestionList
          C={C}
          stepId={item.formSchema.id}
          fields={fields}
          selectedFieldId={null}
          readOnly={readOnly}
          onSelectField={onSelectField}
          onAddField={(field: ApplicationField) => {
            if (readOnly) return;
            onChange({
              ...item,
              formSchema: {
                ...item.formSchema!,
                fields: [...fields, field],
              },
            });
          }}
          onReorderFields={(nextFields) => {
            if (readOnly) return;
            onChange({
              ...item,
              formSchema: {
                ...item.formSchema!,
                fields: nextFields,
              },
            });
          }}
        />
      ) : null}

      {item.type === "file_upload" && item.fileUpload ? (
        <div className="space-y-3">
          <LabeledField C={C} label="Instructions for families">
            <textarea
              rows={2}
              value={item.fileUpload.helpText}
              onChange={(e) =>
                patch({
                  fileUpload: { ...item.fileUpload!, helpText: e.target.value },
                })
              }
              disabled={readOnly}
              style={{ ...style, resize: "vertical" }}
            />
          </LabeledField>
          <LabeledField C={C} label="Accepted file types">
            <input
              type="text"
              value={item.fileUpload.accept}
              onChange={(e) =>
                patch({
                  fileUpload: { ...item.fileUpload!, accept: e.target.value },
                })
              }
              placeholder=".pdf,.jpg,.jpeg,.png"
              disabled={readOnly}
              style={style}
            />
          </LabeledField>
          <LabeledField C={C} label="Maximum files">
            <input
              type="number"
              min={1}
              max={10}
              value={item.fileUpload.maxFiles}
              onChange={(e) =>
                patch({
                  fileUpload: {
                    ...item.fileUpload!,
                    maxFiles: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                  },
                })
              }
              disabled={readOnly}
              style={style}
            />
          </LabeledField>
        </div>
      ) : null}

      {item.type === "payment" && item.payment ? (
        <ApplicationFormFeePanel
          C={C}
          hideHeader
          orgSlug={orgSlug}
          stripePaymentsReady={stripePaymentsReady}
          feeConfig={{
            enabled: true,
            label: item.payment.label,
            amount_cents: item.payment.amountCents,
            required_to_submit: item.required,
          }}
          readOnly={readOnly}
          onChange={(feeConfig) =>
            patch({
              payment: {
                label: feeConfig.label ?? item.payment!.label,
                amountCents: feeConfig.amount_cents ?? item.payment!.amountCents,
              },
            })
          }
        />
      ) : null}

      {item.type === "acknowledgment" && item.acknowledgment ? (
        <div className="space-y-3">
          <LabeledField C={C} label="Instructions">
            <textarea
              rows={3}
              value={item.acknowledgment.body}
              onChange={(e) =>
                patch({
                  acknowledgment: { ...item.acknowledgment!, body: e.target.value },
                })
              }
              style={{ ...style, resize: "vertical" }}
            />
          </LabeledField>

          {item.acknowledgment.options && item.acknowledgment.options.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>
                Choice options
              </p>
              {item.acknowledgment.options.map((option, index) => (
                <div key={option.value} className="flex gap-2 items-start">
                  <span
                    className="mt-2 text-[10px] font-bold shrink-0"
                    style={{ color: C.textTertiary }}
                  >
                    {index + 1}.
                  </span>
                  <textarea
                    rows={2}
                    value={option.label}
                    onChange={(e) => {
                      const options = [...(item.acknowledgment?.options ?? [])];
                      options[index] = { ...option, label: e.target.value };
                      patch({
                        acknowledgment: { ...item.acknowledgment!, options },
                      });
                    }}
                    style={{ ...style, resize: "vertical" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const options = (item.acknowledgment?.options ?? []).filter(
                        (o) => o.value !== option.value,
                      );
                      patch({
                        acknowledgment: { ...item.acknowledgment!, options },
                      });
                    }}
                    className="mt-1 rounded p-1.5 shrink-0"
                    style={{ color: C.error, backgroundColor: C.errorBg }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              const options = [
                ...(item.acknowledgment?.options ?? []),
                {
                  value: newAdmissionsId().slice(0, 6),
                  label: "New option",
                },
              ];
              patch({
                acknowledgment: { ...item.acknowledgment!, options },
              });
            }}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add choice option
          </button>
        </div>
      ) : null}
    </div>
  );
}
