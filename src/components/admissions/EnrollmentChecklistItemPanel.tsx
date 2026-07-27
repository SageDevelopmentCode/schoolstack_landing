"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Info, Loader2 } from "lucide-react";
import ApplicationFileUploadField from "@/components/admissions/ApplicationFileUploadField";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import ApplicationRadioInput from "@/components/admissions/ApplicationRadioInput";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import PaymentMethodSelectionModal from "@/components/admissions/PaymentMethodSelectionModal";
import PaymentFeeBreakdownList from "@/components/admissions/PaymentFeeBreakdownList";
import TypedSignatureField, {
  parseStoredSignerName,
} from "@/components/admissions/TypedSignatureField";
import RepeatableFormEntries from "@/components/admissions/RepeatableFormEntries";
import FormattedDocumentText from "@/components/admissions/FormattedDocumentText";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import type { ApplicationFileUploadMeta } from "@/lib/admissions/application-file-storage";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  createEmptyEntries,
  isMultiEntryResponses,
  normalizeFormResponses,
  type ChecklistFormEntry,
  type ChecklistFormResponses,
} from "@/lib/admissions/checklist-form-responses";
import {
  buildChecklistFormPayload,
  validateChecklistFormResponses,
} from "@/lib/admissions/enrollment-checklist-form-validation";
import {
  parseChecklistFileResponses,
  removeChecklistFile,
  uploadChecklistFile,
} from "@/lib/admissions/enrollment-checklist-file-storage";
import {
  buildEmbeddedPdfViewerUrl,
  getEnrollmentChecklistPdfSignedUrl,
} from "@/lib/admissions/enrollment-checklist-document-storage";
import {
  getAgreementResumeSectionIndex,
  mergeAgreementSectionSignature,
  parseAgreementConsentValue,
  parseAgreementSectionSignatures,
  signaturesBySectionId,
} from "@/lib/admissions/enrollment-agreement-progress";
import type { AgreementSectionSignature } from "@/lib/admissions/enrollment-checklist-schema";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { hasPaymentBreakdown, isPdfAgreementItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import { createClient } from "@/utils/supabase/client";

type EnrollmentChecklistItemPanelProps = {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  isPreviewAlternate?: boolean;
  mode: "preview" | "live";
  organizationId?: string;
  checklistId?: string;
  instanceId?: string;
  instanceStatus?: string;
  instancePaymentStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: (responses?: Record<string, unknown>) => Promise<void> | void;
  onPartialProgress?: (responses: Record<string, unknown>) => Promise<void> | void;
};

function initFormStateFromResponses(
  existingResponses: Record<string, unknown> | undefined,
  allowMultiple: boolean,
): { values: Record<string, string>; entries: ChecklistFormEntry[] } {
  const normalized = normalizeFormResponses(
    existingResponses as ChecklistFormResponses | null | undefined,
    allowMultiple,
  );

  if (allowMultiple && isMultiEntryResponses(normalized)) {
    return { values: {}, entries: normalized.entries };
  }

  return {
    values: (normalized as Record<string, string>) ?? {},
    entries: createEmptyEntries(),
  };
}

function panelButtonStyle(C: AdminThemeTokens, disabled: boolean) {
  return {
    ...getAdminButtonStyle(C, "primary"),
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

const PDF_VIEWER_HEIGHT_CLASS =
  "min-h-[200px] h-[min(400px,calc(100dvh-320px))] lg:min-h-[560px] lg:h-[min(720px,calc(100vh-240px))]";

const sectionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
  }),
};

const sectionTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };

const FORM_DRAFT_SAVE_DEBOUNCE_MS = 800;

function serializeChecklistFormPayload(
  formSchema: NonNullable<EnrollmentChecklistItem["formSchema"]>,
  values: Record<string, string>,
  entries: ChecklistFormEntry[],
): string {
  return JSON.stringify(buildChecklistFormPayload(formSchema, values, entries));
}

function AlternateAgreementExplainer({
  C,
  item,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
}) {
  return (
    <div
      className="shrink-0 rounded-lg border border-dashed p-4"
      style={{ borderColor: C.border }}
    >
      <p className="text-sm" style={{ color: C.textSecondary }}>
        If a student is admissible with a collaborative support plan, staff may select this
        agreement option instead:
      </p>
      <h2 className="mt-3 text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>
    </div>
  );
}

