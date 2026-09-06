"use client";

import { useRef, useState, type ReactNode } from "react";
import { Loader2, Upload } from "lucide-react";
import BulletinAttachmentList from "@/components/school-admin/bulletin/BulletinAttachmentList";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminDateTimePicker from "@/components/school-admin/ui/SchoolAdminDateTimePicker";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  audiencesIncludeProgramTargeting,
  programSelectionRequired,
} from "@/lib/school-bulletin/bulletin-audience";
import {
  MAX_BULLETIN_ATTACHMENTS,
  prepareBulletinAttachmentForUpload,
} from "@/lib/school-bulletin/attachment-storage";
import { normalizeBulletinAudiences } from "@/lib/school-bulletin/mappers";
import type {
  BulletinAudience,
  BulletinPost,
  BulletinPostStatus,
  ProgramOption,
} from "@/lib/school-bulletin/types";

type AudienceOption = {
  value: BulletinAudience;
  label: string;
  description: string;
};

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: "school_wide",
    label: "School-wide",
    description: "Visible to all families and teachers",
  },
  {
    value: "parents",
    label: "Parents",
    description: "Families only; optionally limit to specific program portals",
  },
  {
    value: "teachers",
    label: "Teachers",
    description: "Staff only",
  },
  {
    value: "program",
    label: "Program families",
    description: "Families in selected program portals",
  },
];

function toggleAudienceSelection(
  current: BulletinAudience[],
  audience: BulletinAudience,
): BulletinAudience[] {
  if (current.includes(audience)) {
    if (current.length === 1) return current;
    return current.filter((value) => value !== audience);
  }
  return [...current, audience];
}

function toggleProgramSelection(current: string[], programId: string): string[] {
  if (current.includes(programId)) {
    return current.filter((id) => id !== programId);
  }
  return [...current, programId];
}

