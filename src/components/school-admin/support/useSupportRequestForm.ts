"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

export const SUPPORT_MAX_FILES = 5;
export const SUPPORT_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const SUPPORT_ACCEPTED_FILE_TYPES = "image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif";

export const SUPPORT_TOPIC_OPTIONS = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Something isn't working" },
  { value: "application-forms", label: "Application forms" },
  { value: "enrollment", label: "Enrollment" },
  { value: "billing", label: "Billing" },
  { value: "feature", label: "Feature request" },
  { value: "other", label: "Other" },
] as const;

export type SupportTopicValue = (typeof SUPPORT_TOPIC_OPTIONS)[number]["value"];

export type SupportAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
};

/** What was sent, kept for the success recap after the form resets. */
export type SupportSentSummary = {
  topicLabel: string;
  fileCount: number;
  pagePath: string | null;
};

const SUBMIT_ERROR_TOAST_ID = "support-request-error";
const SUBMIT_SUCCESS_TOAST_ID = "support-request-sent";
const GENERIC_SUBMIT_ERROR = "Failed to submit your request. Please try again.";

export function formatSupportFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function createAttachment(file: File): SupportAttachment {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
  };
}

function revokePreview(item: SupportAttachment) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function topicLabel(value: SupportTopicValue): string {
  return SUPPORT_TOPIC_OPTIONS.find((option) => option.value === value)?.label ?? "General question";
}

/** Pasted screenshots arrive as "image.png"; give them a readable name. */
function namePastedFile(file: File, index: number): File {
  if (file.name && file.name !== "image.png") return file;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const ext = file.type.split("/")[1] || "png";
  return new File([file], `pasted-screenshot-${stamp}${index ? `-${index + 1}` : ""}.${ext}`, {
    type: file.type,
    lastModified: Date.now(),
  });
}

/**
 * State + submit for the Get help dialog. Same request as before:
 * POST multipart `organizationId`, `topic`, `description`, `sourcePagePath`,
 * `attachments[]` to `submitEndpoint`.
 */
