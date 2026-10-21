"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ApplicationUploadedFileList from "@/components/admissions/ApplicationUploadedFileList";
import type { AdminPostSubmitStep } from "@/lib/admissions/admin-post-submit-steps";
import type { ApplicationFileUploadMeta } from "@/lib/admissions/application-file-storage";
import { validateApplicationFileSelection } from "@/lib/admissions/application-file-storage";
import {
  MAX_POST_SUBMIT_STEP_COMPLETION_NOTES_LENGTH,
  MAX_POST_SUBMIT_STEP_FILES,
  POST_SUBMIT_STEP_FILE_ACCEPT,
  POST_SUBMIT_STEP_FILE_MAX_BYTES,
} from "@/lib/admissions/post-submit-step-documentation";
import { preparePostSubmitStepAttachmentFiles } from "@/lib/admissions/prepare-post-submit-step-attachments-client";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { createClient } from "@/utils/supabase/client";

export type PostSubmitStepDocumentationDialogProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
  open: boolean;
  step: AdminPostSubmitStep | null;
  loading?: boolean;
  onSave: (input: {
    notes: string;
    pendingFiles: File[];
    removedFileIds: string[];
  }) => void;
  onClose: () => void;
};

export default function PostSubmitStepDocumentationDialog({
  C,
  organizationId,
  open,
  step,
  loading = false,
  onSave,
  onClose,
}: PostSubmitStepDocumentationDialogProps) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState("");
  const [existingFiles, setExistingFiles] = useState<ApplicationFileUploadMeta[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !step) return;
    queueMicrotask(() => {
      setNotes(step.booking?.adminCompletionNotes ?? "");
      setExistingFiles(step.booking?.completionFiles ?? []);
      setRemovedFileIds([]);
      setPendingFiles([]);
      setFileError(null);
    });
  }, [open, step?.actionId, step?.booking?.adminCompletionNotes, step?.booking?.completionFiles]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  const visibleExistingFiles = existingFiles.filter(
    (file) => !removedFileIds.includes(file.id),
  );
  const totalFileCount = visibleExistingFiles.length + pendingFiles.length;
  const atFileLimit = totalFileCount >= MAX_POST_SUBMIT_STEP_FILES;

  async function handleSelectFiles(fileList: FileList) {
    setFileError(null);
    const next = [...pendingFiles];
    for (const file of Array.from(fileList)) {
      if (visibleExistingFiles.length + next.length >= MAX_POST_SUBMIT_STEP_FILES) {
        setFileError(`You can attach up to ${MAX_POST_SUBMIT_STEP_FILES} files.`);
        break;
      }
      const validationError = validateApplicationFileSelection(file, {
        accept: POST_SUBMIT_STEP_FILE_ACCEPT,
        maxBytes: POST_SUBMIT_STEP_FILE_MAX_BYTES,
      });
      if (validationError) {
        setFileError(validationError);
        continue;
      }
      next.push(file);
    }
    setPendingFiles(next);
  }

  const primaryStyle = getAdminButtonStyle(C, "primary");
  const secondaryStyle = getAdminButtonStyle(C, "secondary");

  return (
    <AnimatePresence>
      {open && step && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-submit-docs-dialog-title"
            className="w-full max-w-lg overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 pt-6 pb-2">
              <h2
                id="post-submit-docs-dialog-title"
                className="text-lg font-semibold"
                style={{ color: C.textPrimary }}
              >
                Notes & files
              </h2>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                {step.title} — internal to your team only.
              </p>
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                  htmlFor="post-submit-docs-notes"
                >
                  Notes
                </label>
                <textarea
                  id="post-submit-docs-notes"
                  rows={4}
                  value={notes}
                  disabled={loading}
                  maxLength={MAX_POST_SUBMIT_STEP_COMPLETION_NOTES_LENGTH}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: C.border,
                    color: C.textPrimary,
                    backgroundColor: C.bg,
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                  >
                    Files
                  </span>
                  <span className="text-[11px]" style={{ color: C.textSecondary }}>
                    {totalFileCount} of {MAX_POST_SUBMIT_STEP_FILES}
                  </span>
                </div>
                {visibleExistingFiles.length > 0 ? (
                  <ApplicationUploadedFileList
                    files={visibleExistingFiles}
                    C={C}
                    organizationId={organizationId}
                    supabase={supabase}
                    removable={!loading}
                    onRemove={(file) => {
                      setRemovedFileIds((current) => [...current, file.id]);
                    }}
                  />
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={POST_SUBMIT_STEP_FILE_ACCEPT}
                  className="hidden"
                  disabled={loading || atFileLimit}
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      void handleSelectFiles(event.target.files);
                    }
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={loading || atFileLimit}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={secondaryStyle}
                >
                  Add files
                </button>
                {pendingFiles.length > 0 ? (
                  <ul className="space-y-1 text-xs" style={{ color: C.textSecondary }}>
                    {pendingFiles.map((file) => (
                      <li key={`${file.name}-${file.size}`} className="flex justify-between gap-2">
                        <span className="truncate">{file.name} (new)</span>
                        <button
                          type="button"
                          disabled={loading}
                          className="shrink-0 underline-offset-2 hover:underline"
                          onClick={() =>
                            setPendingFiles((current) =>
                              current.filter((entry) => entry !== file),
                            )
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {fileError ? (
                  <p className="text-xs" style={{ color: C.error }}>{fileError}</p>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={secondaryStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  void (async () => {
                    const prepared = await preparePostSubmitStepAttachmentFiles(pendingFiles);
                    onSave({
                      notes: notes.trim(),
                      pendingFiles: prepared,
                      removedFileIds,
                    });
                  })();
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                style={primaryStyle}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