function toDateTimeLocalValue(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

type ScheduleToggleRowProps = {
  C: AdminThemeTokens;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ScheduleToggleRow({
  C,
  label,
  description,
  checked,
  onChange,
}: ScheduleToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label}. ${description}`}
      onClick={() => onChange(!checked)}
      className="flex w-full min-h-[44px] items-center justify-between gap-4 rounded-md border px-3 py-3 text-left transition-colors"
      style={{
        borderColor: checked ? C.accent : C.border,
        backgroundColor: checked ? C.accentLight : C.surface,
      }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? C.accent : C.border }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

export type UseBulletinPostEditorOptions = {
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
};

export function useBulletinPostEditor({
  slug,
  post,
  programs: _programs,
  onSaved,
  onDeleted,
}: UseBulletinPostEditorOptions) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [audiences, setAudiences] = useState<BulletinAudience[]>(
    post?.audiences?.length ? post.audiences : ["school_wide"],
  );
  const [programIds, setProgramIds] = useState<string[]>(post?.programIds ?? []);
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocalValue(post?.publishedAt));
  const [expiresAt, setExpiresAt] = useState(toDateTimeLocalValue(post?.expiresAt));
  const [publishScheduleEnabled, setPublishScheduleEnabled] = useState(() =>
    Boolean(toDateTimeLocalValue(post?.publishedAt)),
  );
  const [expiryEnabled, setExpiryEnabled] = useState(() =>
    Boolean(toDateTimeLocalValue(post?.expiresAt)),
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAttachmentId, setRemovingAttachmentId] = useState<string | null>(null);
  const [draftPost, setDraftPost] = useState<BulletinPost | null>(post);
  const postSyncKey = post ? `${post.id}:${post.updatedAt ?? ""}` : "new";
  const [prevPostSyncKey, setPrevPostSyncKey] = useState(postSyncKey);

  if (postSyncKey !== prevPostSyncKey) {
    setPrevPostSyncKey(postSyncKey);
    setTitle(post?.title ?? "");
    setBody(post?.body ?? "");
    setAudiences(post?.audiences?.length ? post.audiences : ["school_wide"]);
    setProgramIds(post?.programIds ?? []);
    const nextPublishedAt = toDateTimeLocalValue(post?.publishedAt);
    const nextExpiresAt = toDateTimeLocalValue(post?.expiresAt);
    setPublishedAt(nextPublishedAt);
    setExpiresAt(nextExpiresAt);
    setPublishScheduleEnabled(Boolean(nextPublishedAt));
    setExpiryEnabled(Boolean(nextExpiresAt));
    setDraftPost(post);
  }

  const activePost = draftPost ?? post;
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const showProgramPicker = audiencesIncludeProgramTargeting(normalizedAudiences);
  const programRequired = programSelectionRequired(normalizedAudiences);
  const editingExisting = Boolean(activePost);

  const toggleAudience = (audience: BulletinAudience) => {
    setAudiences((current) => {
      const next = toggleAudienceSelection(current, audience);
      if (!audiencesIncludeProgramTargeting(next)) {
        setProgramIds([]);
      }
      return next;
    });
  };

  const toggleProgramId = (programId: string) => {
    setProgramIds((current) => toggleProgramSelection(current, programId));
  };

  const togglePublishSchedule = (enabled: boolean) => {
    setPublishScheduleEnabled(enabled);
    if (!enabled) setPublishedAt("");
  };

  const toggleExpiry = (enabled: boolean) => {
    setExpiryEnabled(enabled);
    if (!enabled) setExpiresAt("");
  };

  const validateBeforeSave = (): boolean => {
    if (programRequired && programIds.length === 0) {
      adminToast.error("Choose at least one program for program-targeted bulletins.");
      return false;
    }
    return true;
  };

  const persistPost = async (
    status: BulletinPostStatus,
    options?: { silent?: boolean; existingPost?: BulletinPost | null },
  ): Promise<BulletinPost | null> => {
    if (!validateBeforeSave()) return null;

    const currentPost = options?.existingPost ?? draftPost ?? post;
    const payload = {
      title,
      body,
      audiences: normalizedAudiences,
      programIds: showProgramPicker ? programIds : [],
      status,
      publishedAt: fromDateTimeLocalValue(publishedAt),
      expiresAt: fromDateTimeLocalValue(expiresAt),
    };

    const creating = !currentPost;
    const response = await fetch(
      creating
        ? `/api/school/${slug}/bulletin`
        : `/api/school/${slug}/bulletin/${currentPost!.id}`,
      {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json()) as { post?: BulletinPost; error?: string };
    if (!response.ok || !data.post) {
      throw new Error(data.error ?? "Could not save bulletin post.");
    }

    if (!options?.silent) {
      adminToast.success(
        status === "published" ? "Bulletin published" : "Bulletin saved",
      );
    }

    setDraftPost(data.post);
    onSaved(data.post);
    return data.post;
  };

  const savePost = async (status: BulletinPostStatus) => {
    setSaving(true);
    try {
      await persistPost(status);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not save bulletin post."));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!activePost) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/school/${slug}/bulletin/${activePost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      const data = (await response.json()) as { post?: BulletinPost; error?: string };
      if (!response.ok || !data.post) {
        throw new Error(data.error ?? "Could not archive bulletin post.");
      }
      adminToast.success("Bulletin archived");
      setDraftPost(data.post);
      onSaved(data.post);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not archive bulletin post."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activePost || !onDeleted) return;
    if (!window.confirm("Delete this bulletin post permanently?")) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/school/${slug}/bulletin/${activePost.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete bulletin post.");
      }
      adminToast.success("Bulletin deleted");
      onDeleted();
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not delete bulletin post."));
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    if (!title.trim()) {
      adminToast.error("Add a title before uploading files.");
      return;
    }

    setUploading(true);
    try {
      let postForUpload = activePost;
      if (!postForUpload) {
        postForUpload = await persistPost("draft", { silent: true });
        if (!postForUpload) return;
      }

      const preparedFiles = await Promise.all(
        files.map((file) => prepareBulletinAttachmentForUpload(file)),
      );

      const formData = new FormData();
      for (const file of preparedFiles) {
        formData.append("files", file);
      }

      const response = await fetch(
        `/api/school/${slug}/bulletin/${postForUpload.id}/attachments`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await response.json()) as { post?: BulletinPost; error?: string };
      if (!response.ok || !data.post) {
        throw new Error(data.error ?? "Could not upload attachments.");
      }

      adminToast.success("Files uploaded");
      setDraftPost(data.post);
      onSaved(data.post);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not upload attachments."));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void uploadFiles(event.target.files ?? []);
    event.target.value = "";
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!activePost) return;
    setRemovingAttachmentId(attachmentId);
    try {
      const response = await fetch(
        `/api/school/${slug}/bulletin/${activePost.id}/attachments?attachmentId=${encodeURIComponent(attachmentId)}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { post?: BulletinPost; error?: string };
      if (!response.ok || !data.post) {
        throw new Error(data.error ?? "Could not remove attachment.");
      }
      setDraftPost(data.post);
      onSaved(data.post);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not remove attachment."));
    } finally {
      setRemovingAttachmentId(null);
    }
  };

  return {
    title,
    setTitle,
    body,
    setBody,
    audiences,
    setAudiences,
    toggleAudience,
    programIds,
    setProgramIds,
    toggleProgramId,
    publishedAt,
    setPublishedAt,
    expiresAt,
    setExpiresAt,
    publishScheduleEnabled,
    expiryEnabled,
    togglePublishSchedule,
    toggleExpiry,
    saving,
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    canUploadAttachments: Boolean(title.trim()),
    atAttachmentLimit:
      (activePost?.attachments.length ?? 0) >= MAX_BULLETIN_ATTACHMENTS,
    savePost,
    handleArchive,
    handleDelete,
    uploadFiles,
    handleFileInputChange,
    handleRemoveAttachment,
  };
}

