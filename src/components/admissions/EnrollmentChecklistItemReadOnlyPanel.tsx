"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import ApplicationUploadedFileList from "@/components/admissions/ApplicationUploadedFileList";
import {
  parseApplicationFileFieldValue,
} from "@/lib/admissions/application-file-storage";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import {
  isMultiEntryResponses,
  normalizeFormResponses,
} from "@/lib/admissions/checklist-form-responses";
import { parseChecklistFileResponses } from "@/lib/admissions/enrollment-checklist-file-storage";
import {
  buildEmbeddedPdfViewerUrl,
  getEnrollmentChecklistPdfSignedUrl,
} from "@/lib/admissions/enrollment-checklist-document-storage";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import { parseStoredSignerName } from "@/components/admissions/TypedSignatureField";
import { greatVibes } from "@/lib/fonts";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type EnrollmentChecklistItemReadOnlyPanelProps = {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  instance?: EnrollmentChecklistItemInstance;
};

function formatFieldValue(field: ApplicationField, value: string | undefined): string {
  if (!value) return "—";

  if (field.type === "checkbox") {
    return value === "true" || value === "on" || value === "1" ? "Yes" : "No";
  }

  if (field.type === "select" || field.type === "radio") {
    const option = field.options?.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  return value;
}

function ReadOnlyField({
  field,
  value,
  C,
}: {
  field: ApplicationField;
  value: string | undefined;
  C: AdminThemeTokens;
}) {
  const fileValue = field.type === "file" ? parseApplicationFileFieldValue(value ?? "") : [];

  return (
    <div className="flex flex-col gap-1">
      <dt
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: C.textQuaternary }}
      >
        {field.label}
      </dt>
      <dd
        className={`text-sm leading-relaxed ${field.type === "file" ? "" : "whitespace-pre-wrap"}`}
        style={{ color: C.textPrimary }}
      >
        {field.type === "file" ? (
          fileValue.length > 0 ? (
            <ApplicationUploadedFileList files={fileValue} C={C} />
          ) : (
            "—"
          )
        ) : (
          formatFieldValue(field, value)
        )}
      </dd>
    </div>
  );
}

function EmptySubmissionNote({ C, message }: { C: AdminThemeTokens; message: string }) {
  return (
    <p className="text-sm" style={{ color: C.textTertiary }}>
      {message}
    </p>
  );
}

function ReadOnlySignature({
  C,
  signerName,
}: {
  C: AdminThemeTokens;
  signerName: string;
}) {
  return (
    <div>
      <p
        className="mb-1.5 text-xs font-medium uppercase tracking-wide"
        style={{ color: C.textQuaternary }}
      >
        Signature
      </p>
      <div
        className="flex min-h-[72px] flex-col justify-center rounded-md border px-4 py-4"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <p
          className={`${greatVibes.className} break-words text-2xl leading-tight sm:text-3xl`}
          style={{
            color: signerName ? C.accentDark : C.textTertiary,
            letterSpacing: "0.02em",
          }}
        >
          {signerName || "—"}
        </p>
      </div>
    </div>
  );
}

function DocumentSignInlineReadOnly({
  C,
  item,
  responses,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  responses: Record<string, unknown>;
}) {
  const sections = item.document?.kind === "inline_sections" ? item.document.sections : [];
  const signerName = parseStoredSignerName(responses);

  if (sections.length === 0) {
    return <EmptySubmissionNote C={C} message="No agreement sections configured." />;
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id}>
          <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            {section.title}
          </h3>
          <p
            className="mt-3 whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: C.textPrimary }}
          >
            {section.body}
          </p>
        </section>
      ))}
      {signerName ? (
        <ReadOnlySignature C={C} signerName={signerName} />
      ) : (
        <EmptySubmissionNote C={C} message="No signature submitted yet." />
      )}
    </div>
  );
}

