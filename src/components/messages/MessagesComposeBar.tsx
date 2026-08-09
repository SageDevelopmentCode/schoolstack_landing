"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";
import type { MessagesLayoutVariant } from "./MessagesAvatar";

const TEXTAREA_MAX_ROWS = 5;
const TEXTAREA_LINE_HEIGHT = 22;

export default function MessagesComposeBar({
  value,
  onChange,
  files,
  onFilesChange,
  onSend,
  sending,
  disabled,
  C,
  variant = "card",
}: {
  value: string;
  onChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
  sending: boolean;
  disabled?: boolean;
  C: AdminThemeTokens;
  variant?: MessagesLayoutVariant;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const embedded = variant === "embedded";

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= MAX_MESSAGE_ATTACHMENTS) break;
      if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) continue;
      next.push(file);
    }
    onFilesChange(next);
  };

  const canSend = Boolean(value.trim() || files.length > 0);

  useEffect(() => {
    if (!embedded || !textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    const maxHeight = TEXTAREA_LINE_HEIGHT * TEXTAREA_MAX_ROWS;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [embedded, value]);

  if (embedded) {
    return (
      <div
        className="shrink-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        style={{ backgroundColor: C.surface }}
      >
        {files.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: C.border, color: C.textSecondary, backgroundColor: C.bg }}
              >
                <span className="truncate max-w-[160px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                  className="cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className="flex items-end gap-2 rounded-[1.75rem] border px-2 py-1.5 shadow-sm"
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer transition hover:bg-black/[0.04] disabled:opacity-50"
            style={{ color: C.textSecondary }}
            aria-label="Attach files"
          >
            <Paperclip className="w-4 h-4" />
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
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder={disabled ? "Preview mode — sending disabled" : "Write a message…"}
            disabled={disabled || sending}
            className="max-h-[110px] min-h-[22px] flex-1 resize-none bg-transparent py-2 text-sm leading-[22px] disabled:opacity-60 focus:outline-none"
            style={{ color: C.textPrimary }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || sending || !canSend}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white cursor-pointer transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: C.accent }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="shrink-0 border-t p-4 space-y-2"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs"
              style={{ borderColor: C.border, color: C.textSecondary }}
            >
              <span className="truncate max-w-[160px]">{file.name}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                className="cursor-pointer"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS}
          className="px-2 py-2 rounded-lg border cursor-pointer disabled:opacity-50"
          style={{ borderColor: C.border, color: C.textSecondary }}
          aria-label="Attach files"
        >
          <Paperclip className="w-4 h-4" />
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
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={disabled ? "Preview mode — sending disabled" : "Write a message…"}
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 text-sm rounded-lg border disabled:opacity-60"
          style={{ borderColor: C.border, color: C.textPrimary, backgroundColor: C.bg }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || sending || !canSend}
          className="px-3 py-2 rounded-lg text-white cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: C.accent }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
