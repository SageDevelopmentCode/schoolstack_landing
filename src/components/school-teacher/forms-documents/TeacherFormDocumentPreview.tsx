"use client";

import { useCallback, useEffect, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import { fetchTeacherFormDownloadUrl } from "@/lib/school-teacher/forms-documents/fetch-teacher-form-download-url";
import { TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";

type TeacherFormDocumentPreviewProps = {
  theme: ParentThemeTokens;
  form: TeacherParentForm;
  organizationId: string;
  previewMode?: boolean;
};

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export default function TeacherFormDocumentPreview({
  theme,
  form,
  organizationId,
  previewMode = false,
}: TeacherFormDocumentPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({ status: "idle" });

  const loadPreview = useCallback(async () => {
    if (previewMode) return;
    if (form.status === "draft") {
      setPreviewState({ status: "idle" });
      return;
    }
    if (form.uploadFormat === "docx") {
      setPreviewState({ status: "idle" });
      return;
    }

    setPreviewState({ status: "loading" });
    try {
      const signedUrl = await fetchTeacherFormDownloadUrl(form.id, organizationId);
      setPreviewState({ status: "ready", url: buildEmbeddedPdfViewerUrl(signedUrl) });
    } catch (error) {
      setPreviewState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to load preview.",
      });
    }
  }, [form.id, form.status, form.uploadFormat, organizationId, previewMode]);

  useEffect(() => {
    void loadPreview();
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

  if (previewState.status === "loading" || previewState.status === "idle") {
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
        <AdminButton theme={theme} variant="outline" size="compact" onClick={() => void loadPreview()}>
          Try again
        </AdminButton>
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
