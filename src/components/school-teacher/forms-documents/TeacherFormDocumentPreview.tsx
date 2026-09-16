"use client";

import { useCallback, useEffect, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import { fetchTeacherFormDownloadUrl } from "@/lib/school-teacher/forms-documents/fetch-teacher-form-download-url";
import { TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";

const PREVIEW_UNAVAILABLE = "Document preview unavailable in preview mode.";

type TeacherFormDocumentPreviewProps = {
  theme: ParentThemeTokens;
  form: TeacherParentForm;
  organizationId: string;
  previewMode?: boolean;
  previewUrl?: string | null;
  fetchDownloadUrl?: (formId: string, organizationId: string) => Promise<string>;
};

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export default function TeacherFormDocumentPreview({
  theme,
  form,
  organizationId,
  previewMode = false,
  previewUrl = null,
  fetchDownloadUrl,
}: TeacherFormDocumentPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({ status: "loading" });

  const loadPreview = useCallback(async () => {
    if (form.status === "draft" || form.uploadFormat === "docx") {
      return;
    }

    if (previewUrl) {
      setPreviewState({
        status: "ready",
        url: buildEmbeddedPdfViewerUrl(previewUrl),
      });
      return;
    }

    if (previewMode) {
      setPreviewState({
        status: "error",
        message: PREVIEW_UNAVAILABLE,
      });
      return;
    }

    setPreviewState({ status: "loading" });
    try {
      const resolveDownloadUrl = fetchDownloadUrl ?? fetchTeacherFormDownloadUrl;
      const signedUrl = await resolveDownloadUrl(form.id, organizationId);
      setPreviewState({ status: "ready", url: buildEmbeddedPdfViewerUrl(signedUrl) });
    } catch (error) {
      setPreviewState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to load preview.",
      });
    }
  }, [
    fetchDownloadUrl,
    form.id,
    form.status,
    form.uploadFormat,
    organizationId,
    previewMode,
    previewUrl,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPreview();
    });
  }, [loadPreview]);

  if (form.status === "draft") {
    return (
      <div
        className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed"
        style={{ borderColor: theme.line, backgroundColor: "#F3F6F3" }}
      >
        <p className="text-sm" style={{ color: theme.muted }}>
          Document preview available after publish
        </p>
      </div>
    );
  }

  if (form.uploadFormat === "docx") {
    return (
      <div
        className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed px-4 text-center"
        style={{ borderColor: theme.line, backgroundColor: "#F3F6F3" }}
      >
        <p className="text-sm" style={{ color: theme.muted }}>
          Word preview isn&apos;t available in the browser — use Download to view the file.
        </p>
      </div>
    );
  }

  if (previewState.status === "loading") {
    return (
      <div
        className={`${TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS} w-full animate-pulse rounded-xl`}
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
        {!previewMode ? (
          <AdminButton
            theme={theme}
            variant="outline"
            size="compact"
            onClick={() => void loadPreview()}
          >
            Try again
          </AdminButton>
        ) : null}
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
        className={`${TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS} w-full border-0`}
      />
    </div>
  );
}