function DocumentSignInlinePanel({
  C,
  item,
  mode,
  instanceId,
  instanceStatus,
  existingResponses,
  onComplete,
  onPartialProgress,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  instanceId?: string;
  instanceStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: (responses?: Record<string, unknown>) => Promise<void> | void;
  onPartialProgress?: (responses: Record<string, unknown>) => Promise<void> | void;
}) {
  const sections = item.document?.kind === "inline_sections" ? item.document.sections : [];
  const consentOptions =
    item.document?.kind === "inline_sections" ? item.document.consentOptions ?? [] : [];
  const storedSignatures = useMemo(
    () => parseAgreementSectionSignatures(existingResponses),
    [existingResponses],
  );
  const [previewSignatures, setPreviewSignatures] = useState<AgreementSectionSignature[]>([]);
  const [previewCompleted, setPreviewCompleted] = useState(false);
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed" || (!isLive && previewCompleted);
  const activeSignatures = isLive ? storedSignatures : previewSignatures;
  const signatureBySectionId = useMemo(
    () => signaturesBySectionId(activeSignatures),
    [activeSignatures],
  );
  const [sectionIndex, setSectionIndex] = useState(() =>
    instanceStatus === "completed"
      ? Math.max(sections.length - 1, 0)
      : getAgreementResumeSectionIndex(sections, activeSignatures),
  );
  const [direction, setDirection] = useState(1);
  const section = sections[sectionIndex];
  const isLastSection = sectionIndex >= sections.length - 1;

  const expectedSignature = isCompleted
    ? parseStoredSignerName(existingResponses) ||
        (section ? signatureBySectionId.get(section.id)?.signerName ?? "" : "")
    : section
      ? signatureBySectionId.get(section.id)?.signerName ?? ""
      : "";
  const signatureSourceKey = isCompleted
    ? `completed:${section?.id ?? ""}`
    : `${section?.id ?? ""}:${expectedSignature}`;
  const [signature, setSignature] = useState(expectedSignature);

  const expectedConsent = isCompleted
    ? parseAgreementConsentValue(existingResponses) ?? ""
    : parseAgreementConsentValue(existingResponses) ?? "";
  const consentSourceKey = isCompleted
    ? `completed-consent:${expectedConsent}`
    : `consent:${expectedConsent}`;
  const [selectedConsent, setSelectedConsent] = useState(expectedConsent);
  const [previewConsent, setPreviewConsent] = useState("");

  useEffect(() => {
    queueMicrotask(() => setSignature(expectedSignature));
  }, [signatureSourceKey, expectedSignature]);

  useEffect(() => {
    queueMicrotask(() => setSelectedConsent(expectedConsent));
  }, [consentSourceKey, expectedConsent]);

  const [submitting, setSubmitting] = useState(false);
  const activeConsent = isLive ? selectedConsent : previewConsent;
  const needsSignature = !isCompleted;
  const needsConsent =
    consentOptions.length > 0 && isLastSection && !isCompleted;
  const canContinue =
    isCompleted ||
    ((!needsSignature || Boolean(signature.trim())) &&
      (!needsConsent || Boolean(activeConsent.trim())));

  const saveCurrentSectionPreview = () => {
    if (!section) return;

    const signerName = signature.trim();
    if (!signerName) return;
    const nextSignatures = mergeAgreementSectionSignature(
      previewSignatures,
      section.id,
      signerName,
    );
    setPreviewSignatures(nextSignatures);

    if (isLastSection && consentOptions.length > 0) {
      setPreviewConsent(activeConsent.trim());
    }

    if (isLastSection) {
      setPreviewCompleted(true);
      return;
    }

    setDirection(1);
    setSectionIndex((idx) => idx + 1);
    setSignature("");
  };

  const saveCurrentSection = async () => {
    if (!isLive || !instanceId || !section) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementSection: {
            sectionId: section.id,
            signerName: signature.trim(),
            ...(isLastSection && activeConsent.trim()
              ? { consentValue: activeConsent.trim() }
              : {}),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save agreement section.");
      }

      const data = (await response.json()) as {
        status?: string;
        responses?: Record<string, unknown>;
      };
      const nextResponses = data.responses ?? existingResponses ?? {};

      if (data.status === "completed") {
        await onComplete?.(nextResponses);
        return;
      }

      await onPartialProgress?.(nextResponses);

      if (!isLastSection) {
        setDirection(1);
        setSectionIndex((idx) => idx + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={sectionIndex}
            custom={direction}
            variants={sectionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={sectionTransition}
          >
            <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
              Section {sectionIndex + 1} of {sections.length}
            </p>
            <h2 className="mt-2 text-lg font-semibold" style={{ color: C.textPrimary }}>
              {section.title}
            </h2>
            <FormattedDocumentText
              C={C}
              content={section.body}
              className="mt-4"
            />

            {consentOptions.length > 0 && isLastSection ? (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  Select one permission option
                </p>
                <ApplicationRadioInput
                  name={`consent-${item.id}`}
                  value={activeConsent}
                  onChange={(value) => {
                    if (isLive) {
                      setSelectedConsent(value);
                    } else {
                      setPreviewConsent(value);
                    }
                  }}
                  options={consentOptions}
                  disabled={isCompleted}
                  ariaLabel="Select one permission option"
                  layout="stacked"
                  C={C}
                />
              </div>
            ) : null}

            <div className="mt-6">
              <TypedSignatureField
                C={C}
                id={`signature-inline-${item.id}`}
                value={signature}
                onChange={setSignature}
                disabled={isCompleted}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-3 border-t pb-safe pt-4" style={{ borderColor: C.border }}>
        {sectionIndex > 0 ? (
          <button
            type="button"
            onClick={() => {
              setDirection(-1);
              setSectionIndex((idx) => idx - 1);
            }}
            className="rounded-md border px-4 py-2 text-sm font-medium"
            style={getAdminButtonStyle(C, "secondary")}
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={async () => {
            if (!isLive) {
              if (!isCompleted) {
                saveCurrentSectionPreview();
              }
              return;
            }
            if (!isLastSection) {
              await saveCurrentSection();
              return;
            }
            if (instanceId && onComplete) {
              await saveCurrentSection();
            }
          }}
          className={`ml-auto rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
          style={panelButtonStyle(C, !canContinue || submitting)}
        >
          {isCompleted ? (
            "Completed"
          ) : isLastSection ? (
            <ButtonLoadingLabel loading={submitting} loadingLabel="Saving…">
              Complete agreement
            </ButtonLoadingLabel>
          ) : (
            "Sign & continue"
          )}
        </button>
      </div>
    </div>
  );
}

function DocumentSignPdfPanel({
  C,
  item,
  mode,
  instanceId,
  instanceStatus,
  existingResponses,
  onComplete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  instanceId?: string;
  instanceStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: () => Promise<void> | void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const pdfDocument = item.document?.kind === "pdf" ? item.document : null;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signature, setSignature] = useState(() =>
    instanceStatus === "completed" ? parseStoredSignerName(existingResponses) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed";
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
          setLoadError(
            err instanceof Error ? err.message : "Failed to load PDF preview.",
          );
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
        <p className="mt-2 max-w-sm text-sm" style={{ color: C.textSecondary }}>
          Upload a PDF in the checklist builder to preview it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>

      <div
        className={`${PDF_VIEWER_HEIGHT_CLASS} overflow-hidden rounded-lg border`}
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        {loading ? (
          <div className={`flex ${PDF_VIEWER_HEIGHT_CLASS} items-center justify-center`}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
          </div>
        ) : loadError ? (
          <div
            className={`flex ${PDF_VIEWER_HEIGHT_CLASS} flex-col items-center justify-center px-6 text-center`}
          >
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
            className={`${PDF_VIEWER_HEIGHT_CLASS} w-full`}
          />
        ) : null}
      </div>

      {requireSignature ? (
        <div className="space-y-3">
          <TypedSignatureField
            C={C}
            id={`signature-pdf-${item.id}`}
            value={signature}
            onChange={setSignature}
            disabled={!isLive || isCompleted}
          />
          <button
            type="button"
            disabled={!isLive || !signature.trim() || submitting || isCompleted}
            onClick={async () => {
              if (!isLive || !instanceId || !onComplete) return;
              setSubmitting(true);
              try {
                await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ signerName: signature.trim() }),
                });
                await onComplete();
              } finally {
                setSubmitting(false);
              }
            }}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
            style={panelButtonStyle(C, !isLive || !signature.trim() || submitting || isCompleted)}
          >
            {isCompleted ? (
              "Completed"
            ) : (
              <ButtonLoadingLabel loading={submitting} loadingLabel="Saving…">
                Complete agreement
              </ButtonLoadingLabel>
            )}
            {!isLive ? " (preview)" : ""}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FormItemPanel({
  C,
  item,
  mode,
  instanceId,
  instanceStatus,
  existingResponses,
  onComplete,
  onPartialProgress,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  instanceId?: string;
  instanceStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: (responses?: Record<string, unknown>) => Promise<void> | void;
  onPartialProgress?: (responses: Record<string, unknown>) => Promise<void> | void;
}) {
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed";
  const formSchema = item.formSchema;
  const fields = formSchema?.fields ?? [];
  const allowMultiple = formSchema?.allowMultiple ?? false;
  const stepHeading =
    item.label.trim() || formSchema?.title?.trim() || "Entry";
  const [values, setValues] = useState<Record<string, string>>(() =>
    initFormStateFromResponses(existingResponses, allowMultiple).values,
  );
  const [entries, setEntries] = useState<ChecklistFormEntry[]>(() =>
    initFormStateFromResponses(existingResponses, allowMultiple).entries,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldsDisabled = isCompleted && !isEditing;
  const valuesRef = useRef(values);
  const entriesRef = useRef(entries);
  const isCompletedRef = useRef(isCompleted);
  const lastSavedPayloadRef = useRef(
    formSchema
      ? serializeChecklistFormPayload(
          formSchema,
          initFormStateFromResponses(existingResponses, allowMultiple).values,
          initFormStateFromResponses(existingResponses, allowMultiple).entries,
        )
      : "",
  );
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    valuesRef.current = values;
    entriesRef.current = entries;
    isCompletedRef.current = isCompleted;
  }, [values, entries, isCompleted]);

  const persistDraft = async (
    payload: ChecklistFormResponses,
    options?: { keepalive?: boolean; syncParent?: boolean },
  ) => {
    if (!isLive || !instanceId || isCompletedRef.current) return;

    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayloadRef.current) return;

    const response = await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: true, responses: payload }),
      keepalive: options?.keepalive,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "Failed to save draft.");
    }

    const data = (await response.json()) as {
      responses?: Record<string, unknown>;
    };
    const nextResponses = data.responses ?? (payload as Record<string, unknown>);
    lastSavedPayloadRef.current = serialized;
    if (options?.syncParent !== false) {
      await onPartialProgress?.(nextResponses);
    }
  };

  useEffect(() => {
    if (!isLive || isCompleted || !formSchema) return;

    const payload = buildChecklistFormPayload(formSchema, values, entries);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayloadRef.current) return;

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(() => {
      void persistDraft(payload).catch(() => {
        // Draft saves are best-effort; submit still validates and surfaces errors.
      });
    }, FORM_DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [entries, formSchema, isCompleted, isLive, values]);

  useEffect(() => {
    return () => {
      if (!isLive || !formSchema || !instanceId || isCompletedRef.current) return;

      const payload = buildChecklistFormPayload(
        formSchema,
        valuesRef.current,
        entriesRef.current,
      );
      const serialized = JSON.stringify(payload);
      if (serialized === lastSavedPayloadRef.current) return;

      void persistDraft(payload, { keepalive: true, syncParent: false }).catch(
        () => undefined,
      );
    };
  }, [formSchema, instanceId, isLive]);

  if (!formSchema || fields.length === 0) {
    return (
      <p className="text-sm" style={{ color: C.textSecondary }}>
        No questions added to this form yet.
      </p>
    );
  }

  function resetFormState() {
    const state = initFormStateFromResponses(existingResponses, allowMultiple);
    setValues(state.values);
    setEntries(state.entries);
  }

  function startEditing() {
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    resetFormState();
    setError(null);
    setIsEditing(false);
  }

  async function handleSubmit() {
    if (!isLive || !instanceId || !onComplete || !formSchema) return;

    const payload = buildChecklistFormPayload(formSchema, values, entries);
    const validationError = validateChecklistFormResponses(formSchema, payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to submit form.");
      }
      await onComplete(payload);
      lastSavedPayloadRef.current = JSON.stringify(payload);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  }

  const topNotice =
    formSchema.stepNotice?.body.trim() &&
    formSchema.stepNotice.placement === "top"
      ? formSchema.stepNotice.body.trim()
      : null;
  const bottomNotice =
    formSchema.stepNotice?.body.trim() &&
    formSchema.stepNotice.placement === "bottom"
      ? formSchema.stepNotice.body.trim()
      : null;

  return (
    <div className="space-y-5">
      {formSchema.title ? (
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          {formSchema.title}
        </h2>
      ) : null}

      {formSchema.description ? (
        <p className="text-sm" style={{ color: C.textSecondary }}>
          {formSchema.description}
        </p>
      ) : null}

      {topNotice ? <ApplicationStepNotice body={topNotice} C={C} /> : null}

      {allowMultiple ? (
        <RepeatableFormEntries
          C={C}
          fields={fields}
          entries={entries}
          stepHeading={stepHeading}
          required={item.required}
          disabled={fieldsDisabled}
          onChange={setEntries}
        />
      ) : (
        fields.map((field) => (
          <div key={field.id}>
            {field.type !== "checkbox" ? (
              <label className="mb-1.5 block text-sm font-medium" style={{ color: C.textPrimary }}>
                {field.label}
                {field.required ? (
                  <span style={{ color: C.error }}> *</span>
                ) : null}
              </label>
            ) : null}
            <ApplicationFieldInput
              field={field}
              value={values[field.id] ?? ""}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [field.id]: value }))
              }
              disabled={fieldsDisabled}
              C={C}
            />
          </div>
        ))
      )}

      {bottomNotice ? <ApplicationStepNotice body={bottomNotice} C={C} /> : null}

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}

      {isCompleted ? (
        <div className="flex flex-wrap items-center gap-3">
          {!isEditing ? (
            <>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                Submitted
              </p>
              <button
                type="button"
                disabled={!isLive}
                onClick={startEditing}
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
                style={panelButtonStyle(C, !isLive)}
              >
                Edit
                {!isLive ? " (preview)" : ""}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!isLive || submitting}
                onClick={() => void handleSubmit()}
                className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
                style={panelButtonStyle(C, !isLive || submitting)}
              >
                <ButtonLoadingLabel loading={submitting} loadingLabel="Saving…">
                  Save changes
                </ButtonLoadingLabel>
                {!isLive ? " (preview)" : ""}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={cancelEditing}
                className="rounded-md px-5 py-2.5 text-sm font-semibold"
                style={{
                  ...getAdminButtonStyle(C, "neutral"),
                  opacity: submitting ? 0.5 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={!isLive || submitting}
          onClick={() => void handleSubmit()}
          className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
          style={panelButtonStyle(C, !isLive || submitting)}
        >
          <ButtonLoadingLabel loading={submitting} loadingLabel="Saving…">
            Submit form
          </ButtonLoadingLabel>
          {!isLive ? " (preview)" : ""}
        </button>
      )}
    </div>
  );
}

function FileUploadPanel({
  C,
  item,
  mode,
  organizationId,
  checklistId,
  instanceId,
  instanceStatus,
  existingResponses,
  onComplete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  organizationId?: string;
  checklistId?: string;
  instanceId?: string;
  instanceStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: () => Promise<void> | void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const config = item.fileUpload;
  const maxFiles = config?.maxFiles ?? 3;
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed";
  const [files, setFiles] = useState(() => parseChecklistFileResponses(existingResponses));
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputDisabled = !isLive || uploading || isCompleted;

  async function handleFileSelect(selected: FileList | null) {
    if (!selected?.length || !isLive || !organizationId || !instanceId || !checklistId) {
      return;
    }

    const selectedFiles = Array.from(selected);
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"} for this step.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded = [...files];
      for (const file of selectedFiles) {
        const meta = await uploadChecklistFile(
          supabase,
          {
            organizationId,
            checklistId,
            instanceId,
          },
          file,
          {
            accept: config?.accept,
          },
        );
        uploaded.push(meta);
      }
      setFiles(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveFile(file: ApplicationFileUploadMeta) {
    if (!isLive || isCompleted) return;

    await removeChecklistFile(supabase, file);
    setFiles((current) => current.filter((entry) => entry.id !== file.id));
    setError(null);
  }

  async function handleComplete() {
    if (!isLive || !instanceId || !onComplete) return;
    if (item.required && files.length === 0) {
      setError("Upload at least one file to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: { files } }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to save upload.");
      }
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save upload.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>

      {config?.directions ? (
        <div
          className="flex gap-3 rounded-md border px-4 py-3"
          style={{
            borderColor: C.border,
            backgroundColor: C.accentLight,
          }}
        >
          <Info
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: C.accent }}
            aria-hidden
          />
          <div className="min-w-0 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            <p>{config.directions.intro}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {config.directions.options.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <ApplicationFileUploadField
        id={`checklist-file-upload-${item.id}`}
        files={files}
        maxFiles={maxFiles}
        accept={config?.accept}
        helpText={config?.helpText || "Upload required documents."}
        disabled={fileInputDisabled}
        uploading={uploading}
        error={error}
        previewSuffix={!isLive ? " (preview)" : ""}
        C={C}
        supabase={supabase}
        removable={isLive && !isCompleted}
        onSelectFiles={handleFileSelect}
        onRemoveFile={handleRemoveFile}
      />

      <button
        type="button"
        disabled={!isLive || uploading || submitting || isCompleted}
        onClick={() => void handleComplete()}
        className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
        style={panelButtonStyle(C, !isLive || uploading || submitting || isCompleted)}
      >
        {isCompleted ? (
          "Completed"
        ) : (
          <ButtonLoadingLabel
            loading={submitting || uploading}
            loadingLabel={submitting ? "Saving…" : "Uploading…"}
          >
            Save upload
          </ButtonLoadingLabel>
        )}
        {!isLive ? " (preview)" : ""}
      </button>
    </div>
  );
}

function PaymentPanel({
  C,
  item,
  mode,
  instanceId,
  instanceStatus,
  instancePaymentStatus,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  instanceId?: string;
  instanceStatus?: string;
  instancePaymentStatus?: string;
}) {
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed" || instancePaymentStatus === "paid";
  const payment = item.payment;
  const amount = formatFeeAmount(payment?.amountCents ?? 0);
  const showBreakdown = hasPaymentBreakdown(payment);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmPayment(method: CheckoutPaymentMethod) {
    if (!isLive || !instanceId || isCompleted) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admissions/enrollment-checklist-items/${instanceId}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod: method }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to start checkout.");
      }
      if (body.url) {
        window.location.href = body.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {payment?.label || item.label}
      </h2>
      <div
        className="rounded-lg border px-4 py-4"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        {showBreakdown ? (
          <PaymentFeeBreakdownList
            C={C}
            lineItems={payment.lineItems}
            totalCents={payment.amountCents}
          />
        ) : (
          <>
            <p className="text-sm" style={{ color: C.textSecondary }}>
              Amount due
            </p>
            <p className="mt-1 text-2xl font-semibold" style={{ color: C.textPrimary }}>
              {amount}
            </p>
          </>
        )}
      </div>
      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!isLive || submitting || isCompleted}
        onClick={() => setPaymentModalOpen(true)}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        style={panelButtonStyle(C, !isLive || submitting || isCompleted)}
      >
        {isCompleted ? "Paid" : submitting ? "Redirecting…" : `Pay ${amount}`}
        {!isLive ? " (preview)" : ""}
      </button>

      <PaymentMethodSelectionModal
        C={C}
        open={paymentModalOpen}
        onClose={() => {
          if (!submitting) setPaymentModalOpen(false);
        }}
        netAmountCents={payment?.amountCents ?? 0}
        label={payment?.label || item.label}
        lineItems={payment?.lineItems}
        loading={submitting}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}

function AcknowledgmentPanel({
  C,
  item,
  mode,
  instanceId,
  instanceStatus,
  existingResponses,
  onComplete,
}: {
  C: AdminThemeTokens;
  item: EnrollmentChecklistItem;
  mode: "preview" | "live";
  instanceId?: string;
  instanceStatus?: string;
  existingResponses?: Record<string, unknown>;
  onComplete?: () => Promise<void> | void;
}) {
  const isLive = mode === "live";
  const isCompleted = instanceStatus === "completed";
  const config = item.acknowledgment;
  const [signature, setSignature] = useState(() =>
    instanceStatus === "completed" ? parseStoredSignerName(existingResponses) : "",
  );
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {item.label}
      </h2>
      <FormattedDocumentText
        C={C}
        content={config?.body || "Acknowledgment text will appear here."}
      />
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
      <TypedSignatureField
        C={C}
        id={`signature-ack-${item.id}`}
        value={signature}
        onChange={setSignature}
        disabled={!isLive || isCompleted}
      />
      <button
        type="button"
        disabled={!isLive || !signature.trim() || submitting || isCompleted}
        onClick={async () => {
          if (!isLive || !instanceId || !onComplete) return;
          setSubmitting(true);
          try {
            await fetch(`/api/admissions/enrollment-checklist-items/${instanceId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ signerName: signature.trim() }),
            });
            await onComplete();
          } finally {
            setSubmitting(false);
          }
        }}
        className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
        style={panelButtonStyle(C, !isLive || !signature.trim() || submitting || isCompleted)}
      >
        {isCompleted ? (
          "Completed"
        ) : (
          <ButtonLoadingLabel loading={submitting} loadingLabel="Saving…">
            Sign acknowledgment
          </ButtonLoadingLabel>
        )}
        {!isLive ? " (preview)" : ""}
      </button>
    </div>
  );
}

