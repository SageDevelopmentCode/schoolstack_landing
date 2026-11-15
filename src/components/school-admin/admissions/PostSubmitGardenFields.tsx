"use client";

import type { ReactNode, RefObject } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { G_INPUT, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { GardenField, gIconBtn } from "@/components/school-admin/garden/kit";

/**
 * Garden notes + files form shared by the post-application "Mark complete"
 * and "Notes & files" dialogs. State and upload rules stay in the dialogs.
 */
export default function PostSubmitGardenFields({
  idPrefix,
  notesLabel,
  notesPlaceholder,
  notes,
  onNotesChange,
  notesMaxLength,
  rows = 3,
  loading,
  fileInputRef,
  accept,
  atFileLimit,
  fileCount,
  maxFiles,
  pendingFiles,
  onRemovePending,
  onSelectFiles,
  fileError,
  existingFiles,
}: {
  idPrefix: string;
  notesLabel: string;
  notesPlaceholder?: string;
  notes: string;
  onNotesChange: (value: string) => void;
  notesMaxLength: number;
  rows?: number;
  loading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  atFileLimit: boolean;
  fileCount: number;
  maxFiles: number;
  pendingFiles: File[];
  onRemovePending: (file: File) => void;
  onSelectFiles: (files: FileList) => void;
  fileError: string | null;
  existingFiles?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <GardenField
        id={`${idPrefix}-notes`}
        label={notesLabel}
        counter={notes.length > notesMaxLength * 0.8 ? { value: notes.length, max: notesMaxLength } : undefined}
      >
        <textarea
          id={`${idPrefix}-notes`}
          rows={rows}
          value={notes}
          disabled={loading}
          maxLength={notesMaxLength}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder={notesPlaceholder}
          className={`${G_INPUT} resize-y`}
        />
      </GardenField>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-extrabold text-[var(--sf-ink)]">
            Files <span className="ml-1 text-[12px] font-bold text-[var(--sf-soft)]">Optional</span>
          </span>
          <span className="text-[12px] font-bold tabular-nums text-[var(--sf-soft)]">
            {fileCount} of {maxFiles}
          </span>
        </div>
        {existingFiles}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          disabled={loading || atFileLimit}
          onChange={(event) => {
            if (event.target.files?.length) onSelectFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {pendingFiles.length > 0 ? (
          <ul className="m-0 mb-2 flex list-none flex-col gap-1.5 p-0">
            {pendingFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-2.5 rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2"
              >
                <FileText className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/55" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[var(--sf-ink)]">
                  {file.name}
                </span>
                <span className="shrink-0 text-[11.5px] font-bold text-[var(--sf-soft)]">New</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onRemovePending(file)}
                  className={`${gIconBtn} !h-7 !w-7`}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          disabled={loading || atFileLimit}
          onClick={() => fileInputRef.current?.click()}
          className={gBtnOutlineSm}
        >
          <Paperclip className="h-4 w-4" aria-hidden />
          Add files
        </button>
        <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          PDF or images. Photos are compressed before upload.
        </p>
        {fileError ? (
          <p role="alert" className="m-0 mt-1.5 text-[12.5px] font-bold text-[#9a3422]">
            {fileError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
