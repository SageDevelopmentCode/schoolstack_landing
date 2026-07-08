"use client";

import { useMemo, useState } from "react";
import { FileText, Upload } from "lucide-react";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentChecklistItemPanelProps = {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
};

function panelButtonStyle(C: AdminThemeTokens, disabled: boolean) {
  return {
    backgroundColor: C.accent,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

function DocumentSignInlinePanel({
  C,
  item,
  mode,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
}) {
  const sections = item.document?.kind === "inline_sections" ? item.document.sections : [];
  const [sectionIndex, setSectionIndex] = useState(0);
  const [signature, setSignature] = useState("");
  const isLive = mode === "live";
  const section = sections[sectionIndex];
  const isLastSection = sectionIndex >= sections.length - 1;

  if (sections.length === 0) {
    return (
      <p className="text-sm" style={{ color: C.textSecondary }}>
        No agreement sections yet.
      </p>
    );
  }

  if (!section) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
          Section {sectionIndex + 1} of {sections.length}
        </p>
        <h2 className="mt-2 text-lg font-semibold" style={{ color: C.textPrimary }}>
          {section.title}
        </h2>
        <p
          className="mt-4 whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: C.textPrimary }}
        >
          {section.body}
        </p>

        {item.document?.kind === "inline_sections" && item.document.showWarningBanner ? (
          <div
            className="mt-4 rounded-md border px-3 py-2 text-xs"
            style={{
              borderColor: C.warning,
              backgroundColor: C.warningBg,
              color: C.warning,
            }}
          >
            Please read this section carefully before signing.
          </div>
        ) : null}

        <div className="mt-6">
          <label
            className="mb-1.5 block text-xs font-medium"
            style={{ color: C.textSecondary }}
          >
            Type your full legal name to sign
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            disabled={!isLive}
            placeholder="Full legal name"
            className="w-full rounded-md border px-3 py-2.5 text-sm outline-none"
            style={{
              borderColor: C.inputBorder,
              backgroundColor: isLive ? "#FFFFFF" : C.input,
              color: C.textPrimary,
            }}
          />
        </div>

        {item.document?.kind === "inline_sections" && item.document.consentOptions?.length ? (
          <div className="mt-4 space-y-2">
            {item.document.consentOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-2 text-sm"
                style={{ color: C.textPrimary }}
              >
                <input
                  type="radio"
                  name={`consent-${item.id}`}
                  disabled={!isLive}
                  className="mt-0.5"
                  style={{ accentColor: C.accent }}
                />
                {option.label}
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-3 border-t pt-4" style={{ borderColor: C.border }}>
        {sectionIndex > 0 ? (
          <button
            type="button"
            onClick={() => setSectionIndex((idx) => idx - 1)}
            className="rounded-md border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: C.secondaryBtnBorder,
              color: C.textPrimary,
              backgroundColor: C.bg,
            }}
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={isLive && !signature.trim()}
          onClick={() => {
            if (!isLastSection) {
              setSectionIndex((idx) => idx + 1);
              setSignature("");
            }
          }}
          className="ml-auto rounded-md px-5 py-2.5 text-sm font-semibold text-white"
          style={panelButtonStyle(C, isLive && !signature.trim())}
        >
          {isLastSection ? "Complete agreement" : "Sign & continue"}
          {!isLive ? " (preview)" : ""}
        </button>
      </div>
    </div>
  );
}

function DocumentSignPdfPanel({
  C,
  item,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
}) {
  const fileName =
    item.document?.kind === "pdf" ? item.document.fileName : null;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center"
      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
    >
      <FileText className="mb-3 h-10 w-10" style={{ color: C.textQuaternary }} />
      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
        {fileName || "PDF agreement"}
      </p>
      <p className="mt-2 max-w-sm text-sm" style={{ color: C.textSecondary }}>
        PDF preview unavailable until the file is saved. Families will read and sign
        the uploaded document here.
      </p>
    </div>
  );
}

function FormItemPanel({
  C,
  item,
  mode,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
}) {
  const isLive = mode === "live";
  const fields = item.formSchema?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({});

  if (fields.length === 0) {
    return (
      <p className="text-sm" style={{ color: C.textSecondary }}>
        No questions added to this form yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {item.formSchema?.title ? (
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          {item.formSchema.title}
        </h2>
      ) : null}
      {fields.map((field) => (
        <div key={field.id}>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: C.textPrimary }}>
            {field.label}
            {field.required ? (
              <span style={{ color: C.error }}> *</span>
            ) : null}
          </label>
          <ApplicationFieldInput
            field={field}
            value={values[field.id] ?? ""}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, [field.id]: value }))
            }
            C={C}
          />
        </div>
      ))}
      <button
        type="button"
        disabled={isLive}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        style={panelButtonStyle(C, isLive)}
      >
        Submit form{!isLive ? " (preview)" : ""}
      </button>
    </div>
  );
}