export type BulletinPostEditorFormProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  programs: ProgramOption[];
  editor: ReturnType<typeof useBulletinPostEditor>;
};

export function BulletinPostEditorForm({
  theme,
  C,
  programs,
  editor,
}: BulletinPostEditorFormProps) {
  const {
    title,
    setTitle,
    body,
    setBody,
    audiences,
    toggleAudience,
    programIds,
    toggleProgramId,
    publishedAt,
    setPublishedAt,
    expiresAt,
    setExpiresAt,
    publishScheduleEnabled,
    expiryEnabled,
    togglePublishSchedule,
    toggleExpiry,
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    canUploadAttachments,
    atAttachmentLimit,
    uploadFiles,
    handleFileInputChange,
    handleRemoveAttachment,
  } = editor;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDisabled = uploading || !canUploadAttachments || atAttachmentLimit;

  const inputStyle: React.CSSProperties = {
    borderColor: "#DCE4DC",
    backgroundColor: "#FFFFFF",
    color: "#1E2A24",
  };

  const fieldClassName =
    "w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-[#4A6741]";

  const audienceOptionClassName = (selected: boolean) =>
    `rounded-md border px-3 py-3 text-left transition ${
      selected
        ? "border-[#4A6741] bg-[#F3F7F3]"
        : "border-[#DCE4DC] bg-white hover:border-[#B8C7B8]"
    }`;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[#1E2A24]">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={fieldClassName}
          style={inputStyle}
          placeholder="Spring festival flyer"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[#1E2A24]">Message</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
          className={fieldClassName}
          style={inputStyle}
          placeholder="Share details families and staff should know..."
        />
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-[#1E2A24]">Attachments</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={uploadDisabled}
        />
        <div
          className="flex flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center"
          style={{
            borderColor: uploadDisabled ? "#DCE4DC" : "#B8C7B8",
            backgroundColor: "#FFFFFF",
            cursor: uploadDisabled ? "not-allowed" : "pointer",
            opacity: uploadDisabled ? 0.7 : 1,
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (uploadDisabled) return;
            if (event.dataTransfer.files.length) {
              void uploadFiles(event.dataTransfer.files);
            }
          }}
          onClick={() => {
            if (!uploadDisabled) fileInputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (uploadDisabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={uploadDisabled ? -1 : 0}
          aria-disabled={uploadDisabled}
          aria-label="Upload bulletin attachments"
        >
          {uploading ? (
            <Loader2 className="mb-2 h-7 w-7 animate-spin text-[#4A6741]" />
          ) : (
            <Upload className="mb-2 h-7 w-7 text-[#78858A]" />
          )}
          <p className="text-sm font-medium text-[#1E2A24]">
            {uploading ? "Uploading files…" : "Drop files here or click to upload"}
          </p>
          <p className="mt-1 text-xs text-[#65747A]">
            PDFs or images · Up to {MAX_BULLETIN_ATTACHMENTS} files, 10 MB each
          </p>
          {!canUploadAttachments ? (
            <p className="mt-2 text-xs text-[#65747A]">Add a title to upload files.</p>
          ) : atAttachmentLimit ? (
            <p className="mt-2 text-xs text-[#65747A]">
              Maximum {MAX_BULLETIN_ATTACHMENTS} attachments reached.
            </p>
          ) : null}
        </div>
        {activePost && activePost.attachments.length > 0 ? (
          <div className="mt-3">
            <BulletinAttachmentList
              attachments={activePost.attachments}
              onRemove={handleRemoveAttachment}
              removingId={removingAttachmentId}
            />
          </div>
        ) : null}
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-[#1E2A24]">Audience</span>
        <p className="mb-2 text-xs text-[#65747A]">Select one or more audiences.</p>
        <div className="grid gap-2">
          {AUDIENCE_OPTIONS.map((option) => {
            const selected = audiences.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 ${audienceOptionClassName(selected)}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleAudience(option.value)}
                  className="mt-1"
                />
                <span>
                  <strong className="block text-sm text-[#1E2A24]">{option.label}</strong>
                  <span className="mt-1 block text-xs text-[#65747A]">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {showProgramPicker ? (
        <div>
          {programRequired ? (
            <p className="mb-2 text-xs text-[#65747A]">Choose at least one program.</p>
          ) : null}
          {programs.length === 0 ? (
            <p className="text-sm text-[#65747A]">No programs available for this school.</p>
          ) : (
            <div className="grid gap-2">
              {programs.map((program) => {
                const selected = programIds.includes(program.id);
                return (
                  <label
                    key={program.id}
                    className={`flex cursor-pointer items-start gap-3 ${audienceOptionClassName(selected)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleProgramId(program.id)}
                      className="mt-1"
                    />
                    <span>
                      <strong className="block text-sm text-[#1E2A24]">{program.name}</strong>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <ScheduleToggleRow
            C={C}
            label="Schedule publish"
            description="Publish later instead of right away"
            checked={publishScheduleEnabled}
            onChange={togglePublishSchedule}
          />
          {publishScheduleEnabled ? (
            <div className="mt-2">
              <SchoolAdminDateTimePicker
                id="bulletin-publish-at"
                value={publishedAt}
                onChange={setPublishedAt}
                C={C}
                theme={theme}
                placeholder="Select publish date…"
                timeAriaLabel="Publish time"
              />
            </div>
          ) : null}
        </div>
        <div>
          <ScheduleToggleRow
            C={C}
            label="Set expiry"
            description="Hide from feeds after this date"
            checked={expiryEnabled}
            onChange={toggleExpiry}
          />
          {expiryEnabled ? (
            <div className="mt-2">
              <SchoolAdminDateTimePicker
                id="bulletin-expires-at"
                value={expiresAt}
                onChange={setExpiresAt}
                C={C}
                theme={theme}
                placeholder="Select expiry date…"
                timeAriaLabel="Expiry time"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type BulletinPostEditorFooterProps = {
  theme: ParentThemeTokens;
  editor: ReturnType<typeof useBulletinPostEditor>;
  onDeleted?: () => void;
};

export function BulletinPostEditorFooter({
  theme,
  editor,
  onDeleted,
}: BulletinPostEditorFooterProps): ReactNode {
  const { saving, activePost, editingExisting, savePost, handleArchive, handleDelete } =
    editor;

  return (
    <>
      <AdminButton
        type="button"
        theme={theme}
        variant="soft"
        onClick={() => savePost("draft")}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save draft
      </AdminButton>
      <AdminButton
        type="button"
        theme={theme}
        onClick={() => savePost("published")}
        disabled={saving}
      >
        Publish
      </AdminButton>
      {editingExisting && activePost && activePost.status !== "archived" ? (
        <AdminButton
          type="button"
          theme={theme}
          variant="outline"
          onClick={handleArchive}
          disabled={saving}
        >
          Archive
        </AdminButton>
      ) : null}
      {editingExisting && activePost && onDeleted ? (
        <AdminButton
          type="button"
          theme={theme}
          variant="danger"
          onClick={handleDelete}
          disabled={saving}
        >
          Delete
        </AdminButton>
      ) : null}
    </>
  );
}

export function bulletinEditorSheetTitle(isNew: boolean, post: BulletinPost | null): string {
  if (isNew) return "New bulletin post";
  return post?.title?.trim() || "Bulletin post";
}

export function bulletinEditorSheetSubtitle(isNew: boolean): string {
  if (isNew) {
    return "Draft announcements for families and staff.";
  }
  return "Update audience, schedule, and attachments.";
}
