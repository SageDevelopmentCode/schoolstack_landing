"use client";

import { useRef } from "react";
import { Paperclip, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";

type AdminMessagesBroadcastComposeProps = {
  value: string;
  onChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  placeholder?: string;
};

export default function AdminMessagesBroadcastCompose({
  value,
  onChange,
  files,
  onFilesChange,
  disabled = false,
  theme,
  C,
  placeholder = "Write a message to send to each parent individually…",
}: AdminMessagesBroadcastComposeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= MAX_MESSAGE_ATTACHMENTS) break;
      if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) continue;
      next.push(file);
    }
    onFilesChange(next);
  };

  return (
    <div className="space-y-3">
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: theme.line,
                color: theme.muted,
                backgroundColor: theme.paper,
              }}
            >
              <span className="max-w-[160px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                disabled={disabled}
                className="cursor-pointer disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={5}
        placeholder={placeholder}
        className="min-h-[120px] w-full resize-y rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:ring-1 disabled:opacity-60"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.paper,
          color: theme.ink,
        }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= MAX_MESSAGE_ATTACHMENTS}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ color: C.textSecondary }}
        >
          <Paperclip className="h-4 w-4" />
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
        {files.length > 0 ? (
          <span className="text-xs" style={{ color: theme.muted }}>
            {files.length}/{MAX_MESSAGE_ATTACHMENTS} attached
          </span>
        ) : null}
      </div>
    </div>
  );
}