export function useSupportRequestForm({
  organizationId,
  submitEndpoint,
  currentPath,
  userEmail,
  readOnly,
}: {
  organizationId: string;
  submitEndpoint: string;
  currentPath?: string;
  userEmail?: string | null;
  readOnly: boolean;
}) {
  const [topic, setTopic] = useState<SupportTopicValue>("general");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sent, setSent] = useState<SupportSentSummary | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Revoke object URLs on unmount.
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(() => () => attachmentsRef.current.forEach(revokePreview), []);

  const trimmedDescription = description.trim();
  const fieldsDisabled = submitting || readOnly;
  const canSubmit = trimmedDescription.length > 0 && !fieldsDisabled;
  const isDirty = trimmedDescription.length > 0 || attachments.length > 0;
  const descriptionError =
    submitAttempted && trimmedDescription.length === 0
      ? "Add a few words so we know how to help."
      : null;

  const clearFields = useCallback(() => {
    setTopic("general");
    setDescription("");
    setAttachmentErrors([]);
    setSubmitError(null);
    setSubmitAttempted(false);
    setDragActive(false);
    setAttachments((prev) => {
      prev.forEach(revokePreview);
      return [];
    });
  }, []);

  /** Full reset (dialog closed). */
  const reset = useCallback(() => {
    clearFields();
    setSubmitting(false);
    setSent(null);
  }, [clearFields]);

  /** "Send another": back to an empty form inside the open dialog. */
  const startAnother = useCallback(() => {
    clearFields();
    setSent(null);
  }, [clearFields]);

  const addFiles = useCallback(
    (incomingList: FileList | File[]) => {
      if (fieldsDisabled) return;
      const incoming = Array.from(incomingList);
      if (incoming.length === 0) return;

      const remaining = SUPPORT_MAX_FILES - attachments.length;
      if (remaining <= 0) {
        setAttachmentErrors([`You can attach up to ${SUPPORT_MAX_FILES} files.`]);
        return;
      }

      const accepted: SupportAttachment[] = [];
      const errors: string[] = [];
      for (const file of incoming.slice(0, remaining)) {
        if (file.size > SUPPORT_MAX_FILE_BYTES) {
          errors.push(`${file.name} exceeds 10 MB.`);
          continue;
        }
        accepted.push(createAttachment(file));
      }
      if (incoming.length > remaining) {
        errors.push(`Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added.`);
      }

      if (accepted.length > 0) setAttachments((prev) => [...prev, ...accepted]);
      setAttachmentErrors(errors);
    },
    [attachments.length, fieldsDisabled],
  );

  /** Handles ⌘V / Ctrl+V of screenshots anywhere in the dialog. Returns how many files it took. */
  const addFromPaste = useCallback(
    (event: React.ClipboardEvent) => {
      if (fieldsDisabled) return 0;
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length === 0) return 0;
      event.preventDefault();
      addFiles(files.map(namePastedFile));
      return files.length;
    },
    [addFiles, fieldsDisabled],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) revokePreview(removed);
      return prev.filter((item) => item.id !== id);
    });
    setAttachmentErrors([]);
  }, []);

  const submitRef = useRef<() => Promise<void>>(async () => {});

  const submit = useCallback(async () => {
    if (readOnly || submitting) return;
    setSubmitAttempted(true);
    if (!trimmedDescription) return;

    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set("organizationId", organizationId);
    formData.set("topic", topic);
    formData.set("description", trimmedDescription);
    if (currentPath?.trim()) formData.set("sourcePagePath", currentPath.trim());
    for (const item of attachments) formData.append("attachments", item.file);

    const failToast = (message: string) => {
      adminToast.error("Couldn't send your request.", {
        description:
          message === GENERIC_SUBMIT_ERROR
            ? "Nothing was sent. Your note and files are still here."
            : `${message} Nothing was sent — your note and files are still here.`,
        id: SUBMIT_ERROR_TOAST_ID,
        action: { label: "Retry", onClick: () => void submitRef.current() },
      });
    };

    try {
      const response = await fetch(submitEndpoint, { method: "POST", body: formData });

      if (!response.ok) {
        let message = GENERIC_SUBMIT_ERROR;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error?.trim()) message = payload.error.trim();
        } catch {
          // ignore JSON parse errors. intentionally silent
        }
        setSubmitError(message);
        failToast(message);
        if (response.status < 500) {
          void reportPortalOperationalError(
            "school_admin",
            { organizationId, operation: "support_request.submit", error: message },
            new Error(message),
            response.status,
          );
        }
        return;
      }

      const summary: SupportSentSummary = {
        topicLabel: topicLabel(topic),
        fileCount: attachments.length,
        pagePath: currentPath?.trim() || null,
      };
      adminToast.dismiss(SUBMIT_ERROR_TOAST_ID);
      adminToast.success("Support request sent.", {
        description: userEmail
          ? `We'll follow up at ${userEmail}.`
          : "We'll be in touch soon.",
        id: SUBMIT_SUCCESS_TOAST_ID,
      });
      clearFields();
      setSent(summary);
    } catch (err) {
      setSubmitError(GENERIC_SUBMIT_ERROR);
      failToast(GENERIC_SUBMIT_ERROR);
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "support_request.submit", error: GENERIC_SUBMIT_ERROR },
        err,
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    attachments,
    clearFields,
    currentPath,
    organizationId,
    readOnly,
    submitEndpoint,
    submitting,
    topic,
    trimmedDescription,
    userEmail,
  ]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  return {
    topic,
    setTopic,
    description,
    setDescription,
    attachments,
    attachmentErrors,
    addFiles,
    addFromPaste,
    removeAttachment,
    dragActive,
    setDragActive,
    submitting,
    submitError,
    submitAttempted,
    descriptionError,
    sent,
    fieldsDisabled,
    canSubmit,
    isDirty,
    submit,
    reset,
    startAnother,
  };
}

export type SupportRequestForm = ReturnType<typeof useSupportRequestForm>;