function FileUploadPanel({
  C,
  item,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
}) {
  const config = item.fileUpload;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center"
        style={{ borderColor: C.borderStrong, backgroundColor: "#FFFFFF" }}
      >
        <Upload className="mb-3 h-8 w-8" style={{ color: C.textQuaternary }} />
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Drop files here or click to upload
        </p>
        <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
          {config?.helpText || "Upload required documents."}
        </p>
        {config?.accept ? (
          <p className="mt-2 text-[11px]" style={{ color: C.textTertiary }}>
            Accepted: {config.accept}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        style={panelButtonStyle(C, true)}
      >
        Upload files (preview)
      </button>
    </div>
  );
}

function PaymentPanel({
  C,
  item,
  mode,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
}) {
  const isLive = mode === "live";
  const payment = item.payment;
  const amount = formatFeeAmount(payment?.amountCents ?? 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {payment?.label || item.label}
      </h2>
      <div
        className="rounded-lg border px-4 py-4"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Amount due
        </p>
        <p className="mt-1 text-2xl font-semibold" style={{ color: C.textPrimary }}>
          {amount}
        </p>
      </div>
      <button
        type="button"
        disabled={!isLive}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        style={panelButtonStyle(C, !isLive)}
      >
        Pay {amount}
        {!isLive ? " (preview)" : ""}
      </button>
    </div>
  );
}

function AcknowledgmentPanel({
  C,
  item,
  mode,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
}) {
  const isLive = mode === "live";
  const config = item.acknowledgment;
  const [signature, setSignature] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>
      <p
        className="whitespace-pre-wrap text-sm leading-relaxed"
        style={{ color: C.textPrimary }}
      >
        {config?.body || "Acknowledgment text will appear here."}
      </p>
      {config?.options?.length ? (
        <div className="space-y-2">
          {config.options.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-2 text-sm"
              style={{ color: C.textPrimary }}
            >
              <input
                type="radio"
                name={`ack-${item.id}`}
                disabled={!isLive}
                className="mt-0.5"
                style={{ accentColor: C.accent }}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : null}
      <div>
        <label
          className="mb-1.5 block text-xs font-medium"
          style={{ color: C.textSecondary }}
        >
          Type your full legal name to sign
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          disabled={!isLive}
          placeholder="Full legal name"
          className="w-full rounded-md border px-3 py-2.5 text-sm outline-none"
          style={{
            borderColor: C.inputBorder,
            backgroundColor: isLive ? "#FFFFFF" : C.input,
            color: C.textPrimary,
          }}
        />
      </div>
      <button
        type="button"
        disabled={!isLive}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        style={panelButtonStyle(C, !isLive)}
      >
        Sign acknowledgment{!isLive ? " (preview)" : ""}
      </button>
    </div>
  );
}

export default function EnrollmentChecklistItemPanel({
  C,
  item,
  mode,
}: EnrollmentChecklistItemPanelProps) {
  const content = useMemo(() => {
    switch (item.type) {
      case "document_sign":
        if (!item.document) {
          return (
            <p className="text-sm" style={{ color: C.textSecondary }}>
              Agreement content not configured.
            </p>
          );
        }
        if (item.document.kind === "pdf") {
          return <DocumentSignPdfPanel C={C} item={item} />;
        }
        return <DocumentSignInlinePanel C={C} item={item} mode={mode} />;
      case "form":
        return <FormItemPanel C={C} item={item} mode={mode} />;
      case "file_upload":
        return <FileUploadPanel C={C} item={item} />;
      case "payment":
        return <PaymentPanel C={C} item={item} mode={mode} />;
      case "acknowledgment":
        return <AcknowledgmentPanel C={C} item={item} mode={mode} />;
      default:
        return null;
    }
  }, [C, item, mode]);

  return <div className="flex h-full min-h-0 flex-col">{content}</div>;
}
