"use client";

import { useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Upload } from "lucide-react";
import ApplicationUploadedFileList from "@/components/admissions/ApplicationUploadedFileList";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import {
  buildApplicationFileLimitLabel,
  type ApplicationFileUploadMeta,
} from "@/lib/admissions/application-file-storage";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFileUploadFieldProps = {
  id: string;
  files: ApplicationFileUploadMeta[];
  maxFiles: number;
  accept?: string;
  helpText?: string;
  disabled?: boolean;
  uploading?: boolean;
  error?: string | null;
  previewSuffix?: string;
  C: AdminThemeTokens;
  supabase?: SupabaseClient;
  removable?: boolean;
  onSelectFiles: (files: FileList) => void | Promise<void>;
  onRemoveFile: (file: ApplicationFileUploadMeta) => void | Promise<void>;
};

function primaryButtonStyle(C: AdminThemeTokens, disabled: boolean) {
  return {
    ...getAdminButtonStyle(C, "primary"),
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

export default function ApplicationFileUploadField({
  id,
  files,
  maxFiles,
  accept,
  helpText = "Upload required documents.",
  disabled = false,
  uploading = false,
  error = null,
  previewSuffix = "",
  C,
  supabase,
  removable = true,
  onSelectFiles,
  onRemoveFile,
}: ApplicationFileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputDisabled = disabled || uploading;
  const atLimit = files.length >= maxFiles;
  const canAddMore = !atLimit && !fileInputDisabled;
  const limitLabel = buildApplicationFileLimitLabel(files.length, maxFiles);
  const showRemove = removable && !disabled;

  function openFilePicker() {
    if (fileInputDisabled || atLimit) return;
    fileInputRef.current?.click();
  }

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      id={id}
      type="file"
      multiple={maxFiles > 1}
      accept={accept}
      disabled={fileInputDisabled || atLimit}
      className="hidden"
      onChange={(event) => {
        if (event.target.files?.length) {
          void onSelectFiles(event.target.files);
        }
        event.target.value = "";
      }}
    />
  );

  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center"
          style={{
            borderColor: C.borderStrong,
            backgroundColor: "#FFFFFF",
            opacity: fileInputDisabled ? 0.7 : 1,
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (fileInputDisabled || atLimit) return;
            void onSelectFiles(event.dataTransfer.files);
          }}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
          role="button"
          tabIndex={fileInputDisabled ? -1 : 0}
          aria-disabled={fileInputDisabled}
        >
          <Upload className="mb-3 h-8 w-8" style={{ color: C.textQuaternary }} />
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            Drop files here or click to upload
          </p>
          <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
            {helpText}
          </p>
          {accept ? (
            <p className="mt-2 text-[11px]" style={{ color: C.textTertiary }}>
              Accepted: {accept}
            </p>
          ) : null}
          <p className="mt-2 text-[11px] font-medium" style={{ color: C.textSecondary }}>
            {limitLabel}
          </p>
          {hiddenFileInput}
          <button
            type="button"
            disabled={fileInputDisabled}
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            className={`mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white ${BUTTON_LOADING_LAYOUT_CLASS}`}
            style={primaryButtonStyle(C, fileInputDisabled)}
          >
            <ButtonLoadingLabel loading={uploading} loadingLabel="Uploading…">
              Choose files
            </ButtonLoadingLabel>
            {previewSuffix}
          </button>
        </div>
      ) : (
        <div
          className="rounded-lg border px-4 py-4"
          style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              Uploaded files
            </p>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              {limitLabel}
              {atLimit ? " · maximum reached" : ""}
            </p>
          </div>
          <ApplicationUploadedFileList
            files={files}
            C={C}
            supabase={supabase}
            removable={showRemove}
            onRemove={onRemoveFile}
          />
          {hiddenFileInput}
          {canAddMore ? (
            <button
              type="button"
              disabled={uploading}
              onClick={openFilePicker}
              className={`mt-4 rounded-md border px-4 py-2 text-sm font-semibold ${BUTTON_LOADING_LAYOUT_CLASS}`}
              style={{
                ...getAdminButtonStyle(C, "neutral"),
                opacity: uploading ? 0.7 : 1,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              <ButtonLoadingLabel loading={uploading} loadingLabel="Uploading…">
                Add another file
              </ButtonLoadingLabel>
              {previewSuffix}
            </button>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
