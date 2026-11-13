"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";

export const MESSAGE_ATTACHMENT_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/gif";

const TEXTAREA_MAX_ROWS = 5;
const TEXTAREA_LINE_HEIGHT = 22;

export type MessageFileRejection = {
  /** Files skipped because they exceed MAX_MESSAGE_ATTACHMENT_BYTES. */
  tooLarge: string[];
  /** Files skipped because MAX_MESSAGE_ATTACHMENTS was already reached. */
  overLimit: string[];
};

/**
 * Shared composer behaviour (attachment limits, Enter-to-send, auto-grow).
 * Used by every `MessagesComposeBar` look and the parent Garden composer so
 * the rules live in one place.
 */
export function useMessageComposer({
  value,
  files,
  onFilesChange,
  onSend,
  hideAttachments = false,
  autoGrow,
  onFilesRejected,
  textareaRef: externalTextareaRef,
}: {
  value: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
  hideAttachments?: boolean;
  autoGrow: boolean;
  onFilesRejected?: (rejection: MessageFileRejection) => void;
  /** Optional external ref so a host can focus the composer. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef ?? internalTextareaRef;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = [...files];
      const tooLarge: string[] = [];
      const overLimit: string[] = [];
      for (const file of incoming) {
        if (next.length >= MAX_MESSAGE_ATTACHMENTS) {
          overLimit.push(file.name);
          continue;
        }
        if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) {
          tooLarge.push(file.name);
          continue;
        }
        next.push(file);
      }
      onFilesChange(next);
      if (tooLarge.length > 0 || overLimit.length > 0) {
        onFilesRejected?.({ tooLarge, overLimit });
      }
    },
    [files, onFilesChange, onFilesRejected],
  );

  const removeFileAt = useCallback(
    (index: number) => onFilesChange(files.filter((_, i) => i !== index)),
    [files, onFilesChange],
  );

  const canSend = Boolean(value.trim() || (!hideAttachments && files.length > 0));

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        if (canSend) onSend();
      }
    },
    [canSend, onSend],
  );

  useEffect(() => {
    if (!autoGrow || !textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    const maxHeight = TEXTAREA_LINE_HEIGHT * TEXTAREA_MAX_ROWS;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [autoGrow, textareaRef, value]);

  return {
    fileInputRef,
    textareaRef,
    addFiles,
    removeFileAt,
    canSend,
    handleKeyDown,
    openFilePicker: () => fileInputRef.current?.click(),
    atAttachmentLimit: files.length >= MAX_MESSAGE_ATTACHMENTS,
  };
}
