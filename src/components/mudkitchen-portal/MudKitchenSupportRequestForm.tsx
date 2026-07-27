"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = "image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif";

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

type MudKitchenSupportRequestFormProps = {
  organizationId: string;
  userEmail?: string | null;
  currentPath?: string;
  onSubmitted?: () => void;
};

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

export default function MudKitchenSupportRequestForm({
  organizationId,
  userEmail,
  currentPath,
  onSubmitted,
}: MudKitchenSupportRequestFormProps) {
  const T = MUDKITCHEN_PORTAL_THEME;
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
    setSubmitted(false);
    setAttachments((prev) => {
      for (const item of prev) revokeAttachmentPreview(item);
      return [];
    });
  }, []);

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
      errors.push(
        `Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added.`,
      );
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
      const removed = prev.find((item) => item.id === id);
      if (removed) revokeAttachmentPreview(removed);
      return prev.filter((item) => item.id !== id);
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
          if (payload.error?.trim()) message = payload.error.trim();
        } catch {
          // ignore
        }
        setSubmitError(message);
        return;
      }

      setSubmitted(true);
      setTopic("general");
      setDescription("");
      setAttachmentError(null);
      setSubmitError(null);
      setAttachments((prev) => {
        for (const item of prev) revokeAttachmentPreview(item);
        return [];
      });
      onSubmitted?.();
    } catch {
      setSubmitError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: T.pageBg,
    border: `1px solid ${T.border}`,
    color: T.textPrimary,
    borderRadius: T.radiusSm,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: T.textSecondary,
    marginBottom: 6,
  };

  if (submitted) {
    return (
      <div
        className="rounded-2xl border px-6 py-10 text-center"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: T.accentSoft, color: T.accent }}
        >
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-lg font-medium" style={{ color: T.textPrimary }}>
          Request received
        </h3>
        <p
          className="font-secondary mt-2 text-sm leading-relaxed"
          style={{ color: T.textSecondary }}
        >
          {userEmail
            ? `Thanks — we'll follow up at ${userEmail}.`
            : "Thanks — we'll be in touch soon."}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: T.accent, border: "none", cursor: "pointer" }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  const canSubmit = description.trim().length > 0 && !submitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 sm:p-7"
      style={{ backgroundColor: T.surface, borderColor: T.border }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: T.claySoft }}
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
        <div>
          <h2 className="font-heading text-lg font-medium" style={{ color: T.textPrimary }}>
            New request
          </h2>
          <p className="font-secondary text-sm" style={{ color: T.textSecondary }}>
            Tell us what&apos;s going on — screenshots help a lot.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="mk-support-topic" style={labelStyle}>
            Topic
          </label>
          <select
            id="mk-support-topic"
            value={topic}
            disabled={submitting}
            onChange={(event) => setTopic(event.target.value as TopicValue)}
            style={inputStyle}
          >
            {TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mk-support-description" style={labelStyle}>
            Description
          </label>
          <textarea
            id="mk-support-description"
            value={description}
            disabled={submitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What were you trying to do? What happened instead?"
            rows={5}
            required
            style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
          />
        </div>

        <div>
          <span style={labelStyle}>
            Attachments{" "}
            <span style={{ fontWeight: 400, color: T.textFaint }}>(optional)</span>
          </span>

          {attachments.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center"
              style={{
                borderColor: T.borderStrong,
                backgroundColor: T.pageBg,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!submitting && event.dataTransfer.files.length) {
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
            >
              <Upload className="mb-2 h-7 w-7" style={{ color: T.textFaint }} />
              <p className="text-sm font-medium" style={{ color: T.textPrimary }}>
                Drop files here or click to upload
              </p>
              <p className="mt-1 text-xs" style={{ color: T.textSecondary }}>
                Up to {MAX_FILES} files, 10 MB each
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border px-3 py-3"
              style={{ borderColor: T.border, backgroundColor: T.pageBg }}
            >
              <ul className="space-y-2">
                {attachments.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2"
                    style={{ backgroundColor: T.surface }}
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
                        style={{ color: T.textFaint }}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: T.textPrimary }}
                        title={item.file.name}
                      >
                        {item.file.name}
                      </p>
                      <p className="text-xs" style={{ color: T.textSecondary }}>
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(item.id)}
                      disabled={submitting}
                      className="shrink-0 rounded p-1"
                      style={{
                        color: T.textFaint,
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
                  className="mt-3 rounded-full border px-3 py-2 text-sm font-semibold"
                  style={{
                    borderColor: T.border,
                    backgroundColor: T.surface,
                    color: T.textPrimary,
                    cursor: "pointer",
                  }}
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
              if (event.target.files?.length) addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {attachmentError ? (
            <p className="mt-2 text-xs" style={{ color: T.clay }} role="alert">
              {attachmentError}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p className="text-sm" style={{ color: T.clay }} role="alert">
            {submitError}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{
            backgroundColor: T.accent,
            border: "none",
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
  );
}
