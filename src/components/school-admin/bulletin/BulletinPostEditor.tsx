"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Upload } from "lucide-react";
import BulletinAttachmentList from "@/components/school-admin/bulletin/BulletinAttachmentList";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  audiencesIncludeProgramTargeting,
  programSelectionRequired,
} from "@/lib/school-bulletin/bulletin-audience";
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAttachmentId, setRemovingAttachmentId] = useState<string | null>(null);
  const [draftPost, setDraftPost] = useState<BulletinPost | null>(post);

  useEffect(() => {
    setTitle(post?.title ?? "");
    setBody(post?.body ?? "");
    setAudiences(post?.audiences?.length ? post.audiences : ["school_wide"]);
    setProgramIds(post?.programIds ?? []);
    setPublishedAt(toDateTimeLocalValue(post?.publishedAt));
    setExpiresAt(toDateTimeLocalValue(post?.expiresAt));
    setDraftPost(post);
  }, [post]);

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

  const savePost = async (status: BulletinPostStatus) => {
    if (programRequired && programIds.length === 0) {
      adminToast.error("Choose at least one program for program-targeted bulletins.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        body,
        audiences: normalizedAudiences,
        programIds: showProgramPicker ? programIds : [],
        status,
        publishedAt: fromDateTimeLocalValue(publishedAt),
        expiresAt: fromDateTimeLocalValue(expiresAt),
      };

      const creating = !activePost;
      const response = await fetch(
        creating
          ? `/api/school/${slug}/bulletin`
          : `/api/school/${slug}/bulletin/${activePost!.id}`,
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

      adminToast.success(
        status === "published" ? "Bulletin published" : "Bulletin saved",
      );
      setDraftPost(data.post);
      onSaved(data.post);
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activePost) return;
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch(
        `/api/school/${slug}/bulletin/${activePost.id}/attachments`,
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
    saving,
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    savePost,
    handleArchive,
    handleDelete,
    handleUpload,
    handleRemoveAttachment,
  };
}

export type BulletinPostEditorFormProps = {
  theme: ParentThemeTokens;
  programs: ProgramOption[];
  editor: ReturnType<typeof useBulletinPostEditor>;
};

export function BulletinPostEditorForm({
  theme: _theme,
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
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    handleUpload,
    handleRemoveAttachment,
  } = editor;

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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#1E2A24]">
            Publish at (optional)
          </span>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            className={fieldClassName}
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#1E2A24]">
            Expires at (optional)
          </span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className={fieldClassName}
            style={inputStyle}
          />
        </label>
      </div>

      {editingExisting && activePost ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#1E2A24]">Attachments</span>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <AdminButton
                type="button"
                theme={_theme}
                variant="soft"
                size="compact"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload files
              </AdminButton>
            </label>
          </div>
          <BulletinAttachmentList
            attachments={activePost.attachments}
            onRemove={handleRemoveAttachment}
            removingId={removingAttachmentId}
          />
        </div>
      ) : (
        <p className="text-sm text-[#65747A]">
          Save a draft first, then upload PDFs or images.
        </p>
      )}
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
