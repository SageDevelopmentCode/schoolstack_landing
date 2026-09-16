"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { UploadFileFormat } from "@/lib/school-teacher/forms-documents/types";

type TeacherFormUploadStepProps = {
  theme: ParentThemeTokens;
  uploadFormat: UploadFileFormat;
  uploadFileName: string | null;
  uploadFileSize: string | null;
  onFormatChange: (format: UploadFileFormat) => void;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TeacherFormUploadStep({
  theme,
  uploadFormat,
  uploadFileName,
  uploadFileSize,
  onFormatChange,
  onFileSelect,
  onFileClear,
}: TeacherFormUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accept = uploadFormat === "pdf" ? ".pdf" : ".doc,.docx";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          File type
        </p>
        <ParentStoryPillNav
          theme={theme}
          ariaLabel="File type"
          items={[
            { key: "pdf", label: "PDF" },
            { key: "docx", label: "DOCX" },
          ]}
          activeKey={uploadFormat}
          onChange={(key) => onFormatChange(key as UploadFileFormat)}
        />
      </div>

      <AdminCard theme={theme} padding="canvas">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        {!uploadFileName ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors hover:bg-white/50"
            style={{ borderColor: theme.line, backgroundColor: theme.cream }}
          >
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
            >
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold" style={{ color: theme.ink }}>
              Upload {uploadFormat === "pdf" ? "PDF" : "Word document"}
            </p>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              Click to browse or drag and drop
            </p>
          </button>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: theme.line, backgroundColor: theme.cream }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: theme.alertBg, color: theme.alert }}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: theme.ink }}>
                {uploadFileName}
              </p>
              <p className="text-xs" style={{ color: theme.muted }}>
                {uploadFormat.toUpperCase()} · {uploadFileSize}
              </p>
            </div>
            <button
              type="button"
              onClick={onFileClear}
              className="shrink-0 cursor-pointer rounded p-1.5 transition-colors hover:bg-white"
              style={{ color: theme.muted }}
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {!uploadFileName ? (
          <div className="mt-3 flex justify-center">
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Choose file
            </AdminButton>
          </div>
        ) : null}
      </AdminCard>
    </div>
  );
}
