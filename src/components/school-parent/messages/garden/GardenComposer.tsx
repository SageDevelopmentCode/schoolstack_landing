"use client";

import { useEffect, useRef, useState, type DragEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, Loader2, Paperclip, SendHorizontal, Upload, X } from "lucide-react";
import { G_FOCUS, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  MESSAGE_ATTACHMENT_ACCEPT,
  useMessageComposer,
} from "@/components/messages/useMessageComposer";
import type { MessagesFeedbackHandler } from "@/components/messages/messages-inbox-view-model";
import {
  FileTypeIcon,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB_LABEL,
  formatFileSize,
} from "./garden-messages-shared";

/*
 * Parent Garden composer. All rules (limits, Enter-to-send, auto-grow) come
 * from the shared `useMessageComposer`; this adds the Garden look plus drag &
 * drop / paste for files, a live file counter and keyboard hints. Send is the
 * view's single toy button.
 */
export default function GardenComposer({
  value,
  onChange,
  files,
  onFilesChange,
  onSend,
  sending,
  readOnly,
  recipientName,
  hasMessages,
  notify,
  textareaRef,
}: {
  value: string;
  onChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
  sending: boolean;
  readOnly: boolean;
  recipientName: string;
  hasMessages: boolean;
  notify: MessagesFeedbackHandler;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const reduce = useReducedMotion() === true;
  const [dragActive, setDragActive] = useState(false);
  const dragDepth = useRef(0);
  const { fileInputRef, addFiles, removeFileAt, canSend, handleKeyDown, openFilePicker, atAttachmentLimit } =
    useMessageComposer({
      value,
      files,
      onFilesChange,
      onSend,
      autoGrow: true,
      textareaRef,
      onFilesRejected: (rejection) =>
        notify({
          type: "files_rejected",
          tooLarge: rejection.tooLarge,
          overLimit: rejection.overLimit,
        }),
    });

  // The textarea is disabled while sending, which drops focus; hand it back so
  // the parent can keep typing (or retry a restored message) straight away.
  const wasSending = useRef(sending);
  useEffect(() => {
    if (wasSending.current && !sending && !readOnly) {
      const active = document.activeElement;
      if (!active || active === document.body) textareaRef.current?.focus();
    }
    wasSending.current = sending;
  }, [readOnly, sending, textareaRef]);

  const attachDisabled = readOnly || sending || atAttachmentLimit;
  const sendDisabled = readOnly || sending || !canSend;

  const acceptsDrop = (event: DragEvent) =>
    !attachDisabled && Array.from(event.dataTransfer?.types ?? []).includes("Files");

  const dropHandlers = {
    onDragEnter: (event: DragEvent<HTMLDivElement>) => {
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      setDragActive(true);
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragActive(false);
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      dragDepth.current = 0;
      setDragActive(false);
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
    },
  };

  const placeholder = readOnly
    ? "Preview mode — sending disabled"
    : hasMessages
      ? "Write a warm reply…"
      : `Say hello to ${recipientName}…`;

  return (
    <div
      className="relative shrink-0 border-t-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 [&>*]:mx-auto [&>*]:max-w-[760px]"
      {...dropHandlers}
    >
      {readOnly ? (
        <p className="sf-paper m-0 mb-2.5 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[13px] font-semibold text-[var(--sf-soft)]">
          <Eye className="h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
          Preview mode — sending disabled
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {files.length > 0 ? (
          <motion.ul
            key="files"
            aria-label="Files to send"
            className="m-0 mb-2.5 flex list-none flex-wrap gap-2 p-0"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex max-w-full items-center gap-2 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-sky)] py-1 pl-2.5 pr-1 text-[12.5px] font-bold text-[var(--sf-ink)]"
              >
                <FileTypeIcon mimeType={file.type} className="h-3.5 w-3.5 shrink-0 text-[#24507a]" />
                <span className="max-w-[150px] truncate sm:max-w-[200px]">{file.name}</span>
                <span className="shrink-0 font-semibold text-[var(--sf-ink)]/55">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFileAt(index)}
                  disabled={sending}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[var(--sf-ink)]/70 hover:bg-white hover:text-[var(--sf-ink)] disabled:opacity-50 ${G_FOCUS} focus-visible:ring-offset-0`}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      <div
        className={`relative flex items-end gap-1.5 rounded-[22px] border-2 bg-[var(--sf-paper)] p-1.5 transition-colors ${
          dragActive
            ? "border-dashed border-[var(--sf-clay)]"
            : "border-[var(--sf-ink)]/20 focus-within:border-[var(--sf-ink)]"
        } ${readOnly ? "opacity-70" : ""}`}
      >
        <button
          type="button"
          onClick={openFilePicker}
          disabled={attachDisabled}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/70 transition-colors hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-clay-deep)] disabled:cursor-not-allowed disabled:opacity-45 ${G_FOCUS} focus-visible:ring-offset-0`}
          aria-label="Attach files"
          title={
            atAttachmentLimit
              ? `You can attach up to ${MAX_ATTACHMENTS} files`
              : `Attach PDFs or images (up to ${MAX_ATTACHMENT_MB_LABEL} each)`
          }
        >
          <Paperclip className="h-[18px] w-[18px]" aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={MESSAGE_ATTACHMENT_ACCEPT}
          onChange={(event) => {
            if (event.target.files?.length) {
              addFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <label htmlFor="parent-garden-composer" className="sr-only">
          Message {recipientName}
        </label>
        <textarea
          id="parent-garden-composer"
          ref={textareaRef}
          value={value}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={(event) => {
            const pasted = event.clipboardData?.files;
            if (!pasted?.length || attachDisabled) return;
            if (!event.clipboardData.getData("text")) event.preventDefault();
            addFiles(pasted);
          }}
          placeholder={placeholder}
          disabled={readOnly || sending}
          aria-describedby="parent-garden-composer-hint"
          className="max-h-[110px] min-h-[22px] flex-1 resize-none self-center bg-transparent py-2 text-[16px] font-semibold leading-[22px] text-[var(--sf-ink)] outline-none placeholder:font-semibold placeholder:text-[var(--sf-ink)]/40 disabled:cursor-not-allowed sm:text-[15px]"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          aria-busy={sending || undefined}
          className={`${gBtnPopSm} !h-10 !w-10 shrink-0 !p-0`}
          aria-label="Send message"
          title="Send (Enter)"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <SendHorizontal className="h-4 w-4" aria-hidden />
          )}
        </button>

        <AnimatePresence>
          {dragActive ? (
            <motion.div
              key="drop"
              className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-[20px] bg-[var(--sf-accent-wash)]/95 text-sm font-extrabold text-[var(--sf-clay-deep)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Upload className="h-4 w-4" aria-hidden />
              Drop files to attach
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div
        id="parent-garden-composer-hint"
        className="mt-1.5 flex items-center justify-between gap-3 px-2 text-[11.5px] font-semibold text-[var(--sf-soft)]"
      >
        <span className="hidden [@media(hover:hover)]:inline">
          <kbd className="font-extrabold text-[var(--sf-ink)]/70">Enter</kbd> to send ·{" "}
          <kbd className="font-extrabold text-[var(--sf-ink)]/70">Shift + Enter</kbd> for a new line
        </span>
        <span className="ml-auto shrink-0" aria-live="polite">
          {files.length > 0
            ? `${files.length} / ${MAX_ATTACHMENTS} files`
            : `PDFs or images · up to ${MAX_ATTACHMENT_MB_LABEL}`}
        </span>
      </div>
    </div>
  );
}
