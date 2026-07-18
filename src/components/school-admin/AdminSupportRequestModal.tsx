"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES =
  "image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif";

const TOPIC_OPTIONS = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Something isn't working" },
  { value: "application-forms", label: "Application forms" },
  { value: "enrollment", label: "Enrollment" },
  { value: "billing", label: "Billing" },
  { value: "feature", label: "Feature request" },
  { value: "other", label: "Other" },
] as const;

type TopicValue = (typeof TOPIC_OPTIONS)[number]["value"];

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

export type AdminSupportRequestModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  userEmail?: string | null;
  currentPath?: string;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "13px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
}

function labelStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: C.textSecondary,
    marginBottom: 6,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function createAttachmentItem(file: File): AttachmentItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
  };
}

function revokeAttachmentPreview(item: AttachmentItem) {
  if (item.previewUrl) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

function revokeAllPreviews(items: AttachmentItem[]) {
  for (const item of items) {
    revokeAttachmentPreview(item);
  }
}

export default function AdminSupportRequestModal({
  C,
  open,
  onClose,
  organizationId,
  userEmail,
  currentPath,
}: AdminSupportRequestModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState<TopicValue>("general");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTopic("general");
    setDescription("");
    setAttachmentError(null);
    setSubmitError(null);
    setSubmitting(false);
    setSubmitted(false);
    setAttachments((prev) => {
      revokeAllPreviews(prev);
      return [];
    });
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, submitting]);

  function addFiles(fileList: FileList) {
    setAttachmentError(null);

    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      setAttachmentError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    const accepted: AttachmentItem[] = [];
    const errors: string[] = [];

    for (const file of incoming.slice(0, remaining)) {
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name} exceeds 10 MB.`);
        continue;
      }
      accepted.push(createAttachmentItem(file));
    }

    if (incoming.length > remaining) {
      errors.push(`Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added.`);
    }

    if (accepted.length > 0) {
      setAttachments((prev) => [...prev, ...accepted]);
    }

    if (errors.length > 0) {
      setAttachmentError(errors.join(" "));
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed) {
        revokeAttachmentPreview(removed);
      }
      return next;
    });
    setAttachmentError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set("organizationId", organizationId);
    formData.set("topic", topic);
    formData.set("description", description.trim());
    if (currentPath?.trim()) {
      formData.set("sourcePagePath", currentPath.trim());
    }
    for (const item of attachments) {
      formData.append("attachments", item.file);
    }

    try {
      const response = await fetch("/api/school-admin/support-requests", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Failed to submit your request. Please try again.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error?.trim()) {
            message = payload.error.trim();
          }
        } catch {
          // ignore JSON parse errors
        }
        setSubmitError(message);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = description.trim().length > 0 && !submitting;
  const style = inputStyle(C);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={submitting ? undefined : handleClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-support-modal-title"
            aria-describedby={
              submitted
                ? "admin-support-success-description"
                : "admin-support-modal-description"
            }
            className="flex max-h-[min(90vh,720px)] w-full max-w-[480px] flex-col overflow-hidden rounded-xl shadow-xl"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3"
              style={{
                padding: "18px 20px 16px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: C.clayBg, border: `1px solid ${C.clayBorder}` }}
                >
                  <Image
                    src="/images/Logo.png"
                    alt=""
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    id="admin-support-modal-title"
                    className="text-sm font-semibold leading-tight"
                    style={{ color: C.textPrimary }}
                  >
                    Get help
                  </h2>
                  <p
                    id="admin-support-modal-description"
                    className="mt-0.5 text-xs leading-relaxed"
                    style={{ color: C.textTertiary }}
                  >
                    Tell us what&apos;s going on — screenshots help a lot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex shrink-0 items-center rounded-md p-1 disabled:opacity-50"
                style={{ color: C.textTertiary, background: "transparent", border: "none", cursor: "pointer" }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Request received
                </h3>
                <p
                  id="admin-support-success-description"
                  className="mt-2 max-w-xs text-sm leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  {userEmail
                    ? `Thanks — we'll follow up at ${userEmail}.`
                    : "Thanks — we'll be in touch soon."}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-md px-4 py-2 text-sm font-semibold"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  className="flex-1 space-y-4 overflow-y-auto"
                  style={{ padding: "16px 20px" }}
                >
                  <div>
                    <label htmlFor="support-topic" style={labelStyle(C)}>
                      Topic
                    </label>
                    <select
                      id="support-topic"
                      value={topic}
                      disabled={submitting}
                      onChange={(event) =>
                        setTopic(event.target.value as TopicValue)
                      }
                      style={style}
                    >
                      {TOPIC_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="support-description" style={labelStyle(C)}>
                      Description
                    </label>
                    <textarea
                      id="support-description"
                      value={description}
                      disabled={submitting}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="What were you trying to do? What happened instead?"
                      rows={5}
                      required
                      style={{ ...style, resize: "vertical", minHeight: 110 }}
                    />
                  </div>

                  <div>
                    <span style={labelStyle(C)}>
                      Attachments{" "}
                      <span style={{ fontWeight: 400, color: C.textTertiary }}>
                        (optional)
                      </span>
                    </span>

                    {attachments.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center"
                        style={{
                          borderColor: C.borderStrong,
                          backgroundColor: "#FFFFFF",
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1,
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (submitting) return;
                          if (event.dataTransfer.files.length) {
                            addFiles(event.dataTransfer.files);
                          }
                        }}
                        onClick={() => {
                          if (!submitting) fileInputRef.current?.click();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload screenshots or files"
                      >
                        <Upload
                          className="mb-2 h-7 w-7"
                          style={{ color: C.textQuaternary }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          Drop files here or click to upload
                        </p>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          Screenshots, PDFs, or other files that help explain the issue.
                        </p>
                        <p
                          className="mt-2 text-[11px] font-medium"
                          style={{ color: C.textSecondary }}
                        >
                          Up to {MAX_FILES} files, 10 MB each
                        </p>
                      </div>
                    ) : (
                      <div
                        className="rounded-lg border px-3 py-3"
                        style={{
                          borderColor: C.border,
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <ul className="space-y-2">
                          {attachments.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 rounded-md px-2 py-2"
                              style={{ backgroundColor: C.elevated }}
                            >
                              {item.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.previewUrl}
                                  alt=""
                                  className="h-10 w-10 shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
                                  style={{
                                    backgroundColor: C.surface,
                                    color: C.textTertiary,
                                  }}
                                >
                                  <FileText className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-sm font-medium"
                                  style={{ color: C.textPrimary }}
                                  title={item.file.name}
                                >
                                  {item.file.name}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: C.textTertiary }}
                                >
                                  {formatFileSize(item.file.size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(item.id)}
                                disabled={submitting}
                                className="shrink-0 rounded p-1 disabled:opacity-50"
                                style={{
                                  color: C.textTertiary,
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                aria-label={`Remove ${item.file.name}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>

                        {attachments.length < MAX_FILES ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={submitting}
                            className="mt-3 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            style={getAdminButtonStyle(C, "neutral")}
                          >
                            Add another file
                          </button>
                        ) : null}
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPTED_FILE_TYPES}
                      disabled={submitting}
                      className="hidden"
                      onChange={(event) => {
                        if (event.target.files?.length) {
                          addFiles(event.target.files);
                        }
                        event.target.value = "";
                      }}
                    />

                    {attachmentError ? (
                      <p
                        className="mt-2 text-xs"
                        style={{ color: C.error }}
                        role="alert"
                      >
                        {attachmentError}
                      </p>
                    ) : null}
                  </div>

                  {submitError ? (
                    <p
                      className="text-sm"
                      style={{ color: C.error }}
                      role="alert"
                    >
                      {submitError}
                    </p>
                  ) : null}
                </div>

                <div
                  className="flex shrink-0 justify-end gap-2"
                  style={{
                    padding: "14px 20px",
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={getAdminButtonStyle(C, "neutral")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    style={{
                      ...getAdminButtonStyle(C, "primary"),
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit request"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