export default function EnrollmentChecklistItemPanel({
  C,
  item,
  isPreviewAlternate = false,
  mode,
  organizationId,
  checklistId,
  instanceId,
  instanceStatus,
  instancePaymentStatus,
  existingResponses,
  onComplete,
  onPartialProgress,
}: EnrollmentChecklistItemPanelProps) {
  const content = useMemo(() => {
    if (isPreviewAlternate) {
      if (!item.document || item.document.kind !== "inline_sections") {
        return (
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Agreement content not configured.
          </p>
        );
      }

      return (
        <div className="flex h-full min-h-0 flex-col gap-4">
          <AlternateAgreementExplainer C={C} item={item} />
          <div className="min-h-0 flex-1">
            <DocumentSignInlinePanel
              C={C}
              item={item}
              mode={mode}
              instanceId={instanceId}
              instanceStatus={instanceStatus}
              existingResponses={existingResponses}
              onComplete={onComplete}
              onPartialProgress={onPartialProgress}
            />
          </div>
        </div>
      );
    }

    if (isPdfAgreementItem(item)) {
      if (!item.document || item.document.kind !== "pdf") {
        return (
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Agreement PDF not configured.
          </p>
        );
      }
      return (
        <DocumentSignPdfPanel
          C={C}
          item={item}
          mode={mode}
          instanceId={instanceId}
          instanceStatus={instanceStatus}
          existingResponses={existingResponses}
          onComplete={onComplete}
        />
      );
    }

    switch (item.type) {
      case "document_sign":
        if (!item.document || item.document.kind !== "inline_sections") {
          return (
            <p className="text-sm" style={{ color: C.textSecondary }}>
              Agreement content not configured.
            </p>
          );
        }
        return (
          <DocumentSignInlinePanel
            C={C}
            item={item}
            mode={mode}
            instanceId={instanceId}
            instanceStatus={instanceStatus}
            existingResponses={existingResponses}
            onComplete={onComplete}
            onPartialProgress={onPartialProgress}
          />
        );
      case "form":
        return (
          <FormItemPanel
            C={C}
            item={item}
            mode={mode}
            instanceId={instanceId}
            instanceStatus={instanceStatus}
            existingResponses={existingResponses}
            onComplete={onComplete}
            onPartialProgress={onPartialProgress}
          />
        );
      case "file_upload":
        return (
          <FileUploadPanel
            C={C}
            item={item}
            mode={mode}
            organizationId={organizationId}
            checklistId={checklistId}
            instanceId={instanceId}
            instanceStatus={instanceStatus}
            existingResponses={existingResponses}
            onComplete={onComplete}
          />
        );
      case "payment":
        return (
          <PaymentPanel
            C={C}
            item={item}
            mode={mode}
            instanceId={instanceId}
            instanceStatus={instanceStatus}
            instancePaymentStatus={instancePaymentStatus}
          />
        );
      case "acknowledgment":
        return (
          <AcknowledgmentPanel
            C={C}
            item={item}
            mode={mode}
            instanceId={instanceId}
            instanceStatus={instanceStatus}
            existingResponses={existingResponses}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  }, [
    C,
    checklistId,
    existingResponses,
    instanceId,
    instancePaymentStatus,
    instanceStatus,
    isPreviewAlternate,
    item,
    mode,
    onComplete,
    onPartialProgress,
    organizationId,
  ]);

  return <div className="flex h-full min-h-0 flex-col">{content}</div>;
}
