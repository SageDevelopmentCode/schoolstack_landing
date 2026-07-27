"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ApplicationDatePicker from "@/components/admissions/ApplicationDatePicker";
import ApplicationAddressInput from "@/components/admissions/ApplicationAddressInput";
import ApplicationFileUploadField from "@/components/admissions/ApplicationFileUploadField";
import ApplicationRadioInput from "@/components/admissions/ApplicationRadioInput";
import ApplicationCheckboxInput from "@/components/admissions/ApplicationCheckboxInput";
import ApplicationSelectInput from "@/components/admissions/ApplicationSelectInput";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import { resolveDateRange } from "@/lib/admissions/application-form-schema";
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
  error?: string | null;
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

function FieldError({
  error,
  C,
}: {
  error: string;
  C: AdminThemeTokens;
}) {
  return (
    <p className="mt-1.5 text-xs" style={{ color: C.error }}>
      {error}
    </p>
  );
}

export default function ApplicationFieldInput({
  field,
  value,
  onChange,
  C,
  disabled = false,
  error = null,
  uploadContext,
  supabase,
}: ApplicationFieldInputProps) {
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const style = {
    borderColor: error ? C.errorBorder : C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: "#FFFFFF",
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

  if (field.type === "address") {
    return (
      <ApplicationAddressInput
        idPrefix={field.id}
        value={value}
        onChange={onChange}
        C={C}
        disabled={disabled}
        error={error}
      />
    );
  }

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
          aria-invalid={Boolean(error)}
          className={`${fieldClassName()} resize-y min-h-[88px]`}
          style={{ ...style, ...focusRing }}
        />
        {error ? <FieldError error={error} C={C} /> : null}
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <ApplicationSelectInput
          id={field.id}
          value={value}
          onChange={onChange}
          options={field.options ?? []}
          placeholder="Select..."
          disabled={disabled}
          ariaLabel={field.label}
          error={error}
          C={C}
        />
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div>
        <ApplicationRadioInput
          name={field.id}
          value={value}
          onChange={onChange}
          options={field.options ?? []}
          disabled={disabled}
          ariaLabel={field.label}
          error={error}
          C={C}
        />
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <ApplicationCheckboxInput
        id={field.id}
        checked={value === "true"}
        onChange={(checked) => onChange(checked ? "true" : "")}
        label={field.label}
        description={field.helpText}
        disabled={disabled}
        error={error}
        C={C}
      />
    );
  }

  if (field.type === "file") {
    const files = parseApplicationFileFieldValue(value);
    const maxFiles = field.maxFiles ?? DEFAULT_APPLICATION_FILE_MAX_COUNT;
    const accept = field.accept ?? DEFAULT_APPLICATION_FILE_ACCEPT;
    const isPreview = !uploadContext;
    const displayError = fileError ?? error;

    return (
      <ApplicationFileUploadField
        id={field.id}
        files={files}
        maxFiles={maxFiles}
        accept={accept}
        helpText={field.helpText ?? `Upload up to ${maxFiles} supported files.`}
        disabled={disabled}
        uploading={uploading}
        error={displayError}
        previewSuffix={isPreview ? " (preview)" : ""}
        C={C}
        supabase={supabase}
        removable={!disabled}
        onSelectFiles={handleFileSelection}
        onRemoveFile={(file) => void removeFile(file.id)}
      />
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
          aria-invalid={Boolean(error)}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        />
        {error ? <FieldError error={error} C={C} /> : null}
        {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
      </div>
    );
  }

  if (field.type === "date") {
    const effectiveDateRange =
      field.dateRange ?? (field.id === "student_date_of_birth" ? "past" : undefined);
    const { minDate, maxDate } = resolveDateRange(effectiveDateRange);
    return (
      <div>
        <ApplicationDatePicker
          id={field.id}
          value={value}
          onChange={onChange}
          C={C}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          placeholder={field.placeholder}
          error={error}
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
        aria-invalid={Boolean(error)}
        className={fieldClassName()}
        style={{ ...style, ...focusRing }}
      />
      {error ? <FieldError error={error} C={C} /> : null}
      {field.helpText ? <HelpText text={field.helpText} C={C} /> : null}
    </div>
  );
}
