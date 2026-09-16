"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { parseStoredSignerName } from "@/components/admissions/TypedSignatureField";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentFormBuilderFields from "./ParentFormBuilderFields";
import ParentFormDetailSkeleton from "./ParentFormDetailSkeleton";
import ParentFormDocumentPreview from "./ParentFormDocumentPreview";
import ParentFormSignatureField from "./ParentFormSignatureField";
import type { ParentFormDetail, ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import {
  areBuilderFieldValuesComplete,
  PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS,
} from "@/lib/school-parent/forms-documents/utils";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const TITLE_ID = "parent-form-detail-modal-title";

type ParentFormDetailModalProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  formId: string | null;
  initialItem: ParentFormListItem | null;
  readOnly?: boolean;
  onClose: () => void;
  onSubmitted: (detail: ParentFormDetail) => void;
};

function SignSection({
  theme,
  title,
  sectionRef,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={sectionRef}
      id="parent-form-sign-section"
      className="mt-5 shrink-0 border-t pt-5"
      style={{ borderColor: theme.line }}
    >
      <h3
        className="mb-3 text-sm font-semibold"
        style={{ color: theme.ink }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ParentFormDetailModal({
  theme,
  open,
  organizationId,
  formId,
  initialItem,
  readOnly = false,
  onClose,
  onSubmitted,
}: ParentFormDetailModalProps) {
  const [detail, setDetail] = useState<ParentFormDetail | null>(
    initialItem
      ? { form: initialItem.form, response: initialItem.response }
      : null,
  );
  const [fieldValues, setFieldValues] = useState<
    Record<string, string | boolean | string[]>
  >({});
  const [signerName, setSignerName] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSignSectionInView, setIsSignSectionInView] = useState(false);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const signSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !formId) return;

    const activeFormId = formId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoadingDetail(true);
      setDetailError(null);
      setDetail(
        initialItem?.form.id === activeFormId
          ? { form: initialItem.form, response: initialItem.response }
          : null,
      );
      setSignerName(
        initialItem?.form.id === activeFormId
          ? parseStoredSignerName(initialItem.response.responses)
          : "",
      );
      setFieldValues({});

      let fetchResponse: Response | undefined;
      try {
        const query = new URLSearchParams({ organizationId }).toString();
        fetchResponse = await fetch(
          `/api/parent-portal/forms-documents/${encodeURIComponent(activeFormId)}?${query}`,
        );
        const payload = (await fetchResponse.json()) as ParentFormDetail & {
          error?: string;
        };

        if (!fetchResponse.ok) {
          throw new Error(payload.error ?? "Failed to load form.");
        }

        if (cancelled) return;

        setDetail(payload);
        setSignerName(parseStoredSignerName(payload.response.responses));
      } catch (error) {
        if (cancelled) return;
        setDetailError(
          error instanceof Error ? error.message : "Failed to load form.",
        );
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "forms_documents.load_detail",
            error: "",
          },
          error,
          fetchResponse?.status,
        );
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [formId, initialItem, open, organizationId]);

  const isSigned = detail?.response.status === "signed";
  const formReadOnly = readOnly || isSigned;

  const builderFields = detail?.form.fields ?? [];
  const { bodyBuilderFields, bodySignatureFields } = useMemo(() => {
    if (detail?.form.formType !== "builder") {
      return { bodyBuilderFields: [], bodySignatureFields: [] };
    }
    if (formReadOnly) {
      return {
        bodyBuilderFields: builderFields.filter((field) => field.type !== "signature"),
        bodySignatureFields: builderFields.filter((field) => field.type === "signature"),
      };
    }
    return {
      bodyBuilderFields: builderFields.filter((field) => field.type !== "signature"),
      bodySignatureFields: builderFields.filter((field) => field.type === "signature"),
    };
  }, [builderFields, detail?.form.formType, formReadOnly]);

  const bodySignatureField = bodySignatureFields[0] ?? null;
  const builderSignatureValue = (() => {
    if (!bodySignatureField) return "";
    const raw = fieldValues[bodySignatureField.id];
    return typeof raw === "string" ? raw : "";
  })();

  const storedSignerName = detail
    ? parseStoredSignerName(detail.response.responses)
    : "";

  const canSign = useMemo(() => {
    if (!detail || formReadOnly || isSubmitting) return false;

    if (detail.form.formType === "upload") {
      if (!detail.form.requireSignature) return true;
      return signerName.trim().length > 0;
    }

    if (detail.form.formType === "builder") {
      return areBuilderFieldValuesComplete(builderFields, fieldValues);
    }

    return false;
  }, [builderFields, detail, fieldValues, formReadOnly, isSubmitting, signerName]);

  const submitActionLabel = useMemo(() => {
    if (!detail) return "Sign now";
    if (
      detail.form.formType === "upload" &&
      !detail.form.requireSignature
    ) {
      return "Acknowledge";
    }
    return "Sign now";
  }, [detail]);

  async function handleSubmit() {
    if (!detail || formReadOnly || !canSign) return;

    setIsSubmitting(true);
    let fetchResponse: Response | undefined;
    try {
      fetchResponse = await fetch(
        `/api/parent-portal/forms-documents/${encodeURIComponent(detail.form.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            signerName,
            fieldValues,
          }),
        },
      );
      const payload = (await fetchResponse.json()) as ParentFormDetail & {
        error?: string;
      };

      if (!fetchResponse.ok) {
        throw new Error(payload.error ?? "Failed to submit form.");
      }

      setDetail(payload);
      onSubmitted(payload);
      parentToast.success("Form signed successfully.");
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to submit form.",
      );
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "forms_documents.submit",
          error: "",
        },
        error,
        fetchResponse?.status,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const statusChipVariant =
    detail?.response.status === "signed"
      ? "success"
      : detail?.response.status === "overdue"
        ? "alert"
        : "warning";

  const statusLabel =
    detail?.response.status === "signed"
      ? "Signed"
      : detail?.response.status === "overdue"
        ? "Overdue"
        : "Needs your signature";

  const showSignSection = Boolean(
    detail &&
      !isLoadingDetail &&
      !detailError &&
      (formReadOnly
        ? isSigned
        : detail.form.formType === "upload" ||
          (detail.form.formType === "builder" && bodySignatureField != null)),
  );

  const showHeaderGoToSign =
    !formReadOnly && showSignSection && !isSignSectionInView;

  const scrollToSignSection = useCallback(() => {
    signSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!showSignSection) {
      setIsSignSectionInView(false);
      return;
    }

    const root = scrollBodyRef.current;
    const target = signSectionRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSignSectionInView(entry.isIntersecting);
      },
      { root, threshold: 0.3 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [showSignSection, isLoadingDetail, open, formId]);

  const showModal = open && Boolean(detail);

  return (
    <SchoolAdminModalShell
      open={showModal}
      onClose={onClose}
      maxWidth="3xl"
      zIndex={110}
      ariaLabelledBy={TITLE_ID}
      testId="parent-form-detail-modal"
      closeOnBackdrop={!isSubmitting}
      panelClassName="flex w-full max-w-[56rem] flex-col"
      panelStyle={{
        backgroundColor: theme.white,
        border: `1px solid ${theme.line}`,
        boxShadow: theme.shadowCard,
        maxHeight: "min(92vh, 52rem)",
      }}
    >
      {detail ? (
        <div className="flex min-h-0 flex-col" style={{ maxHeight: "min(92vh, 52rem)" }}>
          <header
            className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-3"
            style={{ borderColor: theme.line, backgroundColor: theme.paper }}
          >
            <div className="min-w-0">
              <p className="m-0 text-xs font-medium" style={{ color: theme.muted }}>
                Forms & documents
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2
                  id={TITLE_ID}
                  className="truncate text-lg font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {detail.form.title}
                </h2>
                <ParentChip theme={theme} tone={statusChipVariant}>
                  {statusLabel}
                </ParentChip>
              </div>
              {detail.form.dueDate ? (
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                  Due {formatFormDueDate(detail.form.dueDate)}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showHeaderGoToSign ? (
                <ParentButton
                  theme={theme}
                  onClick={scrollToSignSection}
                  className="whitespace-nowrap"
                >
                  Go to sign
                </ParentButton>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>
          </header>

          <div
            ref={scrollBodyRef}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-3 pb-5"
          >
            {isLoadingDetail ? (
              <ParentFormDetailSkeleton
                theme={theme}
                previewHeightClass={PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS}
                showSignSection
              />
            ) : detailError ? (
              <p className="text-sm" style={{ color: theme.ink }}>{detailError}</p>
            ) : (
              <>
                {detail.response.studentNames.length > 0 ? (
                  <p className="mb-2 text-sm" style={{ color: theme.muted }}>
                    For {detail.response.studentNames.join(", ")}
                  </p>
                ) : null}

                {detail.form.description ? (
                  <p
                    className="mb-2 text-sm leading-relaxed"
                    style={{ color: "#5D6D73" }}
                  >
                    {detail.form.description}
                  </p>
                ) : null}

                {detail.form.formType === "upload" ? (
                  <ParentFormDocumentPreview
                    theme={theme}
                    form={detail.form}
                    organizationId={organizationId}
                    readOnly={readOnly}
                    previewHeightClass={PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS}
                  />
                ) : null}

                {detail.form.formType === "builder" ? (
                  <div>
                    {formReadOnly ? (
                      bodyBuilderFields.length > 0 ? (
                        <>
                          <h3
                            className="mb-3 text-sm font-semibold"
                            style={{ color: theme.ink }}
                          >
                            Your response
                          </h3>
                          <ParentFormBuilderFields
                            fields={bodyBuilderFields}
                            values={fieldValues}
                            onChange={(fieldId, value) =>
                              setFieldValues((current) => ({
                                ...current,
                                [fieldId]: value,
                              }))
                            }
                            disabled={formReadOnly}
                            storedResponses={detail.response.responses}
                          />
                        </>
                      ) : null
                    ) : bodyBuilderFields.length > 0 ? (
                      <ParentFormBuilderFields
                        fields={bodyBuilderFields}
                        values={fieldValues}
                        onChange={(fieldId, value) =>
                          setFieldValues((current) => ({
                            ...current,
                            [fieldId]: value,
                          }))
                        }
                        disabled={formReadOnly}
                        storedResponses={detail.response.responses}
                      />
                    ) : null}
                  </div>
                ) : null}

                {showSignSection ? (
                  <SignSection
                    theme={theme}
                    sectionRef={signSectionRef}
                    title={formReadOnly ? "Your signature" : "Complete and sign"}
                  >
                    {formReadOnly ? (
                      <>
                        <ParentFormSignatureField
                          theme={theme}
                          value={storedSignerName}
                          onChange={() => undefined}
                          readOnly
                        />
                        {isSigned && detail.response.signedAt ? (
                          <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                            Signed on{" "}
                            {new Date(detail.response.signedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        ) : null}
                      </>
                    ) : detail.form.formType === "upload" &&
                      detail.form.requireSignature ? (
                      <>
                        <ParentFormSignatureField
                          theme={theme}
                          value={signerName}
                          onChange={setSignerName}
                          onSubmit={() => void handleSubmit()}
                          disabled={isSubmitting}
                        />
                        <ParentButton
                          theme={theme}
                          onClick={() => void handleSubmit()}
                          disabled={!canSign}
                          className="mt-4 w-full sm:w-auto"
                        >
                          {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Signing…
                            </span>
                          ) : (
                            submitActionLabel
                          )}
                        </ParentButton>
                      </>
                    ) : detail.form.formType === "upload" &&
                      !detail.form.requireSignature ? (
                      <>
                        <p className="text-sm" style={{ color: theme.muted }}>
                          Review the document above, then acknowledge below.
                        </p>
                        <ParentButton
                          theme={theme}
                          onClick={() => void handleSubmit()}
                          disabled={!canSign}
                          className="mt-4 w-full sm:w-auto"
                        >
                          {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Signing…
                            </span>
                          ) : (
                            submitActionLabel
                          )}
                        </ParentButton>
                      </>
                    ) : detail.form.formType === "builder" && bodySignatureField ? (
                      <>
                        <ParentFormSignatureField
                          theme={theme}
                          value={builderSignatureValue}
                          onChange={(value) =>
                            setFieldValues((current) => ({
                              ...current,
                              [bodySignatureField.id]: value,
                            }))
                          }
                          onSubmit={() => void handleSubmit()}
                          disabled={isSubmitting}
                        />
                        <ParentButton
                          theme={theme}
                          onClick={() => void handleSubmit()}
                          disabled={!canSign}
                          className="mt-4 w-full sm:w-auto"
                        >
                          {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Signing…
                            </span>
                          ) : (
                            submitActionLabel
                          )}
                        </ParentButton>
                      </>
                    ) : null}
                  </SignSection>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </SchoolAdminModalShell>
  );
}
