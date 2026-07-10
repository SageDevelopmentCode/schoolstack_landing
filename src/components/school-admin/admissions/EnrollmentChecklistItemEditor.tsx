"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import {
  deriveVariantKey,
  hasItemVariantMetadata,
  isAgreementItemType,
  isInlineAgreementItem,
  isPdfAgreementItem,
  newVariantGroupId,
  readItemVariantDraft,
  setItemVariantConfig,
  type ChecklistVariantConfig,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFormFeePanel from "./ApplicationFormFeePanel";
import ApplicationFormQuestionList from "./ApplicationFormQuestionList";
import AgreementOptionsDialog from "./AgreementOptionsDialog";
import {
  EnrollmentInlineAgreementEditor,
  EnrollmentPdfAgreementEditor,
} from "./EnrollmentAgreementEditor";

type EnrollmentChecklistItemEditorProps = {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  organizationId: string;
  templateId: string;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  readOnly?: boolean;
  onChange: (item: EnrollmentChecklistItem) => void;
  onSelectField: (fieldId: string) => void;
  onAddVariant?: () => void;
  onSetDefaultVariant?: () => void;
  allItems?: EnrollmentChecklistItem[];
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

function HelperText({ C, children }: { C: AdminThemeTokens; children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: C.textTertiary }}>
      {children}
    </p>
  );
}

function getAgreementOptionsSummary(
  variantEnabled: boolean,
  siblingCount: number,
): string {
  if (!variantEnabled) return "Same agreement for everyone";
  if (siblingCount < 2) return "Different agreements — add another option";
  return `${siblingCount} agreement options · staff picks one per student`;
}

export default function EnrollmentChecklistItemEditor({
  C,
  item,
  organizationId,
  templateId,
  orgSlug,
  stripePaymentsReady = true,
  readOnly = false,
  onChange,
  onSelectField,
  onAddVariant,
  onSetDefaultVariant,
  allItems = [],
}: EnrollmentChecklistItemEditorProps) {
  const style = inputStyle(C);
  const variantEnabled = hasItemVariantMetadata(item);
  const variantDraft = readItemVariantDraft(item);
  const isAgreement = isAgreementItemType(item.type);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptionsModalOpen(false);
    setOptionsMenuOpen(false);
  }, [item.id]);

  useEffect(() => {
    if (!optionsMenuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!optionsMenuRef.current?.contains(event.target as Node)) {
        setOptionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [optionsMenuOpen]);

  const siblingCount = variantDraft
    ? allItems.filter(
        (row) => readItemVariantDraft(row)?.groupId === variantDraft.groupId,
      ).length
    : 0;
  const groupLabelValue = variantDraft?.groupLabel ?? "";
  const optionsSummary = getAgreementOptionsSummary(variantEnabled, siblingCount);
  const needsSetup =
    variantEnabled && (!groupLabelValue.trim() || !item.label.trim());

  const patch = (updates: Partial<EnrollmentChecklistItem>) => {
    if (readOnly) return;
    onChange({ ...item, ...updates });
  };

  const patchVariant = (updates: Partial<ChecklistVariantConfig> | null) => {
    if (readOnly) return;
    if (updates === null) {
      onChange(setItemVariantConfig(item, null));
      return;
    }
    const current = variantDraft ?? {
      groupId: newVariantGroupId(),
      groupLabel: item.label,
      variantKey: deriveVariantKey(item),
      isDefault: true,
    };
    onChange(setItemVariantConfig(item, { ...current, ...updates }));
  };

  const fields = item.formSchema?.fields ?? [];
  const showGroupLabelHint = variantEnabled && !groupLabelValue.trim();
  const showOptionLabelHint = variantEnabled && !item.label.trim();

  const agreementDocumentEditor = (
    <>
      {isInlineAgreementItem(item) && item.document?.kind === "inline_sections" ? (
        <EnrollmentInlineAgreementEditor
          C={C}
          document={item.document}
          readOnly={readOnly}
          onChange={(document) => patch({ document })}
        />
      ) : null}

      {isPdfAgreementItem(item) && item.document?.kind === "pdf" ? (
        <EnrollmentPdfAgreementEditor
          C={C}
          document={item.document}
          organizationId={organizationId}
          templateId={templateId}
          itemId={item.id}
          readOnly={readOnly}
          onChange={(document) => patch({ document })}
        />
      ) : null}
    </>
  );

  return (
    <div className="space-y-4">
      {isAgreement ? (
        <div className="flex items-center justify-between gap-3">
          <label
            className="flex items-center gap-2 text-[11px] font-medium"
            style={{ color: C.textSecondary }}
          >
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

          <div className="relative shrink-0" ref={optionsMenuRef}>
            <button
              type="button"
              onClick={() => setOptionsMenuOpen((open) => !open)}
              aria-label="Agreement options menu"
              aria-expanded={optionsMenuOpen}
              className="relative rounded p-1.5"
              style={{
                color: optionsModalOpen ? C.accent : C.textSecondary,
                backgroundColor: optionsModalOpen ? C.accentLight : "transparent",
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
              {needsSetup ? (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: C.warning }}
                />
              ) : null}
            </button>

            {optionsMenuOpen ? (
              <div
                className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border py-1 shadow-lg"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOptionsModalOpen(true);
                    setOptionsMenuOpen(false);
                  }}
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs"
                  style={{ color: C.textPrimary }}
                >
                  <span className="font-semibold">Manage agreement options</span>
                  <span className="text-[10px]" style={{ color: C.textTertiary }}>
                    {optionsSummary}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <label
          className="flex items-center gap-2 text-[11px] font-medium"
          style={{ color: C.textSecondary }}
        >
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
      )}

      {isAgreement ? (
        <>
          <AgreementOptionsDialog
            C={C}
            open={optionsModalOpen}
            onClose={() => setOptionsModalOpen(false)}
            item={item}
            readOnly={readOnly}
            optionsSummary={optionsSummary}
            variantEnabled={variantEnabled}
            variantDraft={variantDraft}
            groupLabelValue={groupLabelValue}
            showGroupLabelHint={showGroupLabelHint}
            showOptionLabelHint={showOptionLabelHint}
            onPatch={patch}
            onPatchVariant={patchVariant}
            onSetDefaultVariant={onSetDefaultVariant}
            onAddVariant={onAddVariant}
          />
          {agreementDocumentEditor}
        </>
      ) : null}

      {item.type === "form" && item.formSchema ? (
        <>
          <label
            className="flex items-center gap-2 text-[11px] font-medium"
            style={{ color: C.textSecondary }}
          >
            <input
              type="checkbox"
              checked={item.formSchema.allowMultiple ?? false}
              onChange={(e) =>
                patch({
                  formSchema: {
                    ...item.formSchema!,
                    allowMultiple: e.target.checked,
                  },
                })
              }
              disabled={readOnly}
              className="h-4 w-4 rounded"
              style={{ accentColor: C.accent }}
            />
            Allow multiple entries
          </label>
        </>
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
            <p className="text-[12px]" style={{ color: C.textSecondary }}>
              {item.fileUpload.accept}
            </p>
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
