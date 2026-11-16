"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Archive,
  CalendarClock,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import BulletinAttachmentList from "@/components/school-admin/bulletin/BulletinAttachmentList";
import SchoolAdminDateTimePicker from "@/components/school-admin/ui/SchoolAdminDateTimePicker";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { useAdminConfirm } from "@/components/school-admin/garden/useAdminConfirm";
import {
  BusyLabel,
  GardenField,
  GardenNotice,
  GardenNumberedSection,
  GardenSwitch,
  gBtnOutlineXs,
  gInputClass,
  useRelativeTime,
} from "@/components/school-admin/garden/kit";
import { G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  audiencesIncludeProgramTargeting,
  formatBulletinAudiencesLabel,
  programSelectionRequired,
  resolveBulletinDisplayStatus,
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

export function formatBulletinDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

/** Who sees a post with these audiences, as a sentence fragment. */
export function bulletinWhereLabel(audiences: BulletinAudience[]): string {
  const normalized = normalizeBulletinAudiences(audiences);
  const families =
    normalized.includes("school_wide") || normalized.includes("parents") || normalized.includes("program");
  const teachers = normalized.includes("school_wide") || normalized.includes("teachers");
  if (families && teachers) return "parent and teacher home pages";
  if (teachers) return "teacher home pages";
  return "parent home pages";
}

export type UseBulletinPostEditorOptions = {
  organizationId: string;
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
  C: AdminThemeTokens;
};

/*
 * Bulletin editor controller. Same API calls as before (POST/PATCH/DELETE
 * /api/school/{slug}/bulletin[/id], attachments upload/remove); every action
 * now goes through the Garden feedback contract (busy button, toast pair,
 * Retry) and validation shows next to the field it's about.
 */
export function useBulletinPostEditor({
  organizationId,
  slug,
  post,
  programs,
  onSaved,
  onDeleted,
  C,
}: UseBulletinPostEditorOptions) {
  const action = useAdminAction();
  const { confirm, dialog: confirmDialog } = useAdminConfirm(C);
  const [title, setTitleState] = useState(post?.title ?? "");
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
  const [titleError, setTitleError] = useState<string | null>(null);
  const [programError, setProgramError] = useState<string | null>(null);
  const [draftPost, setDraftPost] = useState<BulletinPost | null>(post);
  const postSyncKey = post ? `${post.id}:${post.updatedAt ?? ""}` : "new";
  const [prevPostSyncKey, setPrevPostSyncKey] = useState(postSyncKey);

  const syncFrom = (source: BulletinPost | null) => {
    setTitleState(source?.title ?? "");
    setBody(source?.body ?? "");
    setAudiences(source?.audiences?.length ? source.audiences : ["school_wide"]);
    setProgramIds(source?.programIds ?? []);
    const nextPublishedAt = toDateTimeLocalValue(source?.publishedAt);
    const nextExpiresAt = toDateTimeLocalValue(source?.expiresAt);
    setPublishedAt(nextPublishedAt);
    setExpiresAt(nextExpiresAt);
    setPublishScheduleEnabled(Boolean(nextPublishedAt));
    setExpiryEnabled(Boolean(nextExpiresAt));
    setTitleError(null);
    setProgramError(null);
  };

  if (postSyncKey !== prevPostSyncKey) {
    setPrevPostSyncKey(postSyncKey);
    syncFrom(post);
    setDraftPost(post);
  }

  const activePost = draftPost ?? post;
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const showProgramPicker = audiencesIncludeProgramTargeting(normalizedAudiences);
  const programRequired = programSelectionRequired(normalizedAudiences);
  const editingExisting = Boolean(activePost);
  const programNameById = useMemo(
    () => new Map(programs.map((program) => [program.id, program.name])),
    [programs],
  );

  const isDirty = (() => {
    const base = activePost;
    const baseAudiences = base?.audiences?.length ? base.audiences : ["school_wide"];
    return (
      title !== (base?.title ?? "") ||
      body !== (base?.body ?? "") ||
      !sameSet(normalizedAudiences, normalizeBulletinAudiences(baseAudiences as BulletinAudience[])) ||
      !sameSet(showProgramPicker ? programIds : [], base?.programIds ?? []) ||
      publishedAt !== toDateTimeLocalValue(base?.publishedAt) ||
      expiresAt !== toDateTimeLocalValue(base?.expiresAt)
    );
  })();

  const setTitle = (value: string) => {
    setTitleState(value);
    if (titleError && value.trim()) setTitleError(null);
  };

  const toggleAudience = (audience: BulletinAudience) => {
    setAudiences((current) => {
      const next = toggleAudienceSelection(current, audience);
      if (!audiencesIncludeProgramTargeting(next)) {
        setProgramIds([]);
        setProgramError(null);
      }
      return next;
    });
  };

  const toggleProgramId = (programId: string) => {
    setProgramIds((current) => toggleProgramSelection(current, programId));
    setProgramError(null);
  };

  const togglePublishSchedule = (enabled: boolean) => {
    setPublishScheduleEnabled(enabled);
    if (!enabled) setPublishedAt("");
  };

  const toggleExpiry = (enabled: boolean) => {
    setExpiryEnabled(enabled);
    if (!enabled) setExpiresAt("");
  };

  const focusField = (id: string) => {
    window.setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
    }, 30);
  };

  const validateBeforeSave = (): boolean => {
    if (!title.trim()) {
      setTitleError("Add a title so families know what this is about.");
      focusField("bulletin-title");
      return false;
    }
    if (programRequired && programIds.length === 0) {
      setProgramError("Choose at least one program for program-targeted bulletins.");
      focusField("bulletin-programs");
      return false;
    }
    return true;
  };

  const persistPost = async (
    status: BulletinPostStatus,
    options?: { existingPost?: BulletinPost | null },
  ): Promise<BulletinPost> => {
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

    setDraftPost(data.post);
    onSaved(data.post);
    return data.post;
  };

  const report = (operation: string, error: unknown) => {
    void reportPortalOperationalError(
      "school_admin",
      { organizationId, operation, error: "" },
      error,
    );
  };

  const savePost = async (status: BulletinPostStatus) => {
    if (!validateBeforeSave()) return;
    const publishing = status === "published";
    const wasPublished = activePost?.status === "published";
    await action.run(
      async () => {
        try {
          return await persistPost(status);
        } catch (error) {
          report("bulletin.save", error);
          throw error;
        }
      },
      {
        key: publishing ? "bulletin-publish" : "bulletin-draft",
        id: "bulletin-save",
        success: (saved) => {
          if (!publishing) {
            return {
              title: wasPublished ? "Moved to drafts." : "Draft saved.",
              description: wasPublished
                ? `It's off ${bulletinWhereLabel(saved.audiences)} until you publish again.`
                : "Only admins can see it until you publish.",
            };
          }
          const audienceLabel = formatBulletinAudiencesLabel(saved.audiences, programNameById, saved.programIds);
          const display = resolveBulletinDisplayStatus(saved);
          if (display === "scheduled") {
            return {
              title: `Scheduled for ${formatBulletinDate(saved.publishedAt)}.`,
              description: `It goes to ${audienceLabel} on its own at that time.`,
            };
          }
          if (display === "expired") {
            return {
              title: "Bulletin published.",
              description: "Its expiry date has already passed, so it won't show in feeds. Change the expiry to show it.",
            };
          }
          return {
            title: wasPublished ? "Bulletin updated." : "Bulletin published.",
            description: `${audienceLabel} can see it on ${bulletinWhereLabel(saved.audiences)} now.`,
          };
        },
        error: publishing
          ? {
              title: "Couldn't publish the post.",
              description: "It hasn't gone out to anyone. Your edits are still here.",
              fallback: "Could not save bulletin post.",
            }
          : {
              title: "Couldn't save the draft.",
              description: "Your edits are still here.",
              fallback: "Could not save bulletin post.",
            },
      },
    );
  };

  const handleArchive = async () => {
    if (!activePost) return;
    const target = activePost;
    await action.run(
      async () => {
        try {
          const response = await fetch(`/api/school/${slug}/bulletin/${target.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          });
          const data = (await response.json()) as { post?: BulletinPost; error?: string };
          if (!response.ok || !data.post) {
            throw new Error(data.error ?? "Could not archive bulletin post.");
          }
          setDraftPost(data.post);
          onSaved(data.post);
          return data.post;
        } catch (error) {
          report("bulletin.archive", error);
          throw error;
        }
      },
      {
        key: "bulletin-archive",
        success: (archived) => ({
          title: "Bulletin archived.",
          description: `It's off ${bulletinWhereLabel(archived.audiences)}. Find it under Archived.`,
        }),
        error: {
          title: "Couldn't archive the post.",
          description: "It's still showing where it was.",
          fallback: "Could not archive bulletin post.",
        },
      },
    );
  };

  const handleDelete = async () => {
    if (!activePost || !onDeleted) return;
    const target = activePost;
    const ok = await confirm({
      title: `Delete “${target.title || "this post"}”?`,
      description: "Families and teachers stop seeing it, and its attachments are removed. This can't be undone.",
      confirmLabel: "Delete post",
    });
    if (!ok) return;

    await action.run(
      async () => {
        try {
          const response = await fetch(`/api/school/${slug}/bulletin/${target.id}`, {
            method: "DELETE",
          });
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Could not delete bulletin post.");
          }
          onDeleted();
        } catch (error) {
          report("bulletin.delete", error);
          throw error;
        }
      },
      {
        key: "bulletin-delete",
        success: { title: "Bulletin deleted.", description: "It's gone from every feed." },
        error: {
          title: "Couldn't delete the post.",
          description: "It's still here.",
          fallback: "Could not delete bulletin post.",
        },
      },
    );
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    if (!title.trim()) {
      setTitleError("Add a title before uploading files.");
      focusField("bulletin-title");
      return;
    }
    if (programRequired && programIds.length === 0) {
      // Uploading a new post saves it as a draft first; same rule applies.
      if (!activePost) {
        setProgramError("Choose at least one program for program-targeted bulletins.");
        focusField("bulletin-programs");
        return;
      }
    }

    await action.run(
      async () => {
        try {
          let postForUpload = activePost;
          if (!postForUpload) {
            postForUpload = await persistPost("draft");
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

          setDraftPost(data.post);
          onSaved(data.post);
          return { post: data.post, created: !activePost };
        } catch (error) {
          report("bulletin.upload_attachments", error);
          throw error;
        }
      },
      {
        key: "bulletin-upload",
        success: ({ post: uploaded, created }) => ({
          title: `${files.length} ${files.length === 1 ? "file" : "files"} attached.`,
          description: `${uploaded.attachments.length} of ${MAX_BULLETIN_ATTACHMENTS} attachments used${
            created ? " · saved as a draft so the files have a home" : ""
          }.`,
        }),
        error: {
          title: "Couldn't upload those files.",
          description: "Nothing was attached.",
          fallback: "Could not upload attachments.",
        },
      },
    );
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void uploadFiles(event.target.files ?? []);
    event.target.value = "";
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!activePost) return;
    const target = activePost;
    const fileName = target.attachments.find((a) => a.id === attachmentId)?.fileName ?? "File";
    await action.run(
      async () => {
        try {
          const response = await fetch(
            `/api/school/${slug}/bulletin/${target.id}/attachments?attachmentId=${encodeURIComponent(attachmentId)}`,
            { method: "DELETE" },
          );
          const data = (await response.json()) as { post?: BulletinPost; error?: string };
          if (!response.ok || !data.post) {
            throw new Error(data.error ?? "Could not remove attachment.");
          }
          setDraftPost(data.post);
          onSaved(data.post);
        } catch (error) {
          report("bulletin.remove_attachment", error);
          throw error;
        }
      },
      {
        key: `bulletin-attachment-remove:${attachmentId}`,
        success: { title: `${fileName} removed.` },
        error: {
          title: "Couldn't remove that file.",
          description: "It's still attached.",
          fallback: "Could not remove attachment.",
        },
      },
    );
  };

  /** Close, asking first when there are unsaved edits. */
  const requestClose = async (close: () => void) => {
    if (isDirty && action.pendingKey == null) {
      const ok = await confirm({
        title: "Discard your changes?",
        description: "Your edits to this post haven't been saved.",
        confirmLabel: "Discard changes",
        cancelLabel: "Keep editing",
      });
      if (!ok) return;
      syncFrom(activePost);
    }
    close();
  };

  const pendingKey = action.pendingKey;
  const saving =
    pendingKey === "bulletin-draft" ||
    pendingKey === "bulletin-publish" ||
    pendingKey === "bulletin-archive" ||
    pendingKey === "bulletin-delete";

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
    pendingKey,
    busy: pendingKey != null,
    uploading: pendingKey === "bulletin-upload",
    removingAttachmentId: pendingKey?.startsWith("bulletin-attachment-remove:")
      ? pendingKey.slice("bulletin-attachment-remove:".length)
      : null,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    isDirty,
    titleError,
    programError,
    programNameById,
    normalizedAudiences,
    canUploadAttachments: Boolean(title.trim()),
    atAttachmentLimit:
      (activePost?.attachments.length ?? 0) >= MAX_BULLETIN_ATTACHMENTS,
    savePost,
    handleArchive,
    handleDelete,
    uploadFiles,
    handleFileInputChange,
    handleRemoveAttachment,
    requestClose,
    confirmDialog,
  };
}

