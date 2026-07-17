"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { FileText, GripVertical, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import {
  buildEmbeddedPdfViewerUrl,
  deleteEnrollmentChecklistPdf,
  getEnrollmentChecklistPdfSignedUrl,
  uploadEnrollmentChecklistPdf,
} from "@/lib/admissions/enrollment-checklist-document-storage";
import type {
  EnrollmentContractSection,
  InlineDocumentConfig,
  PdfDocumentConfig,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type EditorBaseProps = {
  C: AdminThemeTokens;
  readOnly?: boolean;
};

type InlineEditorProps = EditorBaseProps & {
  document: InlineDocumentConfig;
  onChange: (document: InlineDocumentConfig) => void;
};

type PdfEditorProps = EditorBaseProps & {
  document: PdfDocumentConfig;
  onChange: (document: PdfDocumentConfig) => void;
  organizationId: string;
  templateId: string;
  itemId: string;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
  };
}

function SectionEditorCard({
  C,
  section,
  sectionIdx,
  readOnly,
  inputStyle: style,
  onUpdate,
  onDelete,
}: {
  C: AdminThemeTokens;
  section: EnrollmentContractSection;
  sectionIdx: number;
  readOnly?: boolean;
  inputStyle: React.CSSProperties;
  onUpdate: (patch: Partial<EnrollmentContractSection>) => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div
        className="rounded-md border p-4 space-y-3"
        style={{ borderColor: C.border, backgroundColor: C.bg }}
      >
        <div className="flex items-center gap-2">
          {!readOnly ? (
            <button
              type="button"
              aria-label="Drag to reorder section"
              className="touch-none cursor-grab rounded p-1 active:cursor-grabbing shrink-0"
              style={{ color: C.textQuaternary }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <p className="min-w-0 flex-1 text-[11px] font-semibold" style={{ color: C.textSecondary }}>
            Section {sectionIdx + 1}
          </p>
          {!readOnly ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 shrink-0"
              style={{ color: C.error }}
              aria-label="Delete section"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Section title"
          disabled={readOnly}
          style={style}
        />
        <textarea
          rows={12}
          value={section.body}
          onChange={(e) => onUpdate({ body: e.target.value })}
          placeholder="Agreement text families will read and sign..."
          disabled={readOnly}
          style={{ ...style, resize: "vertical" }}
        />
        <p className="text-[10px]" style={{ color: C.textTertiary }}>
          Families sign this section before moving on.
        </p>
      </div>
    </Reorder.Item>
  );
}

export function EnrollmentInlineAgreementEditor({
  C,
  document,
  onChange,
  readOnly = false,
}: InlineEditorProps) {
  const style = inputStyle(C);

  const updateSections = (sections: EnrollmentContractSection[]) => {
    onChange({ ...document, sections });
  };

  const addSection = () => {
    const nextIndex = document.sections.length + 1;
    const newSection: EnrollmentContractSection = {
      id: newAdmissionsId(),
      title: `${nextIndex}. Section title`,
      body: "",
    };
    updateSections([...document.sections, newSection]);
  };

  const updateSection = (sectionId: string, patch: Partial<EnrollmentContractSection>) => {
    updateSections(
      document.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    );
  };

  const addSectionButton = !readOnly ? (
    <button
      type="button"
      onClick={addSection}
      className="flex w-full items-center justify-center gap-1 rounded-sm px-3 py-2 text-[11px] font-medium"
      style={{
        border: `1px dashed ${C.borderStrong}`,
        color: C.accent,
      }}
    >
      <Plus className="h-3.5 w-3.5" />
      Add section
    </button>
  ) : null;

  return (
    <div className="space-y-4">
      {document.consentOptions && document.consentOptions.length > 0 && (
        <div
          className="rounded-md border px-3 py-2 text-[11px] leading-relaxed"
          style={{ borderColor: C.border, backgroundColor: C.bg, color: C.textTertiary }}
        >
          Includes {document.consentOptions.length} consent options families choose before
          signing.
        </div>
      )}

      {document.sections.length === 0 ? (
        <div
          className="rounded-md px-3 py-6 text-center text-[11px]"
          style={{
            border: `1px dashed ${C.borderStrong}`,
            color: C.textTertiary,
          }}
        >
          No sections yet.
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={document.sections}
          onReorder={updateSections}
          as="div"
          className="flex flex-col gap-4"
        >
          {document.sections.map((section, sectionIdx) => (
            <SectionEditorCard
              key={section.id}
              C={C}
              section={section}
              sectionIdx={sectionIdx}
              readOnly={readOnly}
              inputStyle={style}
              onUpdate={(patch) => updateSection(section.id, patch)}
              onDelete={() =>
                updateSections(document.sections.filter((s) => s.id !== section.id))
              }
            />
          ))}
        </Reorder.Group>
      )}

      {addSectionButton}
    </div>
  );
}

export function EnrollmentPdfAgreementEditor({
  C,
  document,
  onChange,
  organizationId,
  templateId,
  itemId,
  readOnly = false,
}: PdfEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!document.storagePath) {
      queueMicrotask(() => setPreviewUrl(null));
      return;
    }

    let cancelled = false;
    void getEnrollmentChecklistPdfSignedUrl(supabase, document.storagePath)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [document.storagePath, supabase]);

  const handlePdfSelect = async (file: File | null) => {
    if (!file || readOnly) return;

    setUploading(true);
    setUploadError(null);

    try {
      if (document.storagePath) {
        await deleteEnrollmentChecklistPdf(supabase, document.storagePath);
      }

      const uploaded = await uploadEnrollmentChecklistPdf(
        supabase,
        { organizationId, templateId, itemId },
        file,
      );

      onChange({
        kind: "pdf",
        fileName: uploaded.fileName,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
        requireSignature: document.requireSignature !== false,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload PDF.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePdfRemove = async () => {
    if (readOnly) return;
    setUploadError(null);

    try {
      if (document.storagePath) {
        await deleteEnrollmentChecklistPdf(supabase, document.storagePath);
      }
      onChange({ kind: "pdf", fileName: "", requireSignature: true });
      setPreviewUrl(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to remove PDF.");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        disabled={readOnly || uploading}
        onChange={(e) => void handlePdfSelect(e.target.files?.[0] ?? null)}
      />

      {!document.storagePath ? (
        <div
          className="flex flex-col items-center justify-center rounded-md px-4 py-8 text-center"
          style={{
            border: `2px dashed ${C.borderStrong}`,
            backgroundColor: C.bg,
            opacity: uploading ? 0.7 : 1,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (readOnly || uploading) return;
            const file = e.dataTransfer.files[0];
            if (file?.type === "application/pdf" || file?.name.endsWith(".pdf")) {
              void handlePdfSelect(file);
            }
          }}
        >
          {uploading ? (
            <Loader2 className="mb-2 h-6 w-6 animate-spin" style={{ color: C.accent }} />
          ) : (
            <Upload className="mb-2 h-6 w-6" style={{ color: C.textQuaternary }} />
          )}
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            {uploading ? "Uploading PDF…" : "Drop a PDF here"}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
            Families will read the uploaded document and sign below if required.
          </p>
          {!readOnly ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50"
              style={{
                backgroundColor: C.accentLight,
                color: C.accent,
                border: `1px solid ${C.accent}`,
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Choose PDF
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-[11px]"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <FileText className="h-4 w-4 shrink-0" style={{ color: C.accent }} />
            <span className="truncate font-medium" style={{ color: C.textPrimary }}>
              {document.fileName}
            </span>
            {!readOnly ? (
              <button
                type="button"
                onClick={() => void handlePdfRemove()}
                disabled={uploading}
                className="ml-auto text-[10px] font-medium disabled:opacity-50"
                style={{ color: C.error }}
              >
                Remove
              </button>
            ) : null}
          </div>

          {previewUrl ? (
            <iframe
              title={document.fileName || "PDF preview"}
              src={buildEmbeddedPdfViewerUrl(previewUrl)}
              className="min-h-[480px] h-[560px] w-full rounded-md border"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
            />
          ) : null}

          {!readOnly ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium disabled:opacity-50"
              style={{ color: C.accent }}
            >
              <ButtonLoadingLabel loading={uploading} loadingLabel="Uploading…">
                Replace PDF
              </ButtonLoadingLabel>
            </button>
          ) : null}
        </div>
      )}

      {uploadError ? (
        <p className="text-[11px]" style={{ color: C.error }}>
          {uploadError}
        </p>
      ) : null}

      {document.storagePath ? (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
            Require signature below the PDF?
          </p>
          <label
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: C.textPrimary }}
          >
            <input
              type="checkbox"
              checked={document.requireSignature !== false}
              disabled={readOnly}
              onChange={(e) =>
                onChange({
                  ...document,
                  requireSignature: e.target.checked,
                })
              }
              className="h-4 w-4 rounded"
              style={{ accentColor: C.accent }}
            />
            Yes, require parent signature
          </label>
        </div>
      ) : null}

      <p className="text-xs" style={{ color: C.textTertiary }}>
        PDFs upload immediately. Click Save draft to keep this item linked to your checklist.
      </p>
    </div>
  );
}