function DocumentSignPdfReadOnly({
  C,
  item,
  responses,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  responses: Record<string, unknown>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const pdfDocument = item.document?.kind === "pdf" ? item.document : null;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const signerName = parseStoredSignerName(responses);
  const requireSignature = pdfDocument?.requireSignature !== false;

  useEffect(() => {
    if (!pdfDocument?.storagePath) {
      queueMicrotask(() => {
        setSignedUrl(null);
        setLoadError(null);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setLoadError(null);
    });

    void getEnrollmentChecklistPdfSignedUrl(supabase, pdfDocument.storagePath)
      .then((url) => {
        if (!cancelled) {
          setSignedUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load PDF.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pdfDocument?.storagePath, supabase]);

  if (!pdfDocument?.storagePath) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <FileText className="mb-3 h-10 w-10" style={{ color: C.textQuaternary }} />
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {pdfDocument?.fileName || "PDF agreement"}
        </p>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          No PDF uploaded for this agreement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="min-h-[400px] overflow-hidden rounded-lg border"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
          </div>
        ) : loadError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {pdfDocument.fileName}
            </p>
            <p className="mt-2 text-sm" style={{ color: C.error }}>
              {loadError}
            </p>
          </div>
        ) : signedUrl ? (
          <iframe
            title={pdfDocument.fileName || "PDF agreement"}
            src={buildEmbeddedPdfViewerUrl(signedUrl)}
            className="min-h-[400px] h-[min(560px,calc(90vh-240px))] w-full"
          />
        ) : null}
      </div>
      {requireSignature ? (
        signerName ? (
          <ReadOnlySignature C={C} signerName={signerName} />
        ) : (
          <EmptySubmissionNote C={C} message="No signature submitted yet." />
        )
      ) : null}
    </div>
  );
}

function FormReadOnly({
  C,
  item,
  responses,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  responses: Record<string, unknown>;
}) {
  const formSchema = item.formSchema;
  const fields = formSchema?.fields ?? [];

  if (!formSchema || fields.length === 0) {
    return <EmptySubmissionNote C={C} message="No questions configured for this form." />;
  }

  const allowMultiple = formSchema.allowMultiple ?? false;
  const normalized = normalizeFormResponses(
    responses as Parameters<typeof normalizeFormResponses>[0],
    allowMultiple,
  );

  const hasContent = allowMultiple
    ? isMultiEntryResponses(normalized) &&
      normalized.entries.some((entry) =>
        Object.values(entry.values).some((value) => value.trim().length > 0),
      )
    : Object.values(normalized as Record<string, string>).some(
        (value) => value.trim().length > 0,
      );

  if (!hasContent) {
    return <EmptySubmissionNote C={C} message="Nothing submitted yet." />;
  }

  if (allowMultiple && isMultiEntryResponses(normalized)) {
    return (
      <div className="space-y-6">
        {formSchema.title ? (
          <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            {formSchema.title}
          </h3>
        ) : null}
        {normalized.entries.map((entry, index) => (
          <section
            key={entry.id}
            className="space-y-4 rounded-lg border border-gray-100 p-4"
          >
            <h4 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Entry {index + 1}
            </h4>
            <dl className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <ReadOnlyField
                  key={field.id}
                  field={field}
                  value={entry.values[field.id]}
                  C={C}
                />
              ))}
            </dl>
          </section>
        ))}
      </div>
    );
  }

  const values = isMultiEntryResponses(normalized)
    ? (normalized.entries[0]?.values ?? {})
    : (normalized as Record<string, string>);

  return (
    <div className="space-y-4">
      {formSchema.title ? (
        <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
          {formSchema.title}
        </h3>
      ) : null}
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <ReadOnlyField key={field.id} field={field} value={values[field.id]} C={C} />
        ))}
      </dl>
    </div>
  );
}

function FileUploadReadOnly({
  C,
  responses,
}: {
  C: AdminThemeTokens;
  responses: Record<string, unknown>;
}) {
  const files = parseChecklistFileResponses(responses);

  if (files.length === 0) {
    return <EmptySubmissionNote C={C} message="No files uploaded yet." />;
  }

  return <ApplicationUploadedFileList files={files} C={C} />;
}

function PaymentReadOnly({
  C,
  item,
  instance,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  instance?: EnrollmentChecklistItemInstance;
}) {
  const payment = item.payment;
  const amount = formatFeeAmount(payment?.amountCents ?? 0);
  const isPaid =
    instance?.status === "completed" || instance?.paymentStatus === "paid";
  const isPending = instance?.paymentStatus === "pending";

  let statusLabel = "Not paid";
  if (isPaid) {
    statusLabel = "Paid";
  } else if (isPending) {
    statusLabel = "Payment pending";
  } else if (instance?.paymentStatus === "waived") {
    statusLabel = "Waived";
  }

  return (
    <div className="space-y-4">
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
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: isPaid ? C.success : C.textSecondary }}
        >
          {statusLabel}
        </p>
      </div>
    </div>
  );
}

function AcknowledgmentReadOnly({
  C,
  item,
  responses,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  responses: Record<string, unknown>;
}) {
  const config = item.acknowledgment;
  const signerName = parseStoredSignerName(responses);

  return (
    <div className="space-y-4">
      <p
        className="whitespace-pre-wrap text-sm leading-relaxed"
        style={{ color: C.textPrimary }}
      >
        {config?.body || "Acknowledgment text will appear here."}
      </p>
      {signerName ? (
        <ReadOnlySignature C={C} signerName={signerName} />
      ) : (
        <EmptySubmissionNote C={C} message="No signature submitted yet." />
      )}
    </div>
  );
}

export default function EnrollmentChecklistItemReadOnlyPanel({
  C,
  item,
  instance,
}: EnrollmentChecklistItemReadOnlyPanelProps) {
  const responses = instance?.responses ?? {};

  return (
    <div className="space-y-4">
      {item.type === "document_sign" && item.document?.kind === "inline_sections" ? (
        <DocumentSignInlineReadOnly C={C} item={item} responses={responses} />
      ) : null}

      {item.type === "document_sign_pdf" ||
      (item.type === "document_sign" && item.document?.kind === "pdf") ? (
        <DocumentSignPdfReadOnly C={C} item={item} responses={responses} />
      ) : null}

      {item.type === "form" ? (
        <FormReadOnly C={C} item={item} responses={responses} />
      ) : null}

      {item.type === "file_upload" ? (
        <FileUploadReadOnly C={C} responses={responses} />
      ) : null}

      {item.type === "payment" ? (
        <PaymentReadOnly C={C} item={item} instance={instance} />
      ) : null}

      {item.type === "acknowledgment" ? (
        <AcknowledgmentReadOnly C={C} item={item} responses={responses} />
      ) : null}
    </div>
  );
}
