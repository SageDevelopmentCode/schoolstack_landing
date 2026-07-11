"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import {
  DEFAULT_APPLICATION_FILE_ACCEPT,
  DEFAULT_APPLICATION_FILE_MAX_COUNT,
  parseApplicationFileFieldValue,
  serializeApplicationFileFieldValue,
  removeApplicationFile,
  uploadApplicationFile,
  validateApplicationFileSelection,
  type ApplicationFileUploadContext,
  type ApplicationFileUploadMeta,
} from "@/lib/admissions/application-file-storage";
import { formatPhoneNumberInput } from "@/lib/phone-format";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFieldInputProps = {
  field: ApplicationField;
  value: string;
  onChange: (value: string) => void;
  C: AdminThemeTokens;
  disabled?: boolean;
  uploadContext?: ApplicationFileUploadContext;
  supabase?: SupabaseClient;
};

function fieldClassName() {
  return "w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2";
}

function HelpText({
  text,
  C,
}: {
  text: string;
  C: AdminThemeTokens;
}) {
  return (
    <p className="mt-1.5 text-xs" style={{ color: C.textSecondary }}>
      {text}
    </p>
  );
}

export default function ApplicationFieldInput({
  field,
  value,
  onChange,
  C,
  disabled = false,
  uploadContext,
  supabase,
}: ApplicationFieldInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const style = {
    borderColor: C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: disabled ? C.input : "#FFFFFF",
  } as const;

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  const appendLocalFiles = (files: File[]) => {
    const existing = parseApplicationFileFieldValue(value);
    const maxFiles = field.maxFiles ?? DEFAULT_APPLICATION_FILE_MAX_COUNT;
    const next: ApplicationFileUploadMeta[] = [...existing];

    for (const file of files) {
      if (next.length >= maxFiles) break;
      const validationError = validateApplicationFileSelection(file, {
        accept: field.accept ?? DEFAULT_APPLICATION_FILE_ACCEPT,
      });
      if (validationError) {
        setFileError(validationError);
        return;
      }
      next.push({
        id: `local-${crypto.randomUUID()}`,
        fileName: file.name,
        storagePath: "",
        mimeType: file.type || null,
        sizeBytes: file.size,
      });
    }

    setFileError(null);
    onChange(serializeApplicationFileFieldValue(next));
  };

  const handleFileSelection = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const canUpload = Boolean(uploadContext && supabase);

    if (!canUpload) {
      appendLocalFiles(incoming);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const existing = parseApplicationFileFieldValue(value);
    const maxFiles = field.maxFiles ?? DEFAULT_APPLICATION_FILE_MAX_COUNT;
    const remaining = Math.max(0, maxFiles - existing.length);
    const toUpload = incoming.slice(0, remaining);
    if (toUpload.length === 0) {
      setFileError(`You can upload up to ${maxFiles} files.`);
      return;
    }

    setUploading(true);
    setFileError(null);

    try {
      const uploaded: ApplicationFileUploadMeta[] = [];
      for (const file of toUpload) {
        const validationError = validateApplicationFileSelection(file, {
          accept: field.accept ?? DEFAULT_APPLICATION_FILE_ACCEPT,
        });
        if (validationError) {
          setFileError(validationError);
          break;
        }
        const meta = await uploadApplicationFile(
          supabase!,
          uploadContext!,
          field.id,
          file,
        );
        uploaded.push(meta);
      }
      if (uploaded.length > 0) {
        onChange(
          serializeApplicationFileFieldValue([...existing, ...uploaded]),
        );
      }
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Failed to upload file.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = async (fileId: string) => {
    const existing = parseApplicationFileFieldValue(value);
    const target = existing.find((file) => file.id === fileId);
    if (!target) return;

    if (target.storagePath && supabase) {
      try {
        await removeApplicationFile(supabase, target);
      } catch (err) {
        setFileError(
          err instanceof Error ? err.message : "Failed to remove file.",
        );
        return;
      }
    }

    const next = existing.filter((file) => file.id !== fileId);
    setFileError(null);
    onChange(serializeApplicationFileFieldValue(next));
  };

  if (field.type === "textarea") {
    return (
      <div>
        <textarea
          id={field.id}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${fieldClassName()} resize-y min-h-[88px]`}
          style={{ ...style, ...focusRing }}
        />
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <select
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        >
          <option value="">Select...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div>
        <div className="flex flex-wrap gap-4">
          {field.options?.map((option) => (
            <label
              key={option.value}
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: C.textPrimary }}
            >
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-4 w-4"
                style={{ accentColor: C.accent }}
              />
              {option.label}
            </label>
          ))}
        </div>
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 text-sm" style={{ color: C.textPrimary }}>
        <input
          id={field.id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          disabled={disabled}
          className="h-4 w-4 rounded"
          style={{ accentColor: C.accent }}
        />
        <span>{field.helpText ?? field.label}</span>
      </label>
    );
  }

  if (field.type === "file") {
    const files = parseApplicationFileFieldValue(value);
    const maxFiles = field.maxFiles ?? DEFAULT_APPLICATION_FILE_MAX_COUNT;
    const atLimit = files.length >= maxFiles;

    return (
      <div>
        <input
          ref={fileInputRef}
          id={field.id}
          type="file"
          multiple={maxFiles > 1}
          accept={field.accept ?? DEFAULT_APPLICATION_FILE_ACCEPT}
          disabled={disabled || uploading || atLimit}
          onChange={(e) => void handleFileSelection(e.target.files)}
          className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium"
          style={{ color: C.textSecondary }}
        />
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
        {uploading ? (
          <p className="mt-1.5 text-xs" style={{ color: C.textSecondary }}>
            Uploading…
          </p>
        ) : null}
        {fileError ? (
          <p className="mt-1.5 text-xs" style={{ color: C.error }}>
            {fileError}
          </p>
        ) : null}
        {files.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-xs"
                style={{ borderColor: C.border, color: C.textPrimary }}
              >
                <span className="truncate">{file.fileName}</span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => void removeFile(file.id)}
                    className="shrink-0 font-medium"
                    style={{ color: C.error }}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (field.type === "tel") {
    return (
      <div>
        <input
          id={field.id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={field.placeholder ?? "(562) - 332 - 4687"}
          value={formatPhoneNumberInput(value)}
          onChange={(e) => onChange(formatPhoneNumberInput(e.target.value))}
          disabled={disabled}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        />
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  return (
    <div>
      <input
        id={field.id}
        type={field.type}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={fieldClassName()}
        style={{ ...style, ...focusRing }}
      />
      {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
    </div>
  );
}
