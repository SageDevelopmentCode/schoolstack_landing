"use client";

import { Loader2, X } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentFormBuilderFields from "./ParentFormBuilderFields";
import ParentFormDetailSkeleton from "./ParentFormDetailSkeleton";
import ParentFormDocumentPreview from "./ParentFormDocumentPreview";
import ParentFormSignatureField from "./ParentFormSignatureField";
import { useParentFormDetail } from "./useParentFormDetail";
import type { ParentFormDetail, ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS } from "@/lib/school-parent/forms-documents/utils";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
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
  staffPreviewDetail?: ParentFormDetail | null;
  uploadPreviewUrl?: string | null;
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
  staffPreviewDetail = null,
  uploadPreviewUrl = null,
  onClose,
  onSubmitted,
}: ParentFormDetailModalProps) {
  const state = useParentFormDetail({
    open,
    organizationId,
    formId,
    initialItem,
    readOnly,
    staffPreviewDetail,
    onSubmitted,
  });
  const {
    detail,
    isStaffPreview,
    isSigned,
    formReadOnly,
    isLoadingDetail,
    isSubmitting,
    detailError,
    fieldValues,
    setFieldValue,
    signerName,
    setSignerName,
    bodyBuilderFields,
    bodySignatureField,
    builderSignatureValue,
    setBuilderSignature,
    storedSignerName,
    canSign,
    submitActionLabel,
    statusTone: statusChipVariant,
    statusLabel,
    showSignSection,
    isSignSectionInView,
    scrollToSignSection,
    scrollBodyRef,
    signSectionRef,
  } = state;

  async function handleSubmit() {
    const result = await state.submit();
    if (!result) return;
    if (result.ok) parentToast.success("Form signed successfully.");
    else parentToast.error(result.message);
  }

  const showHeaderGoToSign =
    showSignSection && !isSignSectionInView && (isStaffPreview || !formReadOnly);

  const showModal = open && Boolean(detail ?? staffPreviewDetail);

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
                    remoteDownloadEnabled={!isStaffPreview}
                    previewUrl={readOnly ? uploadPreviewUrl : null}
                    localPreviewUrl={
                      isStaffPreview || !readOnly ? uploadPreviewUrl : null
                    }
                    previewHeightClass={PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS}
                  />
                ) : null}

                {detail.form.formType === "builder" ? (
                  <div>
                    {formReadOnly && !isStaffPreview ? (
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
                            onChange={setFieldValue}
                            disabled={formReadOnly}
                            storedResponses={detail.response.responses}
                          />
                        </>
                      ) : null
                    ) : bodyBuilderFields.length > 0 ? (
                      <ParentFormBuilderFields
                        fields={bodyBuilderFields}
                        values={fieldValues}
                        onChange={setFieldValue}
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
                    title={
                      isStaffPreview
                        ? "Complete and sign"
                        : formReadOnly
                          ? "Your signature"
                          : "Complete and sign"
                    }
                  >
                    {isStaffPreview ? (
                      <>
                        {detail.form.formType === "upload" &&
                        !detail.form.requireSignature ? (
                          <p className="text-sm" style={{ color: theme.muted }}>
                            Review the document above, then acknowledge below.
                          </p>
                        ) : null}
                        <ParentFormSignatureField
                          theme={theme}
                          value=""
                          onChange={() => undefined}
                          disabled
                        />
                        <p className="mt-3 text-sm" style={{ color: theme.muted }}>
                          Preview only — families can sign after you publish.
                        </p>
                      </>
                    ) : formReadOnly ? (
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
                          onChange={setBuilderSignature}
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
