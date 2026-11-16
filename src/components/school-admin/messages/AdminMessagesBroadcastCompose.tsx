"use client";

import { useId, useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { G_FOCUS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  FileTypeIcon,
  formatFileSize,
} from "@/components/school-parent/messages/garden/garden-messages-shared";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";
import { MAX_ATTACHMENT_MB_LABEL } from "@/lib/messages/parent-messages-feedback";

type AdminMessagesBroadcastComposeProps = {
  value: string;
  onChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Files that weren't added (too large / over the count limit). */
  onFilesRejected?: (rejection: { tooLarge: string[]; overLimit: string[] }) => void;
};

/**
 * Step 2 of Bulk message (Garden): the message and up to N attachments.
 * Same limits as before; rejected files are reported instead of dropped silently.
 */
export default function AdminMessagesBroadcastCompose({
  value,
  onChange,
  files,
  onFilesChange,
  disabled = false,
  placeholder = "Write a message to send to each parent individually…",
  onFilesRejected,
}: AdminMessagesBroadcastComposeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaId = useId();
  const hintId = useId();

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    const tooLarge: string[] = [];
    const overLimit: string[] = [];
    for (const file of incoming) {
      if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) {
        tooLarge.push(file.name);
        continue;
      }
      if (next.length >= MAX_MESSAGE_ATTACHMENTS) {
        overLimit.push(file.name);
        continue;
      }
      next.push(file);
    }
    onFilesChange(next);
    if (tooLarge.length || overLimit.length) onFilesRejected?.({ tooLarge, overLimit });
  };

  const atLimit = files.length >= MAX_MESSAGE_ATTACHMENTS;

  return (
    <div className="space-y-3">
      <label htmlFor={textareaId} className="block text-[13px] font-extrabold text-[var(--sf-ink)]">
        Message
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={6}
        placeholder={placeholder}
        aria-describedby={hintId}
        data-autofocus
        // The step mounts this box: put the cursor in it so step 2 is one keystroke away.
        autoFocus
        className="min-h-[150px] w-full resize-y rounded-[18px] border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-3 text-[16px] font-semibold leading-relaxed text-[var(--sf-ink)] outline-none transition-colors placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-ink)] disabled:opacity-60 sm:text-[15px]"
      />

      {files.length > 0 ? (
        <ul aria-label="Files to send" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-sky)] py-1 pl-2.5 pr-1 text-[12.5px] font-bold text-[var(--sf-ink)]"
            >
              <FileTypeIcon mimeType={file.type} className="h-3.5 w-3.5 shrink-0 text-[#24507a]" />
              <span className="max-w-[170px] truncate">{file.name}</span>
              <span className="shrink-0 font-semibold text-[var(--sf-ink)]/55">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                disabled={disabled}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[var(--sf-ink)]/70 hover:bg-white hover:text-[var(--sf-ink)] disabled:opacity-50 ${G_FOCUS} focus-visible:ring-offset-0`}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || atLimit}
          className={`${gBtnOutlineSm} !px-3.5 !py-2`}
        >
          <Paperclip className="h-4 w-4" aria-hidden />
          Attach files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            if (event.target.files?.length) {
              addFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <span id={hintId} className="text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
          {files.length > 0
            ? `${files.length} / ${MAX_MESSAGE_ATTACHMENTS} files attached`
            : `Optional · PDFs or images up to ${MAX_ATTACHMENT_MB_LABEL}, ${MAX_MESSAGE_ATTACHMENTS} max`}
        </span>
      </div>
    </div>
  );
}
