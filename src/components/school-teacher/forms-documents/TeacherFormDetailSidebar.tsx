"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive, Copy, Download, FileText, Send, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import TeacherFormDetailSkeleton from "./TeacherFormDetailSkeleton";
import TeacherFormDocumentPreview from "./TeacherFormDocumentPreview";
import TeacherFormSignatureTable from "./TeacherFormSignatureTable";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FIELD_TYPE_LABELS,
  FORM_STATUS_LABELS,
  FORM_TYPE_LABELS,
  type TeacherFormSignatureRow,
  type TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";
import {
  formatAudienceLabel,
  formatFormDueDate,
  getFormProgressPercent,
} from "@/lib/school-teacher/forms-documents/utils";

type TeacherFormDetailSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  form: TeacherParentForm | null;
  signatureRows: TeacherFormSignatureRow[];
  organizationId: string;
  detailLoading?: boolean;
  previewMode?: boolean;
  previewUrl?: string | null;
  actionLoading?: boolean;
  onClose: () => void;
  onArchive?: (formId: string) => void;
  onDuplicate?: (formId: string) => void;
  onDownload?: (formId: string) => void;
  onSend?: (form: TeacherParentForm) => void;
  fetchDownloadUrl?: (formId: string, organizationId: string) => Promise<string>;
};

function statusChipVariant(
  status: TeacherParentForm["status"],
): "success" | "warning" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "archived":
      return "info";
    default:
      return "warning";
  }
}

export default function TeacherFormDetailSidebar({
  theme,
  open,
  form,
  signatureRows,
  organizationId,
  detailLoading = false,
  previewMode = false,
  previewUrl = null,
  actionLoading = false,
  onClose,
  onArchive,
  onDuplicate,
  onDownload,
  onSend,
  fetchDownloadUrl,
}: TeacherFormDetailSidebarProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [displayedForm, setDisplayedForm] = useState<TeacherParentForm | null>(form);

  useEffect(() => {
    if (open && form) {
      setDisplayedForm(form);
    }
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const contentForm = open ? (form ?? displayedForm) : displayedForm;
  if (!contentForm && !open) return null;

  const progressPercent = getFormProgressPercent(contentForm);
  const typeLabel =
    contentForm.formType === "upload" && contentForm.uploadFormat
      ? contentForm.uploadFormat.toUpperCase()
      : FORM_TYPE_LABELS[contentForm.formType];

  const backdropTransition = { duration: reducedMotion ? 0.1 : 0.15 };
  const panelTransition = reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.18, ease: [0.32, 0.72, 0, 1] as const };
  const panelInitial = reducedMotion ? { opacity: 0 } : { x: "100%", opacity: 0 };
  const panelAnimate = reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 };
  const panelExit = reducedMotion ? { opacity: 0 } : { x: "100%", opacity: 0 };

  return (
    <AnimatePresence onExitComplete={() => setDisplayedForm(null)}>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
          data-testid="teacher-form-detail-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-form-detail-sidebar-title"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,36rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs font-medium" style={{ color: theme.muted }}>
                  Family form
                </p>
                <h2
                  id="teacher-form-detail-sidebar-title"
                  className="mt-1 truncate text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {contentForm.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm" style={{ color: theme.muted }}>
                  {contentForm.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ParentChip theme={theme} tone="info">{typeLabel}</ParentChip>
                  <ParentChip theme={theme} tone={statusChipVariant(contentForm.status)}>
                    {FORM_STATUS_LABELS[contentForm.status]}
                  </ParentChip>
                </div>
                <p className="mt-1.5 text-xs" style={{ color: theme.muted }}>
                  {formatAudienceLabel(contentForm)} · Due{" "}
                  {formatFormDueDate(contentForm.dueDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            {!previewMode ? (
              <div
                className="flex shrink-0 flex-col gap-2 border-b px-5 py-3 sm:flex-row sm:flex-wrap"
                style={{ borderColor: theme.line }}
              >
                {contentForm.status === "draft" ? (
                  <AdminButton
                    theme={theme}
                    variant="primary"
                    size="compact"
                    className="w-full sm:w-auto"
                    disabled={actionLoading}
                    onClick={() => onSend?.(contentForm)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send to families
                  </AdminButton>
                ) : null}
                <AdminButton
                  theme={theme}
                  variant="outline"
                  size="compact"
                  className="w-full sm:w-auto"
                  disabled={actionLoading}
                  onClick={() => onDuplicate?.(contentForm.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </AdminButton>
                {contentForm.status !== "archived" ? (
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    size="compact"
                    className="w-full sm:w-auto"
                    disabled={actionLoading}
                    onClick={() => onArchive?.(contentForm.id)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </AdminButton>
                ) : null}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detailLoading ? (
                <TeacherFormDetailSkeleton
                  theme={theme}
                  formType={contentForm.formType}
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {contentForm.status === "active" ? (
                    <AdminCard theme={theme} padding="canvas">
                      <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                        {contentForm.signedFamilies} of {contentForm.totalFamilies} families
                        signed
                      </p>
                      <div
                        className="mt-2 h-2 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: theme.line }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: theme.primary,
                          }}
                        />
                      </div>
                    </AdminCard>
                  ) : null}

                  {contentForm.formType === "upload" ? (
                    <AdminCard theme={theme} padding="canvas">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: theme.alertBg, color: theme.alert }}
                          >
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                              {contentForm.uploadFileName ?? "Uploaded document"}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                              {contentForm.uploadFormat?.toUpperCase() ?? "PDF"}
                              {contentForm.uploadFileSize
                                ? ` · ${contentForm.uploadFileSize}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <AdminButton
                          theme={theme}
                          variant="outline"
                          size="compact"
                          disabled={actionLoading}
                          onClick={() => onDownload?.(contentForm.id)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </AdminButton>
                      </div>
                      <div className="mt-5">
                        <TeacherFormDocumentPreview
                          theme={theme}
                          form={contentForm}
                          organizationId={organizationId}
                          previewMode={previewMode}
                          previewUrl={previewUrl}
                          fetchDownloadUrl={fetchDownloadUrl}
                        />
                      </div>
                    </AdminCard>
                  ) : (
                    <AdminCard theme={theme} padding="canvas">
                      <p className="mb-4 text-sm font-semibold" style={{ color: theme.ink }}>
                        Form fields
                      </p>
                      <div className="flex flex-col gap-2">
                        {(contentForm.fields ?? []).map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                            style={{ borderColor: theme.line, backgroundColor: theme.cream }}
                          >
                            <span
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{
                                backgroundColor: theme.primarySoft,
                                color: theme.primary,
                              }}
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium" style={{ color: theme.ink }}>
                                {field.label}
                              </p>
                              <p className="text-xs" style={{ color: theme.muted }}>
                                {FIELD_TYPE_LABELS[field.type]}
                                {field.required ? " · Required" : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AdminCard>
                  )}

                  <div>
                    <p className="mb-3 text-sm font-semibold" style={{ color: theme.ink }}>
                      Family signatures
                    </p>
                    <TeacherFormSignatureTable theme={theme} rows={signatureRows} />
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
