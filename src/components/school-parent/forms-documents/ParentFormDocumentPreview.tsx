"use client";

import { useCallback, useEffect, useState } from "react";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import { fetchParentFormDownloadUrl } from "@/lib/school-parent/forms-documents/fetch-parent-form-download-url";
import { TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";
import ParentButton from "@/components/school-parent/ui/ParentButton";

type ParentFormDocumentPreviewProps = {
  theme: ParentThemeTokens;
  form: TeacherParentForm;
  organizationId: string;
  readOnly?: boolean;
  previewHeightClass?: string;
};

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export default function ParentFormDocumentPreview({
  theme,
  form,
  organizationId,
  readOnly = false,
  previewHeightClass = TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS,
}: ParentFormDocumentPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({ status: "idle" });

  const loadPreview = useCallback(async () => {
    if (readOnly) return;
    if (form.uploadFormat === "docx") {
      setPreviewState({ status: "idle" });
      return;
    }

    setPreviewState({ status: "loading" });
    try {
      const signedUrl = await fetchParentFormDownloadUrl(form.id, organizationId);
      setPreviewState({
        status: "ready",
        url: buildEmbeddedPdfViewerUrl(signedUrl),
      });
    } catch (error) {
      setPreviewState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to load preview.",
      });
    }
  }, [form.id, form.uploadFormat, organizationId, readOnly]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  if (form.uploadFormat === "docx") {
    return (
      <div
        className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed px-4 text-center"
        style={{ borderColor: theme.line, backgroundColor: "#F3F6F3" }}
      >
        <p className="text-sm" style={{ color: theme.muted }}>
          Word preview isn&apos;t available in the browser — download the file to
          review it before signing.
        </p>
      </div>
    );
  }

  if (previewState.status === "loading" || previewState.status === "idle") {
    return (
      <div
        className={`${previewHeightClass} w-full animate-pulse rounded-xl`}
        style={{ backgroundColor: theme.line }}
        aria-busy="true"
        aria-label="Loading document preview"
      />
    );
  }

  if (previewState.status === "error") {
    return (
      <div
        className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 text-center"
        style={{ borderColor: theme.line, backgroundColor: "#F3F6F3" }}
      >
        <p className="text-sm" style={{ color: theme.muted }}>
          {previewState.message}
        </p>
        <ParentButton theme={theme} variant="outline" onClick={() => void loadPreview()}>
          Try again
        </ParentButton>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: theme.line, backgroundColor: "#F3F6F3" }}
    >
      <iframe
        src={previewState.url}
        title={form.uploadFileName ?? "Document preview"}
        className={`${previewHeightClass} w-full border-0`}
      />
    </div>
  );
}