export type BulletinPostEditorState = ReturnType<typeof useBulletinPostEditor>;

export type BulletinPostEditorFormProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  programs: ProgramOption[];
  editor: BulletinPostEditorState;
};

const CHOICE_CARD = `flex w-full cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] px-3.5 py-3 text-left transition-all duration-200 ${G_FOCUS}`;
const choiceCardState = (selected: boolean) =>
  selected
    ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] shadow-[0_2px_0_0_var(--sf-ink)]"
    : "border-[var(--sf-ink)]/15 bg-white hover:border-[var(--sf-ink)]/35";

function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 text-[11px] font-black ${
        checked ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/30 bg-white"
      }`}
    >
      {checked ? "✓" : ""}
    </span>
  );
}

/** The guided Garden form: 1 Write · 2 Attach · 3 Audience · 4 When, plus a live summary. */
export function BulletinPostEditorForm({ theme, C, programs, editor }: BulletinPostEditorFormProps) {
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
    titleError,
    programError,
    busy,
  } = editor;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const uploadDisabled = uploading || !canUploadAttachments || atAttachmentLimit;
  const attachmentCount = activePost?.attachments.length ?? 0;
  const whenDone =
    (!publishScheduleEnabled || Boolean(publishedAt)) && (!expiryEnabled || Boolean(expiresAt));

  return (
    <div className="flex flex-col gap-7">
      <GardenNumberedSection
        step={1}
        title="Write it"
        description="A clear title and a few lines families can act on."
        done={Boolean(title.trim())}
        id="bulletin-step-write"
      >
        <div className="flex flex-col gap-4">
          <GardenField id="bulletin-title" label="Title" required error={titleError} counter={{ value: title.length, max: 120 }}>
            <input
              id="bulletin-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={gInputClass(titleError)}
              placeholder="Spring festival flyer"
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? "bulletin-title-error" : undefined}
              data-garden-skip
              data-testid="bulletin-title"
            />
          </GardenField>
          <GardenField id="bulletin-body" label="Message" optional>
            <textarea
              id="bulletin-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className={gInputClass(null, "min-h-[140px] resize-y leading-relaxed")}
              placeholder="Share details families and staff should know..."
              data-garden-skip
              data-testid="bulletin-body"
            />
          </GardenField>
        </div>
      </GardenNumberedSection>

      <GardenNumberedSection
        step={2}
        title="Attach a flyer"
        description={`Optional · PDFs or images · up to ${MAX_BULLETIN_ATTACHMENTS} files, 10 MB each`}
        done={attachmentCount > 0}
        id="bulletin-step-attach"
        action={
          attachmentCount > 0 ? (
            <span className="text-[12px] font-extrabold tabular-nums text-[var(--sf-soft)]">
              {attachmentCount}/{MAX_BULLETIN_ATTACHMENTS}
            </span>
          ) : undefined
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={uploadDisabled}
          data-garden-skip
        />
        <div
          className={`flex flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed px-4 py-7 text-center transition-colors ${G_FOCUS} ${
            uploadDisabled
              ? "cursor-not-allowed border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] opacity-75"
              : dragOver
                ? "cursor-copy border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                : "cursor-pointer border-[var(--sf-ink)]/22 bg-[var(--sf-paper)] hover:border-[var(--sf-clay)]/60 hover:bg-[var(--sf-accent-wash)]"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploadDisabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
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
          aria-busy={uploading || undefined}
          aria-label="Upload bulletin attachments"
          data-testid="bulletin-dropzone"
        >
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 bg-white"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--sf-clay)]" />
            ) : (
              <Upload className="h-5 w-5 text-[var(--sf-ink)]/70" />
            )}
          </span>
          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]" aria-live="polite">
            {uploading ? "Uploading files…" : dragOver ? "Drop to attach" : "Drop files here or click to upload"}
          </p>
          <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
            {!canUploadAttachments
              ? "Add a title first — new posts are saved as a draft when you attach."
              : atAttachmentLimit
                ? `Maximum ${MAX_BULLETIN_ATTACHMENTS} attachments reached. Remove one to add another.`
                : "Large images are resized before upload."}
          </p>
        </div>
        {activePost && activePost.attachments.length > 0 ? (
          <div className="mt-3">
            <BulletinAttachmentList
              attachments={activePost.attachments}
              onRemove={handleRemoveAttachment}
              removingId={removingAttachmentId}
              disabled={busy}
            />
          </div>
        ) : null}
      </GardenNumberedSection>

      <GardenNumberedSection
        step={3}
        title="Choose who sees it"
        description="Select one or more audiences."
        done={!programRequired || programIds.length > 0}
        id="bulletin-step-audience"
      >
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Audience">
          {AUDIENCE_OPTIONS.map((option) => {
            const selected = audiences.includes(option.value);
            const onlyOne = selected && audiences.length === 1;
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={selected}
                aria-describedby={`bulletin-audience-${option.value}-desc`}
                title={onlyOne ? "Keep at least one audience" : undefined}
                onClick={() => toggleAudience(option.value)}
                className={`${CHOICE_CARD} ${choiceCardState(selected)}`}
                data-testid={`bulletin-audience-${option.value}`}
              >
                <CheckDot checked={selected} />
                <span className="min-w-0">
                  <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{option.label}</span>
                  <span
                    id={`bulletin-audience-${option.value}-desc`}
                    className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]"
                  >
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {showProgramPicker ? (
          <div className="mt-4" id="bulletin-programs" tabIndex={-1}>
            <p className="m-0 mb-2 text-[13px] font-extrabold text-[var(--sf-ink)]">
              Programs
              {programRequired ? (
                <span className="ml-1.5 text-[12px] font-bold text-[var(--sf-soft)]">Choose at least one</span>
              ) : (
                <span className="ml-1.5 text-[12px] font-bold text-[var(--sf-soft)]">Optional — leave empty for all families</span>
              )}
            </p>
            {programs.length === 0 ? (
              <GardenNotice tone="info">No programs available for this school.</GardenNotice>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Programs">
                {programs.map((program) => {
                  const selected = programIds.includes(program.id);
                  return (
                    <button
                      key={program.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() => toggleProgramId(program.id)}
                      className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-extrabold transition-all ${G_FOCUS} ${
                        selected
                          ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                          : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/45"
                      }`}
                    >
                      {selected ? <span aria-hidden>✓</span> : null}
                      {program.name}
                    </button>
                  );
                })}
              </div>
            )}
            {programError ? (
              <p role="alert" className="m-0 mt-2 text-[12.5px] font-bold text-[#9a3422]">
                {programError}
              </p>
            ) : null}
          </div>
        ) : null}
      </GardenNumberedSection>

      <GardenNumberedSection
        step={4}
        title="Pick when"
        description="Publish now or later, and hide it when it's no longer relevant."
        done={whenDone}
        id="bulletin-step-when"
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
            <GardenSwitch
              checked={publishScheduleEnabled}
              onChange={togglePublishSchedule}
              label="Schedule publish"
              description="Publish later instead of right away"
              data-testid="bulletin-schedule-switch"
            />
            {publishScheduleEnabled ? (
              <div className="mt-3">
                <SchoolAdminDateTimePicker
                  id="bulletin-publish-at"
                  value={publishedAt}
                  onChange={setPublishedAt}
                  C={C}
                  theme={theme}
                  placeholder="Select publish date…"
                  timeAriaLabel="Publish time"
                  ariaLabel="Publish date and time"
                />
              </div>
            ) : null}
          </div>
          <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
            <GardenSwitch
              checked={expiryEnabled}
              onChange={toggleExpiry}
              label="Set expiry"
              description="Hide from feeds after this date"
              data-testid="bulletin-expiry-switch"
            />
            {expiryEnabled ? (
              <div className="mt-3">
                <SchoolAdminDateTimePicker
                  id="bulletin-expires-at"
                  value={expiresAt}
                  onChange={setExpiresAt}
                  C={C}
                  theme={theme}
                  placeholder="Select expiry date…"
                  timeAriaLabel="Expiry time"
                  ariaLabel="Expiry date and time"
                />
              </div>
            ) : null}
          </div>
        </div>
      </GardenNumberedSection>

      <BulletinPublishSummary editor={editor} />
    </div>
  );
}

/** "What happens when you publish": every line comes from the form. */
function BulletinPublishSummary({ editor }: { editor: BulletinPostEditorState }) {
  const {
    normalizedAudiences,
    programIds,
    showProgramPicker,
    programNameById,
    publishScheduleEnabled,
    publishedAt,
    expiryEnabled,
    expiresAt,
    activePost,
  } = editor;
  const audienceLabel = formatBulletinAudiencesLabel(
    normalizedAudiences,
    programNameById,
    showProgramPicker ? programIds : [],
  );
  const publishIso = publishScheduleEnabled ? fromDateTimeLocalValue(publishedAt) : null;
  const expiryIso = expiryEnabled ? fromDateTimeLocalValue(expiresAt) : null;
  const scheduledLater = publishIso ? new Date(publishIso) > new Date() : false;
  const attachments = activePost?.attachments.length ?? 0;

  const lines: { icon: typeof Users; text: ReactNode }[] = [
    { icon: Users, text: <>Goes to <b>{audienceLabel}</b> on {bulletinWhereLabel(normalizedAudiences)}.</> },
    {
      icon: CalendarClock,
      text: scheduledLater ? (
        <>Goes live on its own <b>{formatBulletinDate(publishIso)}</b>.</>
      ) : publishScheduleEnabled && !publishIso ? (
        <>Pick a publish date, or turn off scheduling to publish right away.</>
      ) : (
        <>Goes live <b>as soon as you publish</b>.</>
      ),
    },
    {
      icon: Eye,
      text: expiryIso ? (
        <>Hides from feeds after <b>{formatBulletinDate(expiryIso)}</b>.</>
      ) : (
        <>Stays up until you archive it.</>
      ),
    },
    {
      icon: Paperclip,
      text: attachments > 0 ? <>{attachments} {attachments === 1 ? "file" : "files"} attached.</> : <>No files attached.</>,
    },
  ];

  return (
    <section
      aria-labelledby="bulletin-summary-title"
      className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-accent-wash)] p-4"
      data-testid="bulletin-publish-summary"
    >
      <h3 id="bulletin-summary-title" className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
        What happens when you publish
      </h3>
      <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
        {lines.map(({ icon: Icon, text }, index) => (
          <li key={index} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/85">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type BulletinPostEditorFooterProps = {
  theme: ParentThemeTokens;
  editor: BulletinPostEditorState;
  onDeleted?: () => void;
};

/** Footer: status line, Archive / Delete, Save draft, and the one toy Publish. */
export function BulletinPostEditorFooter({ editor, onDeleted }: BulletinPostEditorFooterProps): ReactNode {
  const {
    pendingKey,
    busy,
    activePost,
    editingExisting,
    savePost,
    handleArchive,
    handleDelete,
    isDirty,
    publishScheduleEnabled,
    publishedAt,
  } = editor;
  const updatedAt = activePost?.updatedAt ? Date.parse(activePost.updatedAt) : 0;
  const relative = useRelativeTime(updatedAt);
  const published = activePost?.status === "published";
  const publishIso = publishScheduleEnabled ? fromDateTimeLocalValue(publishedAt) : null;
  const scheduling = publishIso ? new Date(publishIso) > new Date() : false;
  const primaryLabel = scheduling ? "Schedule" : published ? "Update post" : "Publish";
  const primaryBusyLabel = scheduling ? "Scheduling…" : published ? "Updating…" : "Publishing…";

  const status = isDirty
    ? "Unsaved changes"
    : activePost
      ? `Saved ${relative}`
      : "Not saved yet";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--sf-soft)]" aria-live="polite">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${isDirty ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-forest)]/60"}`}
          />
          {status}
        </p>
        {editingExisting && activePost ? (
          <div className="flex items-center gap-1.5">
            {activePost.status !== "archived" ? (
              <button
                type="button"
                className={gBtnOutlineXs}
                onClick={() => void handleArchive()}
                disabled={busy}
                aria-busy={pendingKey === "bulletin-archive" || undefined}
                data-testid="bulletin-archive"
              >
                <BusyLabel busy={pendingKey === "bulletin-archive"} busyLabel="Archiving…" icon={<Archive className="h-3.5 w-3.5" aria-hidden />}>
                  Archive
                </BusyLabel>
              </button>
            ) : null}
            {onDeleted ? (
              <button
                type="button"
                className={`${gBtnOutlineXs} !border-[#b4412f]/35 !text-[#9a3422] hover:!bg-[#fdf0ec]`}
                onClick={() => void handleDelete()}
                disabled={busy}
                aria-busy={pendingKey === "bulletin-delete" || undefined}
                data-testid="bulletin-delete"
              >
                <BusyLabel busy={pendingKey === "bulletin-delete"} busyLabel="Deleting…" icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}>
                  Delete
                </BusyLabel>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className={gBtnOutlineSm}
          onClick={() => void savePost("draft")}
          disabled={busy}
          aria-busy={pendingKey === "bulletin-draft" || undefined}
          data-testid="bulletin-save-draft"
        >
          <BusyLabel busy={pendingKey === "bulletin-draft"} busyLabel="Saving…" icon={<FileText className="h-4 w-4" aria-hidden />}>
            {published ? "Move to drafts" : "Save draft"}
          </BusyLabel>
        </button>
        <button
          type="button"
          className={gBtnPopSm}
          onClick={() => void savePost("published")}
          disabled={busy}
          aria-busy={pendingKey === "bulletin-publish" || undefined}
          data-testid="bulletin-publish"
        >
          <BusyLabel
            busy={pendingKey === "bulletin-publish"}
            busyLabel={primaryBusyLabel}
            icon={scheduling ? <CalendarClock className="h-4 w-4" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          >
            {primaryLabel}
          </BusyLabel>
        </button>
      </div>
    </div>
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
